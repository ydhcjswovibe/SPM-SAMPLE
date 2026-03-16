'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, Check, X, Clock, AlertCircle } from 'lucide-react'
import type { AdminMatrixData, AttendanceStatus } from '@/lib/types'

interface AdminMatrixProps {
  data: AdminMatrixData
  onAttendanceChange: (attendanceId: string, status: AttendanceStatus) => Promise<void>
}

const paymentLabels = {
  unpaid: '미결제',
  paid: '결제 확인',
  refunded: '환불',
} as const

const paymentColors = {
  unpaid: 'bg-warning/15 text-warning-foreground border-warning/30',
  paid: 'bg-success/15 text-success border-success/30',
  refunded: 'bg-muted text-muted-foreground border-muted',
} as const

const attendanceLabels: Record<AttendanceStatus, string> = {
  pending: '확인 전',
  present: '출석',
  absent: '결석',
  excused: '사유 있음',
}

const attendanceOptions: AttendanceStatus[] = ['present', 'absent', 'pending']

const enrollmentStatusLabels = {
  ACTIVE: '수강 중',
  PENDING: '보류',
  CANCELLED: '취소됨',
} as const

const attendanceIcons: Record<AttendanceStatus, ReactNode> = {
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

export function AdminMatrix({ data, onAttendanceChange }: AdminMatrixProps) {
  const [updatingAttendance, setUpdatingAttendance] = useState<string | null>(null)

  const handleAttendanceChange = async (attendanceId: string, status: AttendanceStatus) => {
    setUpdatingAttendance(attendanceId)
    try {
      await onAttendanceChange(attendanceId, status)
    } finally {
      setUpdatingAttendance(null)
    }
  }

  const renderAttendanceMenu = (
    attendance: AdminMatrixData['students'][number]['attendances'][number],
    options?: {
      className?: string
      compact?: boolean
    },
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            options?.compact
              ? 'h-8 w-full rounded-md border px-0 text-[10px] font-medium'
              : 'h-9 justify-between gap-2 rounded-full border px-3 text-xs font-medium',
            attendanceColors[attendance.status],
            updatingAttendance === attendance.attendanceId && 'opacity-50',
            attendance.canUpdate === false && 'cursor-not-allowed opacity-50',
            options?.className,
          )}
          disabled={updatingAttendance === attendance.attendanceId || attendance.canUpdate === false}
        >
          {options?.compact ? (
            <span>{attendanceLabels[attendance.status]}</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5">
                {attendanceIcons[attendance.status]}
                {attendanceLabels[attendance.status]}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {attendanceOptions.map((status) => (
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
  )

  if (data.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">등록된 학생이 없습니다.</h3>
        <p className="text-sm text-muted-foreground mt-1">학생 탭에서 먼저 현재 월 등록을 배정해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 md:space-y-4">
      <div className="space-y-2 md:hidden">
        {data.students.map((student) => (
          <Card key={student.enrollmentId} className="gap-0 overflow-hidden border-border/70 py-0">
            <CardContent className="space-y-1.5 px-2.5 py-2">
              <div className="flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium leading-none">
                    {student.studentName || '이름 미등록'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {student.enrollmentStatus ? (
                    <Badge variant="outline" className="h-4 px-1 text-[9px] leading-none">
                      {enrollmentStatusLabels[student.enrollmentStatus]}
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className={cn('h-4 px-1 text-[9px] font-medium leading-none', paymentColors[student.paymentStatus])}
                  >
                    {paymentLabels[student.paymentStatus]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {student.attendances.map((attendance) => (
                  <div key={attendance.attendanceId} className="space-y-0.5">
                    <div className="text-center text-[9px] font-medium leading-none text-muted-foreground">
                      {attendance.week}주
                    </div>
                    {renderAttendanceMenu(attendance, { compact: true })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto -mx-4 px-4 md:mx-0 md:block md:px-0">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 min-w-[140px] bg-background px-2 py-3 text-left text-sm font-medium text-muted-foreground">
                학생
              </th>
              <th className="min-w-[90px] px-2 py-3 text-center text-sm font-medium text-muted-foreground">
                결제
              </th>
              {Array.from({ length: data.totalWeeks }, (_, i) => (
                <th key={i} className="min-w-[60px] px-2 py-3 text-center text-sm font-medium text-muted-foreground">
                  {i + 1}주
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.students.map((student) => (
              <tr key={student.enrollmentId} className="border-b last:border-0">
                <td className="sticky left-0 z-10 bg-background px-2 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[120px] truncate text-sm font-medium">
                        {student.studentName || '이름 미등록'}
                      </span>
                      {student.enrollmentStatus ? (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          {enrollmentStatusLabels[student.enrollmentStatus]}
                        </Badge>
                      ) : null}
                    </div>
                    <span className="max-w-[120px] truncate text-xs text-muted-foreground">
                      {student.studentEmail}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      'h-8 px-2 text-xs font-medium',
                      paymentColors[student.paymentStatus],
                    )}
                  >
                    {paymentLabels[student.paymentStatus]}
                  </Badge>
                </td>
                {student.attendances.map((attendance) => (
                  <td key={attendance.attendanceId} className="px-2 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                            attendanceColors[attendance.status],
                            updatingAttendance === attendance.attendanceId && 'opacity-50',
                            attendance.canUpdate === false && 'cursor-not-allowed opacity-50',
                          )}
                          disabled={updatingAttendance === attendance.attendanceId || attendance.canUpdate === false}
                        >
                          {attendanceIcons[attendance.status]}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {attendanceOptions.map((status) => (
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
    </div>
  )
}
