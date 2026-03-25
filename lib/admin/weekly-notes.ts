import type { SupabaseClient } from '@supabase/supabase-js'

import { buildVisibleWeekNumbers, MAX_CLASS_WEEKS } from '@/lib/weekly-media'

export const ADMIN_NOTE_MEMBER_FEEDBACK_KEY = '__admin_note__'

type WeeklyNotesClassLogRow = {
  id: string
  class_id: string
  year_month: string
  week_number: number | null
  progress: string | null
  reflection: string | null
  member_feedback: Record<string, string> | null
  admin_note?: string | null
}

type EnrollmentProfileRow =
  | {
      id: string
      full_name: string | null
      email: string | null
    }
  | {
      id: string
      full_name: string | null
      email: string | null
    }[]
  | null

type WeeklyNotesEnrollmentRow = {
  student_id: string
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | null
  profiles: EnrollmentProfileRow
}

export interface WeeklyNotesStudent {
  id: string
  fullName: string
  email: string | null
  enrollmentStatus: 'ACTIVE' | 'PENDING'
}

export interface WeeklyNotesWeek {
  weekNumber: number
  logId: string | null
  progressText: string | null
  sharedFeedbackText: string | null
  adminNoteText: string | null
  memberFeedbackByStudentId: Record<string, string>
}

export interface AdminWeeklyNotesState {
  classId: string
  yearMonth: string
  students: WeeklyNotesStudent[]
  weeks: WeeklyNotesWeek[]
}

function trimNullableText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function getEnrollmentProfile(profile: EnrollmentProfileRow) {
  if (Array.isArray(profile)) {
    return profile[0] ?? null
  }

  return profile
}

function getEnrollmentStatusRank(status: WeeklyNotesStudent['enrollmentStatus']) {
  return status === 'ACTIVE' ? 0 : 1
}

export function sanitizeMemberFeedbackByStudentId(
  value: unknown,
  allowedStudentIds?: Set<string>,
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {} as Record<string, string>
  }

  const nextEntries = Object.entries(value).flatMap(([studentId, feedbackValue]) => {
    if (studentId === ADMIN_NOTE_MEMBER_FEEDBACK_KEY) {
      return []
    }

    if (allowedStudentIds && !allowedStudentIds.has(studentId)) {
      return []
    }

    if (typeof feedbackValue !== 'string') {
      return []
    }

    const trimmed = trimNullableText(feedbackValue)
    return trimmed ? [[studentId, trimmed] as const] : []
  })

  return Object.fromEntries(nextEntries)
}

export function buildStoredMemberFeedback(args: {
  memberFeedbackByStudentId: Record<string, string>
  adminNoteText: string | null
  includeAdminNoteFallback: boolean
}) {
  const nextValue = { ...args.memberFeedbackByStudentId }

  if (args.includeAdminNoteFallback && args.adminNoteText) {
    nextValue[ADMIN_NOTE_MEMBER_FEEDBACK_KEY] = args.adminNoteText
  }

  return nextValue
}

function getAdminNoteText(
  adminNote: string | null | undefined,
  memberFeedback: Record<string, string> | null | undefined,
) {
  return trimNullableText(adminNote) ?? trimNullableText(memberFeedback?.[ADMIN_NOTE_MEMBER_FEEDBACK_KEY] ?? null)
}

function buildWeeklyNotesWeek(
  weekNumber: number,
  row: WeeklyNotesClassLogRow | null,
  allowedStudentIds: Set<string>,
) {
  return {
    weekNumber,
    logId: row?.id ?? null,
    progressText: trimNullableText(row?.progress),
    sharedFeedbackText: trimNullableText(row?.reflection),
    adminNoteText: getAdminNoteText(row?.admin_note, row?.member_feedback),
    memberFeedbackByStudentId: sanitizeMemberFeedbackByStudentId(row?.member_feedback ?? {}, allowedStudentIds),
  } satisfies WeeklyNotesWeek
}

export async function readAdminWeeklyNotesState(
  supabase: SupabaseClient,
  classId: string,
  yearMonth: string,
) {
  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .maybeSingle()

  if (classError) {
    throw classError
  }

  if (!classRow) {
    return null
  }

  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from('enrollments')
    .select(
      `
        student_id,
        status,
        profiles!enrollments_student_id_fkey (
          id,
          full_name,
          email
        )
      `,
    )
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .in('status', ['ACTIVE', 'PENDING'])

  if (enrollmentError) {
    throw enrollmentError
  }

  const students = ((enrollmentRows ?? []) as WeeklyNotesEnrollmentRow[])
    .map((row) => {
      const profile = getEnrollmentProfile(row.profiles)
      const enrollmentStatus = row.status === 'PENDING' ? 'PENDING' : 'ACTIVE'

      return {
        id: row.student_id,
        fullName: profile?.full_name?.trim() || '이름 미등록',
        email: profile?.email ?? null,
        enrollmentStatus,
      } satisfies WeeklyNotesStudent
    })
    .sort((left, right) => {
      const statusCompare = getEnrollmentStatusRank(left.enrollmentStatus) - getEnrollmentStatusRank(right.enrollmentStatus)
      if (statusCompare !== 0) {
        return statusCompare
      }

      return left.fullName.localeCompare(right.fullName, 'ko')
    })

  const allowedStudentIds = new Set(students.map((student) => student.id))

  let classLogRows: WeeklyNotesClassLogRow[] | null = null
  let classLogError: { message: string } | null = null
  {
    const result = await supabase
      .from('class_logs')
      .select('id, class_id, year_month, week_number, progress, reflection, member_feedback, admin_note')
      .eq('class_id', classId)
      .eq('year_month', yearMonth)
      .order('week_number', { ascending: true })

    classLogRows = (result.data ?? null) as WeeklyNotesClassLogRow[] | null
    classLogError = result.error
  }

  if (
    classLogError &&
    (classLogError.message.includes('admin_note') || classLogError.message.includes('column'))
  ) {
    const fallback = await supabase
      .from('class_logs')
      .select('id, class_id, year_month, week_number, progress, reflection, member_feedback')
      .eq('class_id', classId)
      .eq('year_month', yearMonth)
      .order('week_number', { ascending: true })

    classLogRows = (fallback.data ?? null) as WeeklyNotesClassLogRow[] | null
    classLogError = fallback.error
  }

  if (classLogError) {
    throw classLogError
  }

  const rows = (classLogRows ?? []) as WeeklyNotesClassLogRow[]
  const rowByWeek = new Map(
    rows
      .filter((row) => typeof row.week_number === 'number')
      .map((row) => [row.week_number as number, row]),
  )

  return {
    classId,
    yearMonth,
    students,
    weeks: buildVisibleWeekNumbers(MAX_CLASS_WEEKS, MAX_CLASS_WEEKS).map((weekNumber) =>
      buildWeeklyNotesWeek(weekNumber, rowByWeek.get(weekNumber) ?? null, allowedStudentIds),
    ),
  } satisfies AdminWeeklyNotesState
}
