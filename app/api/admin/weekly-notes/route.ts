import { type NextRequest, NextResponse } from 'next/server'

import { readAdminWeeklyNotesState, sanitizeMemberFeedbackByStudentId } from '@/lib/admin/weekly-notes'
import { isAdminRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'
import { isValidWeekNumber, isValidYearMonth } from '@/lib/weekly-media'

function trimNullableText(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function mapNotesError(message: string) {
  if (message.includes('permission denied') || message.includes('row-level security')) {
    return { error: 'ADMIN_REQUIRED', status: 403 }
  }

  if (
    message.includes('invalid week number') ||
    message.includes('invalid year_month') ||
    message.includes('invalid member_feedback payload')
  ) {
    return { error: 'INVALID_NOTES_INPUT', status: 400 }
  }

  return { error: 'NOTES_SAVE_FAILED', status: 500 }
}
async function ensureAdminAccess() {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  return null
}

async function readAllowedStudentIds(supabase: Awaited<ReturnType<typeof createClient>>, classId: string, yearMonth: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .in('status', ['ACTIVE', 'PENDING'])

  if (error) {
    throw error
  }

  return new Set((data ?? []).map((row) => row.student_id))
}

export async function GET(request: NextRequest) {
  const denied = await ensureAdminAccess()
  if (denied) return denied

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
    const data = await readAdminWeeklyNotesState(supabase, classId, yearMonth)

    if (!data) {
      return NextResponse.json({ error: 'CLASS_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.weekly-notes', 'NOTES_READ_FAILED', error, {
      classId,
      yearMonth,
    })
    return NextResponse.json({ error: 'NOTES_READ_FAILED' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await ensureAdminAccess()
  if (denied) return denied

  const body = (await request.json().catch(() => null)) as
    | {
        classId?: string
        yearMonth?: string
        weekNumber?: number
        progressText?: string | null
        sharedFeedbackText?: string | null
        adminNoteText?: string | null
        memberFeedbackByStudentId?: Record<string, string>
      }
    | null

  if (!body?.classId || !body.yearMonth || !isValidWeekNumber(body.weekNumber ?? 0)) {
    return NextResponse.json({ error: 'INVALID_NOTES_INPUT' }, { status: 400 })
  }

  if (!isValidYearMonth(body.yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const allowedStudentIds = await readAllowedStudentIds(supabase, body.classId, body.yearMonth)
    const adminNoteText = trimNullableText(body.adminNoteText)
    const memberFeedbackByStudentId = sanitizeMemberFeedbackByStudentId(
      body.memberFeedbackByStudentId,
      allowedStudentIds,
    )

    const { data, error } = await supabase.rpc('upsert_weekly_class_log_notes', {
      p_class_id: body.classId,
      p_year_month: body.yearMonth,
      p_week_number: body.weekNumber,
      p_progress: trimNullableText(body.progressText),
      p_reflection: trimNullableText(body.sharedFeedbackText),
      p_member_feedback: memberFeedbackByStudentId,
      p_admin_note: adminNoteText,
    })

    if (error) {
      const mapped = mapNotesError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.weekly-notes', 'NOTES_SAVE_FAILED', error, {
      classId: body.classId,
      yearMonth: body.yearMonth,
      weekNumber: body.weekNumber,
    })
    return NextResponse.json({ error: 'NOTES_SAVE_FAILED' }, { status: 500 })
  }
}
