'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Check, X, Clock, AlertCircle } from 'lucide-react'
import type { AdminMatrixData, PaymentStatus, AttendanceStatus } from '@/lib/types'

interface AdminMatrixProps {
  data: AdminMatrixData
  onPaymentChange: (enrollmentId: string, status: PaymentStatus) => Promise<void>
  onAttendanceChange: (attendanceId: string, status: AttendanceStatus) => Promise<void>
}

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  refunded: 'Refunded',
}

const paymentColors: Record<PaymentStatus, string> = {
  unpaid: 'bg-warning/15 text-warning-foreground border-warning/30',
  paid: 'bg-success/15 text-success border-success/30',
  refunded: 'bg-muted text-muted-foreground border-muted',
}

const attendanceLabels: Record<AttendanceStatus, string> = {
  pending: 'Pending',
  present: 'Present',
  absent: 'Absent',
  excused: 'Excused',
}

const attendanceIcons: Record<AttendanceStatus, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  present: <Check className="h-3.5 w-3.5" />,
  absent: <X className="h-3.5 w-3.5" />,
  excused: <AlertCircle className="h-3.5 w-3.5" />,
}

const attendanceColors: Record<AttendanceStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  present: 'bg-success text-success-foreground',
  absent: 'bg-destructive text-destructive-foreground',
  excused: 'bg-info text-info-foreground',
}

export function AdminMatrix({ data, onPaymentChange, onAttendanceChange }: AdminMatrixProps) {
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null)
  const [updatingAttendance, setUpdatingAttendance] = useState<string | null>(null)

  const handlePaymentChange = async (enrollmentId: string, status: PaymentStatus) => {
    setUpdatingPayment(enrollmentId)
    try {
      await onPaymentChange(enrollmentId, status)
    } finally {
      setUpdatingPayment(null)
    }
  }

  const handleAttendanceChange = async (attendanceId: string, status: AttendanceStatus) => {
    setUpdatingAttendance(attendanceId)
    try {
      await onAttendanceChange(attendanceId, status)
    } finally {
      setUpdatingAttendance(null)
    }
  }

  if (data.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">No students enrolled</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Assign students from the Students page
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground sticky left-0 bg-background z-10 min-w-[140px]">
              Student
            </th>
            <th className="text-center py-3 px-2 font-medium text-sm text-muted-foreground min-w-[90px]">
              Payment
            </th>
            {Array.from({ length: data.totalWeeks }, (_, i) => (
              <th key={i} className="text-center py-3 px-2 font-medium text-sm text-muted-foreground min-w-[60px]">
                W{i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.students.map((student) => (
            <tr key={student.enrollmentId} className="border-b last:border-0">
              <td className="py-3 px-2 sticky left-0 bg-background z-10">
                <div className="flex flex-col">
                  <span className="font-medium text-sm truncate max-w-[120px]">
                    {student.studentName || 'No name'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {student.studentEmail}
                  </span>
                </div>
              </td>
              <td className="py-3 px-2 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 text-xs gap-1 font-normal',
                        paymentColors[student.paymentStatus],
                        updatingPayment === student.enrollmentId && 'opacity-50'
                      )}
                      disabled={updatingPayment === student.enrollmentId}
                    >
                      {paymentLabels[student.paymentStatus]}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {(Object.keys(paymentLabels) as PaymentStatus[]).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handlePaymentChange(student.enrollmentId, status)}
                      >
                        {paymentLabels[status]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
              {student.attendances.map((attendance) => (
                <td key={attendance.attendanceId} className="py-3 px-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'inline-flex items-center justify-center h-8 w-8 rounded-full transition-colors',
                          attendanceColors[attendance.status],
                          updatingAttendance === attendance.attendanceId && 'opacity-50'
                        )}
                        disabled={updatingAttendance === attendance.attendanceId}
                      >
                        {attendanceIcons[attendance.status]}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {(Object.keys(attendanceLabels) as AttendanceStatus[]).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleAttendanceChange(attendance.attendanceId, status)}
                          className="gap-2"
                        >
                          <span className={cn('rounded-full p-1', attendanceColors[status])}>
                            {attendanceIcons[status]}
                          </span>
                          {attendanceLabels[status]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
