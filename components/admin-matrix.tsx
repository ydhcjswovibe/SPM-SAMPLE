'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  Loader2,
  MessageCircleReply,
  MessageSquareText,
  NotebookPen,
} from 'lucide-react'

import type { AdminWeeklyNotesState, WeeklyNotesWeek } from '@/lib/admin/weekly-notes'
import type { AdminMatrixData, AttendanceStatus, MatrixAttendanceCell, MatrixCell, MatrixWeek } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/components/ui/use-mobile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  adminDashedPanelClass,
  adminInsetCardClass,
  adminPrimaryButtonClass,
  adminSurfaceTextareaClass,
} from '@/lib/admin/surface'

interface AdminMatrixProps {
  data: AdminMatrixData
  notesState: AdminWeeklyNotesState | null
  showReplyOnly?: boolean
  isNotesLoading?: boolean
  notesErrorMessage?: string | null
  focusStudentId?: string | null
  focusWeekNumber?: number | null
  onAttendanceChange: (attendanceId: string, status: AttendanceStatus) => Promise<void>
  onSaveWeekNotes: (payload: {
    weekNumber: number
    ownerFeedbackText: string
    memberFeedbackByStudentId: Record<string, string>
  }) => Promise<void>
}

type WeekDraft = {
  ownerFeedbackText: string
  memberFeedbackByStudentId: Record<string, string>
  isDirty: boolean
}

type SheetState =
  | {
      kind: 'week'
      weekNumber: number
    }
  | {
      kind: 'student'
      weekNumber: number
      studentId: string
    }
  | null

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'] as const

const paymentLabels = {
  unpaid: '미결제',
  paid: '결제 확인',
  refunded: '환불',
} as const

const paymentColors = {
  unpaid: 'bg-[#fff6dc] text-[#7d5a0e] border-[#ecdca7]',
  paid: 'bg-[#eef8ea] text-[#38632b] border-[#bfe0c0]',
  refunded: 'bg-muted text-muted-foreground border-muted',
} as const

const enrollmentStatusLabels = {
  ACTIVE: '수강 중',
  PENDING: '보류',
  CANCELLED: '취소됨',
} as const

function trimText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : ''
}

function createWeekDraft(week: WeeklyNotesWeek | null | undefined): WeekDraft {
  return {
    ownerFeedbackText: trimText(week?.ownerFeedbackText ?? week?.adminNoteText),
    memberFeedbackByStudentId: { ...(week?.memberFeedbackByStudentId ?? {}) },
    isDirty: false,
  }
}

