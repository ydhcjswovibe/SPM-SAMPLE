import type { SupabaseClient } from '@supabase/supabase-js'

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

function normalizePaymentStatus(value: boolean | null): PaymentStatus {
  return value ? 'paid' : 'unpaid'
}

function normalizeAttendanceStatus(value: boolean | undefined): AttendanceStatus {
  if (value === true) return 'present'
  if (value === false) return 'absent'
  return 'pending'
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

export function getCurrentYearMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatYearMonthLabel(value: string) {
  const [year, month] = value.split('-')
  if (!year || !month) return value
  return `${year}.${month}`
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

  const { data: classLogs, error: classLogsError } = await supabase
    .from('class_logs')
    .select('id, week_number, attendance_data')
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .order('week_number', { ascending: true })

  if (classLogsError) throw classLogsError

  const logs = (classLogs || []) as MatrixClassLogRow[]
  const logByWeek = new Map(logs.map((log) => [log.week_number, log]))
  const maxWeek = logs.reduce((max, log) => Math.max(max, log.week_number), 0)
  const totalWeeks = Math.max(DEFAULT_TOTAL_WEEKS, maxWeek)

  const students = ((enrollments || []) as MatrixEnrollmentRow[])
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
        attendances: Array.from({ length: totalWeeks }, (_, index) => {
          const week = index + 1
          const log = logByWeek.get(week)
          const attendanceValue =
            log?.attendance_data && enrollment.student_id in log.attendance_data
              ? log.attendance_data[enrollment.student_id]
              : undefined

          return {
            week,
            status: normalizeAttendanceStatus(attendanceValue),
            attendanceId: log ? `${log.id}:${enrollment.student_id}` : `missing:${week}:${enrollment.student_id}`,
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
    classId: (classRow as MatrixClassRow).id,
    className: (classRow as MatrixClassRow).name,
    yearMonth,
    totalWeeks,
    students,
  }
}

export function buildAdminMatrixCsv(data: AdminMatrixData) {
  const headers = [
    '수업',
    '월',
    '학생 이름',
    '학생 이메일',
    '등록 상태',
    '결제',
    ...Array.from({ length: data.totalWeeks }, (_, index) => `${index + 1}주차`),
  ]

  const rows = data.students.map((student) => [
    data.className,
    data.yearMonth,
    student.studentName,
    student.studentEmail,
    student.enrollmentStatus ?? 'ACTIVE',
    student.paymentStatus,
    ...student.attendances.map((attendance) => attendance.status),
  ])

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')
}
