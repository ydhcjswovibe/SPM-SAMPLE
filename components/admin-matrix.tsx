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
import {
  adminDashedPanelClass,
  adminDropdownContentClass,
  adminDropdownItemClass,
  adminInsetCardClass,
} from '@/lib/admin/surface'
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
  pending: 'border-[#eadfc6] bg-[#fbf5e7] text-[#8e7b54]',
  present: 'border-[#4dbb72] bg-[#4dbb72] text-white',
  absent: 'border-[#da7265] bg-[#da7265] text-white',
  excused: 'border-[#83a8da] bg-[#83a8da] text-white',
}

function getAttendanceTriggerLabel(
  attendance: AdminMatrixData['students'][number]['attendances'][number],
) {
  return `${attendance.week}주차 출석 상태 ${attendanceLabels[attendance.status]}`
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
          variant="ghost"
          size="sm"
          aria-label={getAttendanceTriggerLabel(attendance)}
          title={getAttendanceTriggerLabel(attendance)}
          className={cn(
            options?.compact
              ? 'mx-auto h-9 w-9 touch-manipulation rounded-full border px-0 shadow-[0_6px_12px_rgba(121,148,84,0.08)]'
              : 'h-9 justify-between gap-2 rounded-full border px-3 text-xs font-medium shadow-[0_6px_12px_rgba(121,148,84,0.08)]',
            attendanceColors[attendance.status],
            updatingAttendance === attendance.attendanceId && 'opacity-50',
            attendance.canUpdate === false && 'cursor-not-allowed opacity-50',
            options?.className,
          )}
          disabled={updatingAttendance === attendance.attendanceId || attendance.canUpdate === false}
        >
          {options?.compact ? (
            attendanceIcons[attendance.status]
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
      <DropdownMenuContent className={adminDropdownContentClass}>
        {attendanceOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleAttendanceChange(attendance.attendanceId, status)}
            className={adminDropdownItemClass}
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
      <div className={cn(adminDashedPanelClass, 'flex flex-col items-center justify-center px-4 py-12 text-center')}>
        <div className="mb-4 rounded-full bg-[#f1f6e8] p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">등록된 학생이 없습니다.</h3>
        <p className="text-sm text-muted-foreground mt-1">학생 탭에서 먼저 현재 월 등록을 배정해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 lg:space-y-0">
      <div className="space-y-2 lg:hidden">
        {data.students.map((student) => (
          <Card key={student.enrollmentId} className={adminInsetCardClass}>
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

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-[#e5ebdc]">
              <th className="sticky left-0 z-10 min-w-[180px] bg-[#fffefb] px-3 py-3 text-left text-sm font-medium text-muted-foreground">
                학생
              </th>
              <th className="min-w-[110px] px-3 py-3 text-center text-sm font-medium text-muted-foreground">
                결제
              </th>
              {Array.from({ length: data.totalWeeks }, (_, i) => (
                <th key={i} className="min-w-[88px] px-3 py-3 text-center text-sm font-medium text-muted-foreground">
                  {i + 1}주
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.students.map((student) => (
              <tr key={student.enrollmentId} className="border-b border-[#edf1e7] last:border-0">
                <td className="sticky left-0 z-10 bg-[#fffefb] px-3 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[160px] truncate text-sm font-medium">
                        {student.studentName || '이름 미등록'}
                      </span>
                      {student.enrollmentStatus ? (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          {enrollmentStatusLabels[student.enrollmentStatus]}
                        </Badge>
                      ) : null}
                    </div>
                    <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                      {student.studentEmail}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
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
                  <td key={attendance.attendanceId} className="px-3 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={getAttendanceTriggerLabel(attendance)}
                          title={getAttendanceTriggerLabel(attendance)}
                          className={cn(
                            'inline-flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shadow-[0_6px_12px_rgba(121,148,84,0.08)]',
                            attendanceColors[attendance.status],
                            updatingAttendance === attendance.attendanceId && 'opacity-50',
                            attendance.canUpdate === false && 'cursor-not-allowed opacity-50',
                          )}
                          disabled={updatingAttendance === attendance.attendanceId || attendance.canUpdate === false}
                        >
                          {attendanceIcons[attendance.status]}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={adminDropdownContentClass}>
                        {attendanceOptions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleAttendanceChange(attendance.attendanceId, status)}
                            className={adminDropdownItemClass}
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
