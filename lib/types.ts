// Database Types for SPM

export type UserRole = 'OWNER' | 'ADMIN' | 'STUDENT'
export type EnrollmentLifecycleStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type AttendanceStatus = 'pending' | 'present' | 'absent' | 'excused'
export type MatrixAttendanceStorageKind = 'session' | 'legacy'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  name: string
  description: string | null
  total_weeks: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  class_id: string
  student_id: string
  payment_status: PaymentStatus
  year_month?: string
  status?: EnrollmentLifecycleStatus
  enrolled_at?: string
  updated_at?: string
  // Relations
  class?: Class
  student?: Profile
}

export interface Attendance {
  id: string
  enrollment_id: string
  week_number: number
  status: AttendanceStatus
  note?: string | null
  marked_at: string | null
  created_at?: string
  updated_at?: string
  // Relations
  enrollment?: Enrollment
}

export interface WeeklyContent {
  id: string
  class_id: string
  week_number: number
  title: string | null
  youtube_url: string | null
  image_url: string | null
  description: string | null
  created_at: string
  updated_at: string
  // Relations
  class?: Class
}

// Admin Matrix Types
export interface MatrixAttendanceCell {
  weekNumber: number
  sessionId: string
  sessionLabel: string
  sessionDate: string | null
  sessionTimeLabel?: string | null
  status: AttendanceStatus
  attendanceId: string
  storageKind: MatrixAttendanceStorageKind
  canUpdate?: boolean
}

export interface MatrixWeek {
  weekNumber: number
  label: string
  dateRangeLabel: string | null
  sessions: Array<{
    sessionId: string
    sessionLabel: string
    sessionDate: string | null
    sessionTimeLabel?: string | null
    storageKind: MatrixAttendanceStorageKind
  }>
}

export interface MatrixCell {
  enrollmentId: string
  studentId: string
  studentName: string
  studentEmail: string
  paymentStatus: PaymentStatus
  enrollmentStatus?: EnrollmentLifecycleStatus
  canUpdatePayment?: boolean
  attendances: MatrixAttendanceCell[]
}

export interface AdminMatrixData {
  classId: string
  className: string
  yearMonth: string
  weeks: MatrixWeek[]
  usesLegacyAttendance: boolean
  students: MatrixCell[]
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
}
