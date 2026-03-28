import { type NextRequest, NextResponse } from 'next/server'

import {
  ensureClassSessionsForMonth,
  formatSessionDateLabel,
  getWeekNumberFromSessionDate,
  isMissingRelationMessage,
  isValidSessionDateForYearMonth,
  normalizeTimeValue,
  normalizeWeekdayValue,
  readClassScheduleRules,
} from '@/lib/class-schedule'
import { isAdminRole, isOwnerRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'
import { isValidYearMonth } from '@/lib/admin/matrix'

function mapScheduleError(message: string) {
  if (message.includes('permission denied') || message.includes('row-level security')) {
    return { error: 'ADMIN_REQUIRED', status: 403 }
  }

  if (isMissingRelationMessage(message)) {
    return { error: 'SCHEDULE_FEATURE_UNAVAILABLE', status: 503 }
  }

  return { error: 'SCHEDULE_SAVE_FAILED', status: 500 }
}

function normalizeRuleInputs(
  value: unknown,
) {
  if (!Array.isArray(value)) {
    return null
  }

  const normalized = value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const weekday = normalizeWeekdayValue((item as { weekday?: number }).weekday ?? -1)
    const startTime = normalizeTimeValue((item as { startTime?: string }).startTime)
    const endTime = normalizeTimeValue((item as { endTime?: string | null }).endTime ?? null)

    if (weekday === null || !startTime) {
      return []
    }

    return [
      {
        weekday,
        startTime,
        endTime,
        sortOrder: index,
      },
    ]
  })

  return normalized.length > 0 ? normalized : null
}

function normalizeSessionInputs(value: unknown, classId: string, yearMonth: string) {
  if (!Array.isArray(value)) {
    return null
  }

  const normalized = value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const sessionDate = typeof (item as { sessionDate?: unknown }).sessionDate === 'string'
      ? (item as { sessionDate: string }).sessionDate.trim()
      : ''
    const startTime = normalizeTimeValue((item as { startTime?: string }).startTime)
    const endTime = normalizeTimeValue((item as { endTime?: string | null }).endTime ?? null)
    const source = (item as { source?: 'RULE' | 'MANUAL' }).source === 'RULE' ? 'RULE' : 'MANUAL'

    if (!sessionDate || !startTime || !isValidSessionDateForYearMonth(sessionDate, yearMonth)) {
      return []
    }

    return [
      {
        class_id: classId,
        year_month: yearMonth,
        week_number: getWeekNumberFromSessionDate(sessionDate),
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        source,
      },
    ]
  })

  return normalized
}

export async function GET(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const classId = request.nextUrl.searchParams.get('classId')
  const yearMonth = request.nextUrl.searchParams.get('yearMonth')

  if (!classId) {
    return NextResponse.json({ error: 'CLASS_ID_REQUIRED' }, { status: 400 })
  }

  if (!yearMonth || !isValidYearMonth(yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const rules = await readClassScheduleRules(supabase, classId)
    const sessions = await ensureClassSessionsForMonth(supabase, classId, yearMonth)

    if (rules === null || sessions === null) {
      return NextResponse.json({ error: 'SCHEDULE_FEATURE_UNAVAILABLE' }, { status: 503 })
    }

    return NextResponse.json({
      data: {
        rules,
        sessions: sessions.map((session) => ({
          id: session.id,
          sessionDate: session.sessionDate,
          startTime: session.startTime,
          endTime: session.endTime,
          source: session.source,
          surfaceLabel: formatSessionDateLabel(session.sessionDate),
        })),
        canEditRules: isOwnerRole(access.role),
      },
    })
  } catch (error) {
    logApiError('admin.class-schedule', 'SCHEDULE_READ_FAILED', error)
    return NextResponse.json({ error: 'SCHEDULE_READ_FAILED' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        classId?: string
        yearMonth?: string
        scheduleRules?: unknown
        sessions?: unknown
      }
    | null

  if (!body?.classId || !body.yearMonth || !isValidYearMonth(body.yearMonth)) {
    return NextResponse.json({ error: 'INVALID_SCHEDULE_INPUT' }, { status: 400 })
  }

  const nextRules = body.scheduleRules === undefined ? undefined : normalizeRuleInputs(body.scheduleRules)
  const nextSessions = body.sessions === undefined ? undefined : normalizeSessionInputs(body.sessions, body.classId, body.yearMonth)

  if ((body.scheduleRules !== undefined && !nextRules) || (body.sessions !== undefined && !nextSessions)) {
    return NextResponse.json({ error: 'INVALID_SCHEDULE_INPUT' }, { status: 400 })
  }

  if (body.scheduleRules !== undefined && !isOwnerRole(access.role)) {
    return NextResponse.json({ error: 'OWNER_REQUIRED' }, { status: 403 })
  }

  try {
    const supabase = await createClient()

    if (nextRules) {
      const { error: deleteRulesError } = await supabase.from('class_schedule_rules').delete().eq('class_id', body.classId)

      if (deleteRulesError) {
        const mapped = mapScheduleError(deleteRulesError.message)
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }

      const { error: insertRulesError } = await supabase.from('class_schedule_rules').insert(
        nextRules.map((rule) => ({
          class_id: body.classId,
          weekday: rule.weekday,
          start_time: rule.startTime,
          end_time: rule.endTime,
          sort_order: rule.sortOrder,
          is_active: true,
        })),
      )

      if (insertRulesError) {
        const mapped = mapScheduleError(insertRulesError.message)
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }
    }

    if (nextSessions) {
      const { error: deleteSessionsError } = await supabase
        .from('class_sessions')
        .delete()
        .eq('class_id', body.classId)
        .eq('year_month', body.yearMonth)

      if (deleteSessionsError) {
        const mapped = mapScheduleError(deleteSessionsError.message)
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }

      if (nextSessions.length > 0) {
        const { error: insertSessionsError } = await supabase.from('class_sessions').insert(nextSessions)

        if (insertSessionsError) {
          const mapped = mapScheduleError(insertSessionsError.message)
          return NextResponse.json({ error: mapped.error }, { status: mapped.status })
        }
      }
    }

    const refreshedRules = await readClassScheduleRules(supabase, body.classId)
    const refreshedSessions = await ensureClassSessionsForMonth(supabase, body.classId, body.yearMonth)

    if (refreshedRules === null || refreshedSessions === null) {
      return NextResponse.json({ error: 'SCHEDULE_FEATURE_UNAVAILABLE' }, { status: 503 })
    }

    return NextResponse.json({
      data: {
        rules: refreshedRules,
        sessions: refreshedSessions,
      },
    })
  } catch (error) {
    logApiError('admin.class-schedule', 'SCHEDULE_SAVE_FAILED', error)
    return NextResponse.json({ error: 'SCHEDULE_SAVE_FAILED' }, { status: 500 })
  }
}
