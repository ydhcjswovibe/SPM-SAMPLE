import { type NextRequest, NextResponse } from 'next/server'

import {
  buildStoredMemberFeedback,
  readAdminWeeklyNotesState,
  ADMIN_NOTE_MEMBER_FEEDBACK_KEY,
  sanitizeMemberAdminNotesByStudentId,
  sanitizeMemberFeedbackByStudentId,
} from '@/lib/admin/weekly-notes'
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
    message.includes('invalid member_feedback payload') ||
    message.includes('invalid member_admin_notes payload')
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

type ExistingWeeklyNotesRow = {
  progress: string | null
  reflection: string | null
  member_feedback: Record<string, string> | null
  member_admin_notes?: Record<string, string> | null
  admin_note?: string | null
}

async function readExistingWeeklyNotesRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  classId: string,
  yearMonth: string,
  weekNumber: number,
) {
  let row: ExistingWeeklyNotesRow | null = null
  let error: { message: string } | null = null

  {
    const result = await supabase
      .from('class_logs')
      .select('progress, reflection, member_feedback, member_admin_notes, admin_note')
      .eq('class_id', classId)
      .eq('year_month', yearMonth)
      .eq('week_number', weekNumber)
      .maybeSingle()

    row = (result.data ?? null) as ExistingWeeklyNotesRow | null
    error = result.error
  }

  if (
    error &&
    (error.message.includes('admin_note') ||
      error.message.includes('member_admin_notes') ||
      error.message.includes('column'))
  ) {
    const fallback = await supabase
      .from('class_logs')
      .select('progress, reflection, member_feedback')
      .eq('class_id', classId)
      .eq('year_month', yearMonth)
      .eq('week_number', weekNumber)
      .maybeSingle()

    row = (fallback.data ?? null) as ExistingWeeklyNotesRow | null
    error = fallback.error
  }

  if (error) {
    throw error
  }

  return row
}

function getOwnerFeedbackText(value: ExistingWeeklyNotesRow | null) {
  if (!value) {
    return null
  }

  return trimNullableText(value.admin_note) ?? trimNullableText(value.member_feedback?.[ADMIN_NOTE_MEMBER_FEEDBACK_KEY] ?? null)
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
        ownerFeedbackText?: string | null
        progressText?: string | null
        sharedFeedbackText?: string | null
        adminNoteText?: string | null
        memberFeedbackByStudentId?: Record<string, string>
        memberAdminNotesByStudentId?: Record<string, string>
      }
    | null

  if (!body?.classId || !body.yearMonth || !isValidWeekNumber(body.weekNumber ?? 0)) {
    return NextResponse.json({ error: 'INVALID_NOTES_INPUT' }, { status: 400 })
  }

  if (!isValidYearMonth(body.yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  const weekNumber = body.weekNumber as number

  try {
    const supabase = await createClient()
    const allowedStudentIds = await readAllowedStudentIds(supabase, body.classId, body.yearMonth)
    const existingRow = await readExistingWeeklyNotesRow(supabase, body.classId, body.yearMonth, weekNumber)
    const ownerFeedbackText =
      trimNullableText(body.ownerFeedbackText ?? body.adminNoteText) ?? getOwnerFeedbackText(existingRow)
    const memberFeedbackByStudentId =
      body.memberFeedbackByStudentId !== undefined
        ? sanitizeMemberFeedbackByStudentId(body.memberFeedbackByStudentId, allowedStudentIds)
        : sanitizeMemberFeedbackByStudentId(existingRow?.member_feedback ?? {}, allowedStudentIds)
    const memberAdminNotesByStudentId = sanitizeMemberAdminNotesByStudentId(
      existingRow?.member_admin_notes ?? {},
      allowedStudentIds,
    )
    const storedMemberFeedback = buildStoredMemberFeedback({
      memberFeedbackByStudentId,
      adminNoteText: ownerFeedbackText,
      includeAdminNoteFallback: true,
    })

    const { data, error } = await supabase.rpc('upsert_weekly_class_log_notes', {
      p_class_id: body.classId,
      p_year_month: body.yearMonth,
      p_week_number: weekNumber,
      p_progress: trimNullableText(existingRow?.progress ?? null),
      p_reflection: trimNullableText(existingRow?.reflection ?? null),
      p_member_feedback: storedMemberFeedback,
      p_member_admin_notes: memberAdminNotesByStudentId,
      p_admin_note: ownerFeedbackText,
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
      weekNumber,
    })
    return NextResponse.json({ error: 'NOTES_SAVE_FAILED' }, { status: 500 })
  }
}
