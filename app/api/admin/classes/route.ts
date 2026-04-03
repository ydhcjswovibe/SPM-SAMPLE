import { type NextRequest, NextResponse } from 'next/server'

import {
  buildGeneratedSessionsFromRules,
  isMissingRelationMessage,
  normalizeTimeValue,
  normalizeWeekdayValue,
} from '@/lib/class-schedule'
import { getCurrentYearMonth } from '@/lib/date-selection'
import { isAdminRole, isOwnerRole } from '@/lib/auth/roles'
import { isValidYearMonth } from '@/lib/admin/matrix'
import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'

function mapCreateClassError(message: string) {
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return { error: 'OWNER_REQUIRED', status: 403 }
  }

  if (message.includes('invalid schedule rule')) {
    return { error: 'INVALID_SCHEDULE_INPUT', status: 400 }
  }

  if (isMissingRelationMessage(message)) {
    return { error: 'SCHEDULE_FEATURE_UNAVAILABLE', status: 503 }
  }

  return { error: 'CLASS_CREATE_FAILED', status: 500 }
}

function mapDeleteClassError(message: string) {
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return { error: 'OWNER_REQUIRED', status: 403 }
  }

  if (message.includes('invalid input syntax')) {
    return { error: 'CLASS_NOT_FOUND', status: 404 }
  }

  return { error: 'CLASS_DELETE_FAILED', status: 500 }
}

export async function GET(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const yearMonth = request.nextUrl.searchParams.get('yearMonth')
  const includeInactive = request.nextUrl.searchParams.get('includeInactive') === '1'

  if (yearMonth && !isValidYearMonth(yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  if (includeInactive && !isOwnerRole(access.role)) {
    return NextResponse.json({ error: 'OWNER_REQUIRED' }, { status: 403 })
  }

  try {
    const supabase = await createClient()

    if (yearMonth) {
      const { data: enrollmentRows, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('class_id')
        .eq('year_month', yearMonth)

      if (enrollmentError) {
        return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
      }

      const enrolledClassIds = new Set(
        (enrollmentRows ?? []).map((row) => row.class_id).filter((value): value is string => Boolean(value)),
      )

      const { data, error } = await supabase
        .from('classes')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
      }

      const sorted = [...(data ?? [])].sort((left, right) => {
        const leftRank = enrolledClassIds.has(left.id) ? 0 : 1
        const rightRank = enrolledClassIds.has(right.id) ? 0 : 1

        if (leftRank !== rightRank) {
          return leftRank - rightRank
        }

        return left.name.localeCompare(right.name, 'ko')
      })

      return NextResponse.json({ data: sorted })
    }

    let query = supabase
      .from('classes')
      .select('id, name, is_active')
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
    }

    const sorted = [...(data ?? [])].sort((left, right) => {
      const leftRank = left.is_active === false ? 1 : 0
      const rightRank = right.is_active === false ? 1 : 0

      if (leftRank !== rightRank) {
        return leftRank - rightRank
      }

      return left.name.localeCompare(right.name, 'ko')
    })

    return NextResponse.json({ data: sorted })
  } catch (error) {
    logApiError('admin.classes', 'CLASS_LIST_READ_FAILED', error, {
      yearMonth,
      includeInactive,
    })
    return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isOwnerRole(access.role)) {
    return NextResponse.json({ error: 'OWNER_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        name?: string
        scheduleRules?: Array<{
          weekday?: number
          startTime?: string
          endTime?: string | null
        }>
      }
    | null
  const name = body?.name?.trim()
  const scheduleRules =
    body?.scheduleRules
      ?.map((rule, index) => {
        const weekday = normalizeWeekdayValue(rule.weekday ?? -1)
        const startTime = normalizeTimeValue(rule.startTime)
        const endTime = normalizeTimeValue(rule.endTime ?? null)

        if (weekday === null || !startTime) {
          return null
        }

        return {
          weekday,
          startTime,
          endTime,
          isActive: true,
          sortOrder: index,
        }
      })
      .filter((value): value is { weekday: number; startTime: string; endTime: string | null; isActive: true; sortOrder: number } => Boolean(value))
      ?? []

  if (!name) {
    return NextResponse.json({ error: 'CLASS_NAME_REQUIRED' }, { status: 400 })
  }

  if (scheduleRules.length === 0) {
    return NextResponse.json({ error: 'INVALID_SCHEDULE_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name,
      })
      .select('id, name, is_active')
      .single()

    if (error) {
      const mapped = mapCreateClassError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    const createdClassId = data.id

    const { error: scheduleError } = await supabase.from('class_schedule_rules').insert(
      scheduleRules.map((rule) => ({
        class_id: createdClassId,
        weekday: rule.weekday,
        start_time: rule.startTime,
        end_time: rule.endTime,
        sort_order: rule.sortOrder,
        is_active: true,
      })),
    )

    if (scheduleError) {
      await supabase.from('classes').delete().eq('id', createdClassId)
      const mapped = mapCreateClassError(scheduleError.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    const initialSessions = buildGeneratedSessionsFromRules({
      classId: createdClassId,
      yearMonth: getCurrentYearMonth(),
      rules: scheduleRules,
    })

    if (initialSessions.length > 0) {
      const { error: sessionError } = await supabase.from('class_sessions').insert(initialSessions)

      if (sessionError) {
        await supabase.from('class_schedule_rules').delete().eq('class_id', createdClassId)
        await supabase.from('classes').delete().eq('id', createdClassId)
        const mapped = mapCreateClassError(sessionError.message)
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.classes', 'CLASS_CREATE_FAILED', error)
    return NextResponse.json({ error: 'CLASS_CREATE_FAILED' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isOwnerRole(access.role)) {
    return NextResponse.json({ error: 'OWNER_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as { classId?: string } | null

  if (!body?.classId) {
    return NextResponse.json({ error: 'CLASS_NOT_FOUND' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('classes')
      .update({ is_active: false })
      .eq('id', body.classId)
      .eq('is_active', true)
      .select('id, name, is_active')
      .maybeSingle()

    if (error) {
      const mapped = mapDeleteClassError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    if (!data) {
      return NextResponse.json({ error: 'CLASS_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.classes', 'CLASS_DELETE_FAILED', error, {
      classId: body.classId,
    })
    return NextResponse.json({ error: 'CLASS_DELETE_FAILED' }, { status: 500 })
  }
}
