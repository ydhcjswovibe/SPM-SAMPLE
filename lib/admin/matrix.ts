import type { SupabaseClient } from '@supabase/supabase-js'

export { getCurrentYearMonth } from '@/lib/date-selection'
import {
  ensureClassSessionsForMonth,
  formatSessionDateLabel,
  formatSessionTimeRangeLabel,
  formatWeekSessionRangeLabel,
} from '@/lib/class-schedule'
import type {
  AdminMatrixData,
  AttendanceStatus,
  EnrollmentLifecycleStatus,
  PaymentStatus,
} from '@/lib/types'

const DEFAULT_TOTAL_WEEKS = 4

type MatrixClassRow = {
  id: string
  name: string
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

type MatrixEnrollmentRow = {
  id: string
  student_id: string
  payment_status: boolean | null
  status: EnrollmentLifecycleStatus | null
  profiles: EnrollmentProfileRow
}

type MatrixClassLogRow = {
  id: string
  week_number: number
  attendance_data: Record<string, boolean> | null
}

type SessionAttendanceRow = {
  session_id: string
  student_id: string
  status: AttendanceStatus | null
}

function normalizePaymentStatus(value: boolean | null): PaymentStatus {
  return value ? 'paid' : 'unpaid'
}

function normalizeLegacyAttendanceStatus(value: boolean | undefined): AttendanceStatus {
  if (value === true) return 'present'
  return 'absent'
}

function normalizeSessionAttendanceStatus(value: AttendanceStatus | null | undefined): AttendanceStatus {
  return value === 'present' ? 'present' : 'absent'
}

function getProfile(row: EnrollmentProfileRow) {
  if (Array.isArray(row)) return row[0] ?? null
  return row
}

function getStatusRank(status: EnrollmentLifecycleStatus | null | undefined) {
  if (status === 'ACTIVE') return 0
  if (status === 'PENDING') return 1
  if (status === 'CANCELLED') return 2
  return 3
}

export function isValidYearMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value)
}

export function formatYearMonthLabel(value: string) {
  const [year, month] = value.split('-')
  if (!year || !month) return value
  return `${year}.${month}`
}

function buildLegacyWeeks(logs: MatrixClassLogRow[]) {
  const maxWeek = logs.reduce((max, log) => Math.max(max, log.week_number), 0)
  const totalWeeks = Math.max(DEFAULT_TOTAL_WEEKS, maxWeek)

  return Array.from({ length: totalWeeks }, (_, index) => {
    const weekNumber = index + 1

    return {
      weekNumber,
      label: `${weekNumber}주`,
      dateRangeLabel: null,
      sessions: [
        {
          sessionId: `legacy-week-${weekNumber}`,
          sessionLabel: `${weekNumber}주차`,
          sessionDate: null,
          sessionTimeLabel: null,
          storageKind: 'legacy' as const,
        },
      ],
    }
  })
}

async function buildSessionMatrixData(args: {
  supabase: SupabaseClient
  classId: string
  yearMonth: string
  classRow: MatrixClassRow
  enrollments: MatrixEnrollmentRow[]
}) {
  const sessions = await ensureClassSessionsForMonth(args.supabase, args.classId, args.yearMonth)
  if (!sessions || sessions.length === 0) {
    return null
  }

  const { data: attendanceRows, error: attendanceError } = await args.supabase
    .from('session_attendance')
    .select('session_id, student_id, status')
    .in('session_id', sessions.map((session) => session.id))

  if (attendanceError) {
    throw attendanceError
  }

  const attendanceByKey = new Map(
    ((attendanceRows ?? []) as SessionAttendanceRow[]).map((row) => [
      `${row.session_id}:${row.student_id}`,
      normalizeSessionAttendanceStatus(row.status),
    ]),
  )

  const weeks = sessions
    .reduce((map, session) => {
      const current = map.get(session.weekNumber) ?? []
      current.push(session)
      map.set(session.weekNumber, current)
      return map
    }, new Map<number, typeof sessions>())

  const orderedWeeks = Array.from(weeks.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([weekNumber, weekSessions]) => ({
      weekNumber,
      label: `${weekNumber}주`,
      dateRangeLabel: formatWeekSessionRangeLabel(weekSessions),
      sessions: weekSessions.map((session) => ({
        sessionId: session.id,
        sessionLabel: formatSessionDateLabel(session.sessionDate),
        sessionDate: session.sessionDate,
        sessionTimeLabel: formatSessionTimeRangeLabel(session.startTime, session.endTime),
        storageKind: 'session' as const,
      })),
    }))

  const flatSessions = orderedWeeks.flatMap((week) =>
    week.sessions.map((session) => ({
      ...session,
      weekNumber: week.weekNumber,
    })),
  )

  const students = args.enrollments
    .map((enrollment) => {
      const profile = getProfile(enrollment.profiles)
      const enrollmentStatus = enrollment.status ?? 'ACTIVE'
      const canUpdateRow = enrollmentStatus !== 'CANCELLED'

      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.student_id,
        studentName: profile?.full_name || '이름 미등록',
        studentEmail: profile?.email || '',
        paymentStatus: normalizePaymentStatus(enrollment.payment_status),
        enrollmentStatus,
        canUpdatePayment: canUpdateRow,
        attendances: flatSessions.map((session) => ({
          weekNumber: session.weekNumber,
          sessionId: session.sessionId,
          sessionLabel: session.sessionLabel,
          sessionDate: session.sessionDate,
          sessionTimeLabel: session.sessionTimeLabel,
          status: attendanceByKey.get(`${session.sessionId}:${enrollment.student_id}`) ?? 'absent',
          attendanceId: `session:${session.sessionId}:${enrollment.student_id}`,
          storageKind: 'session' as const,
          canUpdate: canUpdateRow,
        })),
      }
    })
    .sort((left, right) => {
      const statusCompare = getStatusRank(left.enrollmentStatus) - getStatusRank(right.enrollmentStatus)
      if (statusCompare !== 0) return statusCompare
      return left.studentName.localeCompare(right.studentName, 'ko')
    })

  return {
    classId: args.classRow.id,
    className: args.classRow.name,
    yearMonth: args.yearMonth,
    weeks: orderedWeeks,
    usesLegacyAttendance: false,
    students,
  } satisfies AdminMatrixData
}

