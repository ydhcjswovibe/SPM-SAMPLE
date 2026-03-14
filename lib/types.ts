// Database Types for SPM

export type UserRole = 'admin' | 'student'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type AttendanceStatus = 'pending' | 'present' | 'absent' | 'excused'

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
  enrolled_at: string
  updated_at: string
  // Relations
  class?: Class
  student?: Profile
}

export interface Attendance {
  id: string
  enrollment_id: string
  week_number: number
  status: AttendanceStatus
  note: string | null
  marked_at: string | null
  created_at: string
  updated_at: string
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
export interface MatrixCell {
  enrollmentId: string
  studentId: string
  studentName: string
  studentEmail: string
  paymentStatus: PaymentStatus
  attendances: {
    week: number
    status: AttendanceStatus
    attendanceId: string
  }[]
}

export interface AdminMatrixData {
  classId: string
  className: string
  totalWeeks: number
  students: MatrixCell[]
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
}