function formatSessionDateWithWeekday(sessionDate: string | null | undefined) {
  if (!sessionDate) {
    return null
  }

  const parsed = new Date(`${sessionDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return sessionDate
  }

  return `${parsed.getMonth() + 1}/${parsed.getDate()}(${weekdayLabels[parsed.getDay()]})`
}

function buildWeekTooltipLabel(week: MatrixWeek) {
  const labels = week.sessions
    .map((session) => formatSessionDateWithWeekday(session.sessionDate))
    .filter(Boolean) as string[]

  return labels.length > 0 ? labels.join(', ') : `${week.label} 실제 일정 없음`
}

function formatSessionChipLabel(args: {
  sessionDate: string | null
  fallbackLabel: string
  timeLabel?: string | null
}) {
  const dateLabel = formatSessionDateWithWeekday(args.sessionDate) ?? args.fallbackLabel
  return args.timeLabel ? `${dateLabel} · ${args.timeLabel}` : dateLabel
}

function isCurrentMonth(yearMonth: string) {
  const now = new Date()
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return currentYearMonth === yearMonth
}

function resolveAutoFocusWeek(data: AdminMatrixData, requestedWeek: number | null | undefined) {
  if (requestedWeek && data.weeks.some((week) => week.weekNumber === requestedWeek)) {
    return requestedWeek
  }

  if (!isCurrentMonth(data.yearMonth)) {
    return data.weeks[0]?.weekNumber ?? 1
  }

  const today = new Date().toISOString().slice(0, 10)
  const sortedWeeks = [...data.weeks].sort((left, right) => left.weekNumber - right.weekNumber)
  const currentWeek = sortedWeeks.find((week) => {
    const dates = week.sessions.map((session) => session.sessionDate).filter(Boolean) as string[]
    if (dates.length === 0) {
      return false
    }

    const start = dates[0]
    const end = dates[dates.length - 1]
    return start <= today && today <= end
  })

  if (currentWeek) {
    return currentWeek.weekNumber
  }

  const nextUpcomingWeek = sortedWeeks.find((week) =>
    week.sessions.some((session) => session.sessionDate && session.sessionDate >= today),
  )

  return nextUpcomingWeek?.weekNumber ?? sortedWeeks.at(-1)?.weekNumber ?? 1
}

function getStudentWeekKey(studentId: string, weekNumber: number) {
  return `${studentId}:${weekNumber}`
}

function getLocalTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLastSessionDate(week: MatrixWeek) {
  const dates = week.sessions.map((session) => session.sessionDate).filter(Boolean) as string[]
  if (dates.length === 0) {
    return null
  }

  return [...dates].sort().at(-1) ?? null
}

function resolveWeekAttendanceState(attendances: MatrixAttendanceCell[]) {
  return attendances.length > 0 && attendances.every((attendance) => attendance.status === 'present')
    ? 'present'
    : 'absent'
}

export function AdminMatrix({
  data,
  notesState,
  showReplyOnly = false,
  isNotesLoading = false,
  notesErrorMessage = null,
  focusStudentId,
  focusWeekNumber,
  onAttendanceChange,
  onSaveWeekNotes,
}: AdminMatrixProps) {
  const isMobile = useIsMobile()
  const [sheetState, setSheetState] = useState<SheetState>(null)
  const [weekDrafts, setWeekDrafts] = useState<Record<number, WeekDraft>>({})
  const [sheetError, setSheetError] = useState<string | null>(null)
  const [sheetSuccessMessage, setSheetSuccessMessage] = useState<string | null>(null)
  const [savingWeekNumber, setSavingWeekNumber] = useState<number | null>(null)
  const [updatingAttendanceIds, setUpdatingAttendanceIds] = useState<string[]>([])
  const weekHeaderRefs = useRef<Record<number, HTMLElement | null>>({})
  const focusedSheetKeyRef = useRef<string | null>(null)

  const notesByWeek = useMemo(
    () => new Map((notesState?.weeks ?? []).map((week) => [week.weekNumber, week])),
    [notesState],
  )
  const notesSaveDisabled = isNotesLoading || Boolean(notesErrorMessage)
  const autoFocusWeekNumber = useMemo(
    () => resolveAutoFocusWeek(data, focusWeekNumber),
    [data, focusWeekNumber],
  )
  const attendanceByStudentWeek = useMemo(() => {
    const next = new Map<string, MatrixAttendanceCell[]>()
    for (const student of data.students) {
      for (const week of data.weeks) {
        next.set(
          getStudentWeekKey(student.studentId, week.weekNumber),
          student.attendances.filter((attendance) => attendance.weekNumber === week.weekNumber),
        )
      }
    }
    return next
  }, [data.students, data.weeks])

  useEffect(() => {
    setWeekDrafts((current) => {
      const next = { ...current }

      for (const week of data.weeks) {
        const existing = current[week.weekNumber]
        if (!existing || !existing.isDirty) {
          next[week.weekNumber] = createWeekDraft(notesByWeek.get(week.weekNumber) ?? null)
        }
      }

      return next
    })
  }, [data.weeks, notesByWeek])

  useEffect(() => {
    const weekHeader = weekHeaderRefs.current[autoFocusWeekNumber]
    if (!weekHeader) {
      return
    }

    weekHeader.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    })
  }, [autoFocusWeekNumber])

  useEffect(() => {
    if (!focusStudentId) {
      return
    }

    const focusKey = `${focusStudentId}:${autoFocusWeekNumber}`
    if (focusedSheetKeyRef.current === focusKey) {
      return
    }

    const student = data.students.find((item) => item.studentId === focusStudentId)
    if (!student) {
      return
    }

    focusedSheetKeyRef.current = focusKey
    setSheetError(null)
    setSheetSuccessMessage(null)
    setSheetState({
      kind: 'student',
      weekNumber: autoFocusWeekNumber,
      studentId: student.studentId,
    })
  }, [autoFocusWeekNumber, data.students, focusStudentId])

  const getWeekDraft = (weekNumber: number) =>
    weekDrafts[weekNumber] ?? createWeekDraft(notesByWeek.get(weekNumber) ?? null)

  const updateWeekDraft = (weekNumber: number, updater: (draft: WeekDraft) => WeekDraft) => {
    setWeekDrafts((current) => {
      const baseDraft = current[weekNumber] ?? createWeekDraft(notesByWeek.get(weekNumber) ?? null)
      return {
        ...current,
        [weekNumber]: {
          ...updater(baseDraft),
          isDirty: true,
        },
      }
    })
    setSheetSuccessMessage(null)
  }

  const openWeekSheet = (weekNumber: number) => {
    setSheetError(null)
    setSheetSuccessMessage(null)
    setSheetState({
      kind: 'week',
      weekNumber,
    })
  }

  const openStudentSheet = (weekNumber: number, studentId: string) => {
    setSheetError(null)
    setSheetSuccessMessage(null)
    setSheetState({
      kind: 'student',
      weekNumber,
      studentId,
    })
  }

  const addUpdatingIds = (ids: string[]) => {
    setUpdatingAttendanceIds((current) => Array.from(new Set([...current, ...ids])))
  }

  const removeUpdatingIds = (ids: string[]) => {
    const removing = new Set(ids)
    setUpdatingAttendanceIds((current) => current.filter((id) => !removing.has(id)))
  }

  const handleWeekAttendanceToggle = async (attendances: MatrixAttendanceCell[]) => {
    const updatableAttendances = attendances.filter((attendance) => attendance.canUpdate !== false)
    if (updatableAttendances.length === 0) {
      return
    }

    const nextStatus = resolveWeekAttendanceState(updatableAttendances) === 'present' ? 'absent' : 'present'
    const ids = updatableAttendances.map((attendance) => attendance.attendanceId)

    addUpdatingIds(ids)
    try {
      for (const attendance of updatableAttendances) {
        await onAttendanceChange(attendance.attendanceId, nextStatus)
      }
    } finally {
      removeUpdatingIds(ids)
    }
  }

  const filteredStudents = data.students.filter((student) => {
    if (!showReplyOnly) {
      return true
    }

    return data.weeks.some((week) => Boolean(trimText(notesByWeek.get(week.weekNumber)?.studentReplyByStudentId[student.studentId])))
  })

  const activeWeek = sheetState ? data.weeks.find((week) => week.weekNumber === sheetState.weekNumber) ?? null : null
  const activeDraft = sheetState ? getWeekDraft(sheetState.weekNumber) : null
  const activeStudent =
    sheetState?.kind === 'student'
      ? data.students.find((student) => student.studentId === sheetState.studentId) ?? null
      : null
  const activeStudentReplyText =
    sheetState?.kind === 'student'
      ? trimText(notesByWeek.get(sheetState.weekNumber)?.studentReplyByStudentId[sheetState.studentId])
      : ''
  const mobileGridTemplate = `minmax(5.35rem,1fr) repeat(${Math.max(data.weeks.length, 1)}, minmax(4rem,4rem))`
  const todayKey = getLocalTodayKey()

  const handleSaveSheet = async () => {
    if (!sheetState || !activeDraft) {
      return
    }

    setSavingWeekNumber(sheetState.weekNumber)
    setSheetError(null)
    setSheetSuccessMessage(null)

    try {
      await onSaveWeekNotes({
        weekNumber: sheetState.weekNumber,
        ownerFeedbackText: activeDraft.ownerFeedbackText,
        memberFeedbackByStudentId: activeDraft.memberFeedbackByStudentId,
      })

      setWeekDrafts((current) => ({
        ...current,
        [sheetState.weekNumber]: {
          ...(current[sheetState.weekNumber] ?? activeDraft),
          isDirty: false,
        },
      }))
      setSheetSuccessMessage(sheetState.kind === 'week' ? '주차별 운영 메모를 저장했습니다.' : '학생 메모를 저장했습니다.')
    } catch (error) {
      setSheetError(error instanceof Error ? error.message : '메모 저장에 실패했습니다.')
    } finally {
      setSavingWeekNumber(null)
    }
  }

  const renderStudentWeekCell = (student: MatrixCell, week: MatrixWeek, compact: 'mobile' | 'desktop') => {
    const attendances = attendanceByStudentWeek.get(getStudentWeekKey(student.studentId, week.weekNumber)) ?? []
    const weekDraft = getWeekDraft(week.weekNumber)
    const attendanceReady = resolveWeekAttendanceState(attendances) === 'present'
    const memoReady = Boolean(trimText(weekDraft.memberFeedbackByStudentId[student.studentId]))
    const replyReady = Boolean(trimText(notesByWeek.get(week.weekNumber)?.studentReplyByStudentId[student.studentId]))
    const hasSessions = attendances.length > 0
    const canToggleAttendance = attendances.some((attendance) => attendance.canUpdate !== false)
    const isUpdating = attendances.some((attendance) => updatingAttendanceIds.includes(attendance.attendanceId))
    const lastSessionDate = getLastSessionDate(week)
    const isOverdueAbsent = hasSessions && !attendanceReady && lastSessionDate !== null && lastSessionDate < todayKey

    const memoChipTone = replyReady
      ? 'border-[#ddd4fb] bg-[#f6f2ff] text-[#725ab8] shadow-[0_6px_12px_rgba(123,104,177,0.12)]'
      : memoReady
        ? 'border-[#d5e1f8] bg-[#eef5ff] text-[#5d7dbd] shadow-[0_6px_12px_rgba(100,136,199,0.1)]'
        : 'border-[#e2e8d7] bg-white text-[#7b886c]'
    const memoLabel = replyReady
      ? `${student.studentName || '학생'} ${week.label} 답글 확인 및 메모 열기`
      : `${student.studentName || '학생'} ${week.label} 메모 열기`

    return (
      <div
        key={`${student.enrollmentId}:${week.weekNumber}`}
        className={cn(
          'flex items-center justify-center gap-1',
          compact === 'mobile' ? 'py-0.5' : 'py-1.5',
        )}
      >
        <Button
          type="button"
          variant="surface"
          onClick={() => hasSessions && void handleWeekAttendanceToggle(attendances)}
          aria-label={`${student.studentName || '학생'} ${week.label} ${attendanceReady ? '출석 해제' : '출석 체크'}`}
          title={`${student.studentName || '학생'} ${week.label} ${attendanceReady ? '출석 해제' : '출석 체크'}`}
          disabled={!hasSessions || !canToggleAttendance || isUpdating}
          className={cn(
            'rounded-[1rem] border px-0 shadow-[0_10px_16px_rgba(116,142,83,0.1)] transition-[background-color,border-color,box-shadow,transform] active:scale-[0.98]',
            compact === 'mobile' ? 'h-9 w-9 min-w-9' : 'h-11 w-11 min-w-11',
            hasSessions
              ? attendanceReady
                ? 'border-[#79c95c] bg-[#69be46] text-white shadow-[0_10px_18px_rgba(105,190,70,0.22)]'
                : isOverdueAbsent
                  ? 'border-[#efb7b1] bg-[#ee7a6f] text-white shadow-[0_10px_18px_rgba(211,95,85,0.18)]'
                  : 'border-[#e3e8d8] bg-[#fbfcf8] text-[#c0c9b5]'
              : 'border-dashed border-[#dde6d1] bg-[#fbfcf8] text-[#b6c1aa]',
            isUpdating ? 'ring-2 ring-[#dce8c7] ring-offset-1 brightness-[0.98]' : '',
          )}
        >
          {hasSessions ? (
            isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check
                className={cn(
                  'h-4 w-4',
                  attendanceReady || isOverdueAbsent ? 'text-white' : 'text-[#c6cebb]',
                )}
              />
            )
          ) : (
            <span className="text-sm leading-none text-[#b7c0ab]">-</span>
          )}
        </Button>
        <button
          type="button"
          onClick={() => openStudentSheet(week.weekNumber, student.studentId)}
          aria-label={memoLabel}
          title={memoLabel}
          className={cn(
            'inline-flex items-center justify-center rounded-full border font-semibold shadow-[0_8px_14px_rgba(116,142,83,0.08)] [-webkit-tap-highlight-color:transparent] touch-manipulation',
            compact === 'mobile'
              ? 'h-8 min-w-[2rem] rounded-[0.85rem] px-1.5 text-[9px] leading-none'
              : 'h-8 min-w-[2.35rem] rounded-[0.95rem] px-2 text-[10px] leading-none',
            memoChipTone,
          )}
        >
          메모
        </button>
      </div>
    )
  }

  if (data.students.length === 0) {
    return (
      <div className={cn(adminDashedPanelClass, 'flex flex-col items-center justify-center px-4 py-12 text-center')}>
        <div className="mb-4 rounded-full bg-[#f1f6e8] p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">등록된 학생이 없습니다.</h3>
        <p className="mt-1 text-sm text-muted-foreground">학생 탭에서 먼저 현재 월 등록을 배정해 주세요.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className={cn(adminDashedPanelClass, 'px-4 py-8 text-center text-sm text-[#6f7f61]')}>
            답글이 도착한 학생이 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto lg:hidden">
              <div className={cn(adminInsetCardClass, 'min-w-fit rounded-[1.6rem]')}>
                <div className="grid gap-x-2 border-b border-[#e7eddb] bg-[#fbfcf7] px-3 py-2.5" style={{ gridTemplateColumns: mobileGridTemplate }}>
                  <div className="text-[11px] font-semibold text-[#6e7e61]">학생</div>
                  {data.weeks.map((week) => {
                    const weekDraft = getWeekDraft(week.weekNumber)
                    const hasWeekMemo = Boolean(trimText(weekDraft.ownerFeedbackText))

                    return (
                      <div
                        key={week.weekNumber}
                        ref={(node) => {
                          weekHeaderRefs.current[week.weekNumber] = node
                        }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="text-[11px] font-semibold text-[#435536]">{week.label}</div>
                        <button
                          type="button"
                          onClick={() => openWeekSheet(week.weekNumber)}
                          aria-label={`${week.label} 주차 운영 메모 열기`}
                          title={`${week.label} 운영 메모`}
                          className={cn(
                            'relative inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                            hasWeekMemo
                              ? 'border-[#f1dcc1] bg-[#fff7ee] text-[#b26f3d]'
                              : 'border-[#dce5cf] bg-white text-[#718161]',
                            week.weekNumber === autoFocusWeekNumber ? 'ring-2 ring-[#dce8c7] ring-offset-1' : '',
                          )}
                        >
                          <NotebookPen className="h-3 w-3" />
                          {weekDraft.isDirty ? (
                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-[#f0c76b]" />
                          ) : null}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {filteredStudents.map((student, index) => (
                  <div
                    key={student.enrollmentId}
                    className={cn(
                      'grid gap-x-1.5 px-2.5 py-2.5',
                      index !== filteredStudents.length - 1 ? 'border-b border-[#edf1e7]' : '',
                    )}
                    style={{ gridTemplateColumns: mobileGridTemplate }}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[13px] font-semibold leading-none text-[#314127]">
                          {student.studentName || '이름 미등록'}
                        </p>
                        {student.enrollmentStatus && student.enrollmentStatus !== 'ACTIVE' ? (
                          <span className="shrink-0 text-[9px] font-semibold text-[#8c7b56]">
                            {enrollmentStatusLabels[student.enrollmentStatus]}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn('h-5 rounded-full px-1.5 text-[9px] font-semibold leading-none', paymentColors[student.paymentStatus])}
                        >
                          {paymentLabels[student.paymentStatus]}
                        </Badge>
                      </div>
                    </div>

                    {data.weeks.map((week) => renderStudentWeekCell(student, week, 'mobile'))}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e4ead9]">
                    <th className="sticky left-0 z-20 min-w-[240px] bg-[#fffefb] px-3 py-3 text-left text-sm font-medium text-muted-foreground">
                      학생
                    </th>
                    {data.weeks.map((week) => {
                      const weekDraft = getWeekDraft(week.weekNumber)
                      const hasWeekMemo = Boolean(trimText(weekDraft.ownerFeedbackText))

                      return (
                        <th
                          key={week.weekNumber}
                          className={cn(
                            'min-w-[180px] px-3 py-3 text-left',
                            week.weekNumber === autoFocusWeekNumber ? 'bg-[#fbfdf5]' : 'bg-[#fffefb]',
                          )}
                        >
                          <div
                            ref={(node) => {
                              weekHeaderRefs.current[week.weekNumber] = node
                            }}
                            className="flex items-center justify-between gap-2"
                          >
                            <span title={buildWeekTooltipLabel(week)} className="text-sm font-semibold text-[#486035]">
                              {week.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => openWeekSheet(week.weekNumber)}
                              aria-label={`${week.label} 주차 운영 메모 열기`}
                              title={`${week.label} 운영 메모`}
                              className={cn(
                                'relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                                hasWeekMemo
                                  ? 'border-[#f1dcc1] bg-[#fff7ee] text-[#b26f3d]'
                                  : 'border-[#dce5cf] bg-white text-[#718161]',
                              )}
                            >
                              <NotebookPen className="h-3.5 w-3.5" />
                              {weekDraft.isDirty ? (
                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-[#f0c76b]" />
                              ) : null}
                            </button>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.enrollmentId} className="border-b border-[#edf1e7] last:border-0">
                      <td className="sticky left-0 z-10 bg-[#fffefb] px-3 py-3 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="max-w-[180px] truncate text-sm font-medium">
                              {student.studentName || '이름 미등록'}
                            </span>
                            {student.enrollmentStatus && student.enrollmentStatus !== 'ACTIVE' ? (
                              <Badge variant="outline" className="h-5 rounded-full border-[#eadfb5] bg-[#fff9e8] px-1.5 text-[10px] text-[#8c7b56]">
                                {enrollmentStatusLabels[student.enrollmentStatus]}
                              </Badge>
                            ) : null}
                          </div>
                          <div>
                            <Badge
                              variant="outline"
                              className={cn('h-6 rounded-full px-2 text-[10px] font-semibold', paymentColors[student.paymentStatus])}
                            >
                              {paymentLabels[student.paymentStatus]}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      {data.weeks.map((week) => (
                        <td
                          key={`${student.enrollmentId}:${week.weekNumber}`}
                          className={cn('px-3 py-3 align-top', week.weekNumber === autoFocusWeekNumber ? 'bg-[#fbfdf5]' : '')}
                        >
                          {renderStudentWeekCell(student, week, 'desktop')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Sheet
        open={Boolean(sheetState)}
        onOpenChange={(open) => {
          if (!open) {
            setSheetState(null)
            setSheetError(null)
            setSheetSuccessMessage(null)
          }
        }}
      >
        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className={cn(
            'overflow-hidden border-[#dfe6d3] bg-card p-0',
            isMobile ? 'max-h-[88dvh] rounded-t-[1.75rem]' : 'w-full sm:max-w-[32rem]',
          )}
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="space-y-2 border-b border-[#e3e9d8] px-5 pb-4 pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    sheetState?.kind === 'week'
                      ? 'border-[#f1d7b8] bg-[#fff5e7] text-[#9a6338]'
                      : 'border-[#d5e2f7] bg-[#eef4ff] text-[#5873b4]',
                  )}
                >
                  {sheetState?.kind === 'week' ? '주차 운영 메모' : '학생 메모'}
                </Badge>
                {activeWeek ? (
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    {activeWeek.label}
                  </Badge>
                ) : null}
              </div>
              <SheetTitle className="text-[1.15rem] text-[#314127]">
                {sheetState?.kind === 'week'
                  ? `${activeWeek?.label ?? ''} 운영 메모`
                  : `${activeStudent?.studentName ?? '학생'} · ${activeWeek?.label ?? ''} 메모`}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {notesErrorMessage ? (
                <div className="mb-3 rounded-[1.1rem] border border-[#f0d5c9] bg-[#fff4ef] px-3 py-2.5 text-sm text-[#97554b]">
                  {notesErrorMessage}
                </div>
              ) : null}

              {isNotesLoading ? (
                <div className="mb-3 rounded-[1.1rem] border border-[#dce6f3] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#67789a]">
                  메모 상태를 불러오는 중입니다.
                </div>
              ) : null}

              {sheetError ? (
                <div className="mb-3 rounded-[1.1rem] border border-[#f0d5c9] bg-[#fff4ef] px-3 py-2.5 text-sm text-[#97554b]">
                  {sheetError}
                </div>
              ) : null}

              {sheetSuccessMessage ? (
                <div className="mb-3 rounded-[1.1rem] border border-[#cfe4bd] bg-[#f4fbe9] px-3 py-2.5 text-sm text-[#4e7331]">
                  {sheetSuccessMessage}
                </div>
              ) : null}

              {activeDraft && activeWeek ? (
                <div className="space-y-4">
                  <div className="rounded-[1.3rem] border border-[#dfe6d3] bg-white px-4 py-3 shadow-[0_10px_18px_rgba(113,137,82,0.06)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a886d]">실제 일정</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeWeek.sessions.length > 0 ? (
                        activeWeek.sessions.map((session) => (
                          <span
                            key={session.sessionId}
                            className="rounded-full border border-[#dbe4ce] bg-[#f8fbf2] px-2.5 py-1 text-[11px] text-[#667559]"
                          >
                            {formatSessionChipLabel({
                              sessionDate: session.sessionDate,
                              fallbackLabel: session.sessionLabel,
                              timeLabel: session.sessionTimeLabel,
                            })}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-dashed border-[#dbe4ce] bg-[#fbfcf8] px-2.5 py-1 text-[11px] text-[#7b896c]">
                          실제 일정이 아직 없습니다.
                        </span>
                      )}
                    </div>
                  </div>

                  {sheetState?.kind === 'week' ? (
                    <div className="space-y-3 rounded-[1.35rem] border border-[#f1dcc1] bg-[#fff9f1] p-4 shadow-[0_10px_20px_rgba(162,104,58,0.06)]">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#314127]">
                        <MessageSquareText className="h-4 w-4 text-[#c07a43]" />
                        <span>주차 운영 메모</span>
                      </div>
                      <Textarea
                        value={activeDraft.ownerFeedbackText}
                        onChange={(event) =>
                          updateWeekDraft(activeWeek.weekNumber, (draft) => ({
                            ...draft,
                            ownerFeedbackText: event.target.value,
                          }))
                        }
                        disabled={notesSaveDisabled}
                        placeholder="이번 주 수업 흐름이나 다음 주 준비 메모를 적어 주세요."
                        className={cn(adminSurfaceTextareaClass, 'min-h-32 border-[#eddcc7]')}
                      />
                    </div>
                  ) : activeStudent ? (
                    <>
                      <div className="space-y-3 rounded-[1.35rem] border border-[#d8e6fb] bg-[#f7fbff] p-4 shadow-[0_10px_20px_rgba(90,119,184,0.06)]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#314127]">
                          <MessageSquareText className="h-4 w-4 text-[#6488c7]" />
                          <span>학생 메모</span>
                        </div>
                        <Textarea
                          value={activeDraft.memberFeedbackByStudentId[activeStudent.studentId] ?? ''}
                          onChange={(event) =>
                            updateWeekDraft(activeWeek.weekNumber, (draft) => ({
                              ...draft,
                              memberFeedbackByStudentId: {
                                ...draft.memberFeedbackByStudentId,
                                [activeStudent.studentId]: event.target.value,
                              },
                            }))
                          }
                          disabled={notesSaveDisabled}
                          placeholder={`${activeStudent.studentName} 학생 메모를 적어 주세요.`}
                          className={cn(adminSurfaceTextareaClass, 'min-h-28 border-[#d5e1f8]')}
                        />
                      </div>

                      <div className="space-y-3 rounded-[1.35rem] border border-[#e2daf8] bg-[#faf7ff] p-4 shadow-[0_10px_20px_rgba(114,96,169,0.06)]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#314127]">
                          <MessageCircleReply className="h-4 w-4 text-[#7b68b1]" />
                          <span>학생 답글</span>
                        </div>
                        <div className="rounded-[1.15rem] border border-[#e4ddf6] bg-white px-3.5 py-3 text-sm leading-6 text-[#314127]">
                          {activeStudentReplyText ? activeStudentReplyText : '아직 답글이 없습니다.'}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            <SheetFooter className="border-t border-[#e3e9d8] px-5 py-4">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="text-xs text-[#748166]">메모만 저장합니다.</div>
                <Button
                  type="button"
                  onClick={() => void handleSaveSheet()}
                  disabled={!sheetState || savingWeekNumber === sheetState.weekNumber || notesSaveDisabled}
                  className={cn(adminPrimaryButtonClass, 'min-w-[8.5rem]')}
                >
                  {savingWeekNumber === sheetState?.weekNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {sheetState?.kind === 'week' ? '운영 메모 저장' : '메모 저장'}
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