async function buildLegacyMatrixData(args: {
  supabase: SupabaseClient
  classId: string
  yearMonth: string
  classRow: MatrixClassRow
  enrollments: MatrixEnrollmentRow[]
}) {
  const { data: classLogs, error: classLogsError } = await args.supabase
    .from('class_logs')
    .select('id, week_number, attendance_data')
    .eq('class_id', args.classId)
    .eq('year_month', args.yearMonth)
    .order('week_number', { ascending: true })

  if (classLogsError) throw classLogsError

  const logs = (classLogs || []) as MatrixClassLogRow[]
  const logByWeek = new Map(logs.map((log) => [log.week_number, log]))
  const weeks = buildLegacyWeeks(logs)
  const flatSessions = weeks.flatMap((week) =>
    week.sessions.map((session) => ({
      ...session,
      weekNumber: week.weekNumber,
    })),
  )

  const students = args.enrollments
    .map((enrollment) => {
      const profile = getProfile(enrollment.profiles)
      const enrollmentStatus = enrollment.status ?? 'ACTIVE'
      const canUpdateRow = enrollmentStatus !== 'CANCELLED'

      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.student_id,
        studentName: profile?.full_name || '이름 미등록',
        studentEmail: profile?.email || '',
        paymentStatus: normalizePaymentStatus(enrollment.payment_status),
        enrollmentStatus,
        canUpdatePayment: canUpdateRow,
        attendances: flatSessions.map((session) => {
          const week = session.weekNumber
          const log = logByWeek.get(week)
          const attendanceValue =
            log?.attendance_data && enrollment.student_id in log.attendance_data
              ? log.attendance_data[enrollment.student_id]
              : undefined

          return {
            weekNumber: week,
            sessionId: session.sessionId,
            sessionLabel: session.sessionLabel,
            sessionDate: session.sessionDate,
            sessionTimeLabel: session.sessionTimeLabel,
            status: normalizeLegacyAttendanceStatus(attendanceValue),
            attendanceId: log ? `legacy:${log.id}:${enrollment.student_id}` : `missing:${week}:${enrollment.student_id}`,
            storageKind: 'legacy' as const,
            canUpdate: canUpdateRow && Boolean(log),
          }
        }),
      }
    })
    .sort((left, right) => {
      const statusCompare = getStatusRank(left.enrollmentStatus) - getStatusRank(right.enrollmentStatus)
      if (statusCompare !== 0) return statusCompare
      return left.studentName.localeCompare(right.studentName, 'ko')
    })

  return {
    classId: args.classRow.id,
    className: args.classRow.name,
    yearMonth: args.yearMonth,
    weeks,
    usesLegacyAttendance: true,
    students,
  } satisfies AdminMatrixData
}

export async function readAdminMatrixData(
  supabase: SupabaseClient,
  classId: string,
  yearMonth: string,
): Promise<AdminMatrixData | null> {
  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('id, name')
    .eq('id', classId)
    .maybeSingle()

  if (classError) throw classError
  if (!classRow) return null

  const { data: enrollments, error: enrollmentError } = await supabase
    .from('enrollments')
    .select(
      `
        id,
        student_id,
        payment_status,
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

  if (enrollmentError) throw enrollmentError

  const sessionData = await buildSessionMatrixData({
    supabase,
    classId,
    yearMonth,
    classRow: classRow as MatrixClassRow,
    enrollments: (enrollments || []) as MatrixEnrollmentRow[],
  }).catch((error) => {
    if (error instanceof Error && error.message.includes('session_attendance')) {
      return null
    }

    throw error
  })

  if (sessionData) {
    return sessionData
  }

  return buildLegacyMatrixData({
    supabase,
    classId,
    yearMonth,
    classRow: classRow as MatrixClassRow,
    enrollments: (enrollments || []) as MatrixEnrollmentRow[],
  })
}

export function buildAdminMatrixCsv(data: AdminMatrixData) {
  const flatSessions = data.weeks.flatMap((week) =>
    week.sessions.map((session) => ({
      weekNumber: week.weekNumber,
      label:
        session.storageKind === 'session'
          ? `${week.weekNumber}주 ${session.sessionLabel}${session.sessionTimeLabel ? ` ${session.sessionTimeLabel}` : ''}`
          : `${week.weekNumber}주차`,
      sessionId: session.sessionId,
    })),
  )

  const headers = [
    '수업',
    '월',
    '학생 이름',
    '학생 이메일',
    '등록 상태',
    '결제',
    ...flatSessions.map((session) => session.label),
  ]

  const rows = data.students.map((student) => [
    data.className,
    data.yearMonth,
    student.studentName,
    student.studentEmail,
    student.enrollmentStatus ?? 'ACTIVE',
    student.paymentStatus,
    ...flatSessions.map((session) => student.attendances.find((attendance) => attendance.sessionId === session.sessionId)?.status ?? 'absent'),
  ])

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')
}
