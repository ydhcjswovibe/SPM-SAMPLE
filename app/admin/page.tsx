'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { buildAdminDashboardHref } from '@/lib/admin/content-selection'
import { formatYearMonthLabel, getCurrentYearMonth, isValidYearMonth } from '@/lib/admin/matrix'
import type { AdminWeeklyNotesState } from '@/lib/admin/weekly-notes'
import { WEEKDAY_OPTIONS, getDefaultEndTimeFromStart, shouldAutoAdjustEndTime } from '@/lib/class-schedule'
import { cn } from '@/lib/utils'
import {
  adminAlertCardClass,
  adminCompactButtonClass,
  adminCompactDangerButtonClass,
  adminCompactIconButtonClass,
  adminDialogContentClass,
  adminDropdownContentClass,
  adminDropdownItemClass,
  adminInsetCardClass,
  adminMetricCardClass,
  adminPrimaryButtonClass,
  adminSurfaceCardClass,
  adminSurfaceInputClass,
} from '@/lib/admin/surface'
import { getRoleLabel, isAdminRole, isOwnerRole } from '@/lib/auth/roles'
import { AdminMonthSelector } from '@/components/admin-month-selector'
import { AdminShellHeader } from '@/components/admin-shell-header'
import { ClassSelector } from '@/components/class-selector'
import { AdminHeaderActionMenu } from '@/components/admin-header-action-menu'
import { AdminMatrix } from '@/components/admin-matrix'
import {
  ClassScheduleEditor,
  type EditableClassSession,
  type EditableScheduleRule,
} from '@/components/class-schedule-editor'
import { AdminClassNameField } from '@/components/admin-class-name-field'
import { AdminScheduleTimeField } from '@/components/admin-schedule-time-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { AlertCircle, CalendarCheck, CalendarDays, CreditCard, Download, Filter, Loader2, LogIn, Plus, Trash2, Users } from 'lucide-react'
import type { Class, AdminMatrixData, AttendanceStatus } from '@/lib/types'

const supabase = createClient()

type DbClassRow = Partial<Class> & {
  id: string
  name: string
  is_active?: boolean | null
}

interface AdminAccessState {
  email: string | null
  role: string | null
  canManage: boolean
  canCreateClass: boolean
  isAuthenticated: boolean
}

interface ClassScheduleState {
  rules: Array<{
    id: string
    weekday: number
    startTime: string
    endTime: string | null
  }>
  sessions: Array<{
    id: string
    sessionDate: string
    startTime: string
    endTime: string | null
    source: 'RULE' | 'MANUAL'
  }>
  canEditRules: boolean
}

function normalizeClassRow(row: DbClassRow): Class {
  const now = new Date().toISOString()

  return {
    id: row.id,
    name: row.name,
    description: null,
    total_weeks: 4,
    is_active: row.is_active ?? true,
    created_at: now,
    updated_at: now,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return '요청 처리에 실패했습니다.'
}

async function fetchClasses(yearMonth: string): Promise<Class[]> {
  const searchParams = new URLSearchParams({ yearMonth })
  const response = await fetch(`/api/admin/classes?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(getFriendlyRouteError(await readRouteError(response)))
  }

  const payload = (await response.json()) as { data?: DbClassRow[] }
  return (payload.data ?? []).map((row) => normalizeClassRow(row))
}

async function fetchAllClasses(): Promise<Class[]> {
  const response = await fetch('/api/admin/classes?includeInactive=1', {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(getFriendlyRouteError(await readRouteError(response)))
  }

  const payload = (await response.json()) as { data?: DbClassRow[] }
  return (payload.data ?? []).map((row) => normalizeClassRow(row))
}

async function fetchAdminAccessState(): Promise<AdminAccessState> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      email: null,
      role: null,
      canManage: false,
      canCreateClass: false,
      isAuthenticated: false,
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  const role = typeof profile?.role === 'string' ? profile.role : null

  return {
    email: profile?.email ?? user.email ?? null,
    role,
    canManage: isAdminRole(role),
    canCreateClass: isOwnerRole(role),
    isAuthenticated: true,
  }
}

async function readRouteError(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null
  return payload?.error ?? 'REQUEST_FAILED'
}

function getFriendlyRouteError(code: string) {
  switch (code) {
    case 'AUTH_REQUIRED':
      return '로그인이 필요합니다.'
    case 'ADMIN_REQUIRED':
      return '관리자 권한이 필요합니다.'
    case 'OWNER_REQUIRED':
      return '새 수업 만들기는 오너 권한이 필요합니다.'
    case 'INVALID_YEAR_MONTH':
      return '월 범위를 다시 확인해 주세요.'
    case 'CLASS_NAME_REQUIRED':
      return '수업 이름을 입력해 주세요.'
    case 'INVALID_SCHEDULE_INPUT':
      return '반복 일정 입력값을 다시 확인해 주세요.'
    case 'SCHEDULE_FEATURE_UNAVAILABLE':
      return '현재 연결된 운영 DB에 수업 일정 저장소가 없어 일정 기능을 사용할 수 없습니다.'
    case 'SCHEDULE_READ_FAILED':
      return '수업 일정을 불러오지 못했습니다.'
    case 'SCHEDULE_SAVE_FAILED':
      return '수업 일정을 저장하지 못했습니다.'
    case 'CLASS_NOT_FOUND':
      return '삭제할 수업을 찾지 못했습니다.'
    case 'CLASS_CREATE_FAILED':
      return '수업을 만들지 못했습니다.'
    case 'CLASS_DELETE_FAILED':
      return '수업을 삭제하지 못했습니다.'
    case 'CLASS_LIST_READ_FAILED':
      return '수업 목록을 불러오지 못했습니다.'
    case 'MATRIX_NOT_FOUND':
      return '선택한 범위의 운영 데이터를 찾을 수 없습니다.'
    case 'EXPORT_FAILED':
      return 'CSV 파일을 만들지 못했습니다.'
    case 'PAYMENT_UPDATE_FAILED':
      return '결제 상태 변경에 실패했습니다.'
    case 'ATTENDANCE_UPDATE_FAILED':
      return '출석 상태 변경에 실패했습니다.'
    case 'SESSION_NOT_FOUND':
      return '대상 수업 날짜를 찾지 못했습니다.'
    case 'ENROLLMENT_NOT_FOUND':
      return '대상 등록 정보를 찾을 수 없습니다.'
    case 'CLASS_LOG_NOT_FOUND':
      return '대상 수업 기록을 찾을 수 없습니다.'
    default:
      return code
  }
}

function parseRequestedWeek(value: string | null) {
  if (!value) return null

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

async function fetchMatrixData(classId: string, yearMonth: string): Promise<AdminMatrixData | null> {
  const searchParams = new URLSearchParams({
    classId,
    yearMonth,
  })

  const response = await fetch(`/api/admin/matrix?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(getFriendlyRouteError(await readRouteError(response)))
  }

  const payload = (await response.json()) as { data?: AdminMatrixData }
  return payload.data ?? null
}

async function fetchWeeklyNotesState(classId: string, yearMonth: string): Promise<AdminWeeklyNotesState> {
  const searchParams = new URLSearchParams({
    classId,
    yearMonth,
  })

  const response = await fetch(`/api/admin/weekly-notes?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(getFriendlyRouteError(await readRouteError(response)))
  }

  const payload = (await response.json()) as { data?: AdminWeeklyNotesState }
  if (!payload.data) {
    throw new Error('운영 피드백 상태를 불러오지 못했습니다.')
  }

  return payload.data
}

function buildDefaultScheduleRule(): EditableScheduleRule {
  return {
    id: `new-rule-${Date.now()}`,
    weekday: 1,
    startTime: '16:00',
    endTime: getDefaultEndTimeFromStart('16:00') ?? '',
    isEndTimeAuto: true,
  }
}

function updateEditableTimeRange<TItem extends { startTime: string; endTime: string; isEndTimeAuto: boolean }>(
  item: TItem,
  nextStartTime: string,
) {
  return {
    ...item,
    startTime: nextStartTime,
    endTime: getDefaultEndTimeFromStart(nextStartTime) ?? '',
  }
}

function isHandledCreateClassError(message: string) {
  return [
    '로그인이 필요합니다.',
    '관리자 권한이 필요합니다.',
    '새 수업 만들기는 오너 권한이 필요합니다.',
    '수업 이름을 입력해 주세요.',
    '반복 일정 입력값을 다시 확인해 주세요.',
    '현재 연결된 운영 DB에 수업 일정 저장소가 없어 일정 기능을 사용할 수 없습니다.',
    '수업을 만들지 못했습니다.',
  ].includes(message)
}

async function fetchScheduleState(classId: string, yearMonth: string): Promise<ClassScheduleState> {
  const searchParams = new URLSearchParams({
    classId,
    yearMonth,
  })
  const response = await fetch(`/api/admin/class-schedule?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(getFriendlyRouteError(await readRouteError(response)))
  }

  const payload = (await response.json()) as { data?: ClassScheduleState }
  return payload.data ?? { rules: [], sessions: [], canEditRules: false }
}

function parseAttendanceTarget(attendanceId: string): {
  sessionId?: string
  classLogId?: string
  studentId: string
} | null {
  if (attendanceId.startsWith('missing:')) return null

  const [kind, targetId, studentId] = attendanceId.split(':')
  if (!kind || !targetId || !studentId) return null

  if (kind === 'session') {
    return {
      sessionId: targetId,
      studentId,
    }
  }

  if (kind === 'legacy') {
    return {
      classLogId: targetId,
      studentId,
    }
  }

  return null
}

function getDownloadFileName(response: Response, fallbackName: string) {
  const contentDisposition = response.headers.get('content-disposition')
  const matchedName = contentDisposition?.match(/filename="([^"]+)"/)
  return matchedName?.[1] ?? fallbackName
}

export default function AdminDashboard() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.toString()
  const requestedClassId = searchParams.get('classId')
  const requestedYearMonth = searchParams.get('yearMonth')
  const requestedStudentId = searchParams.get('studentId')
  const requestedWeek = parseRequestedWeek(searchParams.get('week'))
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedYearMonth, setSelectedYearMonth] = useState(
    requestedYearMonth && isValidYearMonth(requestedYearMonth) ? requestedYearMonth : getCurrentYearMonth(),
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeletingClass, setIsDeletingClass] = useState(false)
  const [isScheduleLoading, setIsScheduleLoading] = useState(false)
  const [isScheduleSaving, setIsScheduleSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassScheduleRules, setNewClassScheduleRules] = useState<EditableScheduleRule[]>([buildDefaultScheduleRule()])
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [classActionError, setClassActionError] = useState<string | null>(null)
  const [scheduleDialogError, setScheduleDialogError] = useState<string | null>(null)
  const [scheduleDialogSuccess, setScheduleDialogSuccess] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [showReplyOnly, setShowReplyOnly] = useState(false)
  const [scheduleRules, setScheduleRules] = useState<EditableScheduleRule[]>([buildDefaultScheduleRule()])
  const [scheduleSessions, setScheduleSessions] = useState<EditableClassSession[]>([])
  const [canEditScheduleRules, setCanEditScheduleRules] = useState(false)

  const hasValidYearMonth = isValidYearMonth(selectedYearMonth)

  const { data: accessState, isLoading: isAccessLoading } = useSWR('admin-access', fetchAdminAccessState)
  const canReadAdminData = !isAccessLoading && accessState?.canManage === true
  const {
    data: classes,
    error: classesError,
    isLoading: isClassesLoading,
    mutate: mutateClasses,
  } = useSWR(
    hasValidYearMonth && canReadAdminData ? ['admin-classes', selectedYearMonth] : null,
    ([, yearMonth]) => fetchClasses(yearMonth),
  )
  const resolvedSelectedClass =
    classes?.find((classItem) => classItem.id === selectedClass?.id)
      ?? classes?.find((classItem) => classItem.id === requestedClassId)
      ?? classes?.[0]
      ?? null
  const { data: allClasses, isLoading: isAllClassesLoading, mutate: mutateAllClasses } = useSWR(
    !isAccessLoading && accessState?.canCreateClass ? 'admin-all-classes' : null,
    fetchAllClasses,
  )
  const classNameSuggestions = Array.from(
    new Set(
      (allClasses ?? [])
        .map((classItem) => classItem.name.trim())
        .filter((name) => name.length > 0),
    ),
  )

  const {
    data: matrixData,
    error: matrixError,
    isLoading: isMatrixLoading,
    mutate: mutateMatrix,
  } = useSWR(
    canReadAdminData && resolvedSelectedClass && hasValidYearMonth
      ? ['matrix', resolvedSelectedClass.id, selectedYearMonth]
      : null,
    ([, classId, yearMonth]) => fetchMatrixData(classId, yearMonth),
  )
  const {
    data: notesState,
    error: notesError,
    isLoading: isNotesLoading,
    mutate: mutateNotesState,
  } = useSWR(
    canReadAdminData && resolvedSelectedClass && hasValidYearMonth
      ? ['admin-weekly-notes', resolvedSelectedClass.id, selectedYearMonth]
      : null,
    ([, classId, yearMonth]) => fetchWeeklyNotesState(classId, yearMonth),
  )

  useEffect(() => {
    setSelectedYearMonth(
      requestedYearMonth && isValidYearMonth(requestedYearMonth) ? requestedYearMonth : getCurrentYearMonth(),
    )
  }, [requestedYearMonth])

  useEffect(() => {
    if (!classes) return

    if (resolvedSelectedClass?.id === selectedClass?.id) {
      return
    }

    setSelectedClass(resolvedSelectedClass)
  }, [classes, resolvedSelectedClass, selectedClass])

  useEffect(() => {
    if (!hasValidYearMonth) {
      return
    }

    const preserveFocus =
      requestedStudentId &&
      requestedClassId === resolvedSelectedClass?.id &&
      requestedYearMonth === selectedYearMonth
    const nextHref = buildAdminDashboardHref({
      classId: resolvedSelectedClass?.id,
      yearMonth: selectedYearMonth,
      studentId: preserveFocus ? requestedStudentId : null,
      week: preserveFocus ? requestedWeek : null,
    })
    const currentHref = currentSearch ? `${pathname}?${currentSearch}` : pathname

    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false })
    }
  }, [
    currentSearch,
    hasValidYearMonth,
    pathname,
    requestedClassId,
    requestedStudentId,
    requestedWeek,
    requestedYearMonth,
    resolvedSelectedClass,
    router,
    selectedYearMonth,
  ])

  useEffect(() => {
    setCreateSuccess(null)
    setClassActionError(null)
    setIsDeleteMode(false)
  }, [selectedYearMonth])

  useEffect(() => {
    if (!isScheduleDialogOpen || !resolvedSelectedClass || !hasValidYearMonth) {
      return
    }

    void (async () => {
      setIsScheduleLoading(true)
      setScheduleDialogError(null)
      setScheduleDialogSuccess(null)

      try {
        const scheduleState = await fetchScheduleState(resolvedSelectedClass.id, selectedYearMonth)
        setScheduleRules(
          scheduleState.rules.map((rule) => ({
            id: rule.id,
            weekday: rule.weekday,
            startTime: rule.startTime,
            endTime: rule.endTime ?? '',
            isEndTimeAuto: shouldAutoAdjustEndTime(rule.startTime, rule.endTime ?? ''),
          })),
        )
        setScheduleSessions(
          scheduleState.sessions.map((session) => ({
            id: session.id,
            sessionDate: session.sessionDate,
            startTime: session.startTime,
            endTime: session.endTime ?? '',
            source: session.source,
            isEndTimeAuto: shouldAutoAdjustEndTime(session.startTime, session.endTime ?? ''),
          })),
        )
        setCanEditScheduleRules(scheduleState.canEditRules)
      } catch (error) {
        setScheduleDialogError(getErrorMessage(error))
      } finally {
        setIsScheduleLoading(false)
      }
    })()
  }, [hasValidYearMonth, isScheduleDialogOpen, resolvedSelectedClass, selectedYearMonth])

  const createSchedulePayload = newClassScheduleRules
    .map((rule) => ({
      weekday: rule.weekday,
      startTime: rule.startTime.trim(),
      endTime: rule.endTime.trim() || null,
    }))
    .filter((rule) => rule.startTime)

  const scheduleSavePayload = {
    scheduleRules: scheduleRules
      .map((rule, index) => ({
        weekday: rule.weekday,
        startTime: rule.startTime.trim(),
        endTime: rule.endTime.trim() || null,
        sortOrder: index,
      }))
      .filter((rule) => rule.startTime),
    sessions: scheduleSessions
      .map((session) => ({
        sessionDate: session.sessionDate,
        startTime: session.startTime.trim(),
        endTime: session.endTime.trim() || null,
        source: session.source,
      }))
      .filter((session) => session.sessionDate && session.startTime),
  }

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return
    if (createSchedulePayload.length === 0) {
      setCreateError('반복 일정은 최소 1개 이상 필요합니다.')
      return
    }
    if (!accessState?.canCreateClass) {
      setCreateError(
        accessState?.isAuthenticated
          ? '새 수업 만들기는 오너 계정에서만 할 수 있습니다.'
          : '수업을 만들려면 먼저 로그인해야 합니다.',
      )
      return
    }

    setIsCreating(true)
    setCreateError(null)
    try {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newClassName.trim(),
          scheduleRules: createSchedulePayload,
        }),
      })

      if (!response.ok) {
        throw new Error(getFriendlyRouteError(await readRouteError(response)))
      }

      const payload = (await response.json()) as { data?: DbClassRow }
      const createdClass = payload.data ? normalizeClassRow(payload.data) : null

      const nextClasses = await mutateClasses()
      await mutateAllClasses()
      if (createdClass) {
        setSelectedClass(createdClass)
      }
      setIsCreateDialogOpen(false)
      setNewClassName('')
      setNewClassScheduleRules([buildDefaultScheduleRule()])
      setCreateSuccess(
        createdClass && nextClasses?.some((classItem) => classItem.id === createdClass.id)
          ? `${createdClass.name} 수업을 만들고 바로 선택했습니다.`
          : createdClass
            ? `${createdClass.name} 수업을 만들고 바로 선택했습니다.`
            : '새 수업을 만들었습니다.',
      )
    } catch (error) {
      const message = getErrorMessage(error)
      setCreateError(message)
      if (!isHandledCreateClassError(message)) {
        console.error('Failed to create class:', message, error)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenScheduleDialog = () => {
    if (!resolvedSelectedClass || !hasValidYearMonth) {
      setClassActionError('수업과 월을 먼저 선택해 주세요.')
      return
    }

    setIsScheduleDialogOpen(true)
  }

  const handleSaveSchedule = async () => {
    if (!resolvedSelectedClass || !hasValidYearMonth) {
      return
    }

    if (scheduleSavePayload.sessions.length === 0) {
      setScheduleDialogError('실제 수업 날짜는 최소 1개 이상 필요합니다.')
      return
    }

    if (canEditScheduleRules && scheduleSavePayload.scheduleRules.length === 0) {
      setScheduleDialogError('반복 일정은 최소 1개 이상 필요합니다.')
      return
    }

    setIsScheduleSaving(true)
    setScheduleDialogError(null)
    setScheduleDialogSuccess(null)

    try {
      const response = await fetch('/api/admin/class-schedule', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: resolvedSelectedClass.id,
          yearMonth: selectedYearMonth,
          scheduleRules: canEditScheduleRules ? scheduleSavePayload.scheduleRules : undefined,
          sessions: scheduleSavePayload.sessions,
        }),
      })

      if (!response.ok) {
        throw new Error(getFriendlyRouteError(await readRouteError(response)))
      }

      setScheduleDialogSuccess('이번 달 실제 수업 날짜를 저장했습니다.')
      await mutateMatrix()
    } catch (error) {
      setScheduleDialogError(getErrorMessage(error))
    } finally {
      setIsScheduleSaving(false)
    }
  }

  const handleAttendanceChange = async (attendanceId: string, status: AttendanceStatus) => {
    if (!accessState?.canManage) {
      throw new Error('관리자 권한이 필요합니다.')
    }

    const target = parseAttendanceTarget(attendanceId)
    if (!target) {
      throw new Error('아직 생성되지 않은 주차 기록은 수정할 수 없습니다.')
    }

    const response = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: target.sessionId,
        classLogId: target.classLogId,
        studentId: target.studentId,
        status,
      }),
    })

    if (!response.ok) {
      throw new Error(getFriendlyRouteError(await readRouteError(response)))
    }

    await mutateMatrix()
  }

  const handleSaveNotes = async (payload: {
    weekNumber: number
    ownerFeedbackText: string
    memberFeedbackByStudentId: Record<string, string>
  }) => {
    if (!resolvedSelectedClass) {
      throw new Error('클래스를 다시 선택해 주세요.')
    }

    const response = await fetch('/api/admin/weekly-notes', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId: resolvedSelectedClass.id,
        yearMonth: selectedYearMonth,
        weekNumber: payload.weekNumber,
        ownerFeedbackText: payload.ownerFeedbackText,
        memberFeedbackByStudentId: payload.memberFeedbackByStudentId,
      }),
    })

    if (!response.ok) {
      throw new Error(getFriendlyRouteError(await readRouteError(response)))
    }

    await mutateNotesState()
  }

  const handleExportCSV = useCallback(() => {
    void (async () => {
      if (!resolvedSelectedClass || !hasValidYearMonth) return

      setIsExporting(true)
      setExportError(null)

      try {
        const searchParams = new URLSearchParams({
          classId: resolvedSelectedClass.id,
          yearMonth: selectedYearMonth,
        })
        const response = await fetch(`/api/admin/export?${searchParams.toString()}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(getFriendlyRouteError(await readRouteError(response)))
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = getDownloadFileName(
          response,
          `${resolvedSelectedClass.name}-${selectedYearMonth}.csv`,
        )
        link.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        setExportError(getErrorMessage(error))
      } finally {
        setIsExporting(false)
      }
    })()
  }, [hasValidYearMonth, resolvedSelectedClass, selectedYearMonth])

  // Stats calculation
  const stats = matrixData ? {
    totalStudents: matrixData.students.length,
    paidStudents: matrixData.students.filter(s => s.paymentStatus === 'paid').length,
    avgAttendance: matrixData.students.length > 0
      ? Math.round(
          (matrixData.students.flatMap(s => s.attendances).filter(a => a.status === 'present').length /
            Math.max(matrixData.students.flatMap(s => s.attendances).length, 1)) * 100
        )
      : 0,
  } : null
  const notesErrorMessage = notesError ? getErrorMessage(notesError) : null

  const handleSelectClass = (classItem: Class) => {
    setSelectedClass(classItem)
    setCreateSuccess(null)
    setClassActionError(null)
    setIsDeleteMode(false)
  }

  const handleToggleDeleteMode = () => {
    setIsDeleteMode((current) => !current)
  }

  const handleDeleteRequest = (classItem: Class) => {
    setClassToDelete(classItem)
    setClassActionError(null)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteClass = async () => {
    if (!classToDelete) return

    setIsDeletingClass(true)
    setClassActionError(null)

    try {
      const response = await fetch('/api/admin/classes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: classToDelete.id,
        }),
      })

      if (!response.ok) {
        throw new Error(getFriendlyRouteError(await readRouteError(response)))
      }

      const deletedClassName = classToDelete.name
      setSelectedClass(null)
      await mutateClasses()
      await mutateAllClasses()
      setIsDeleteDialogOpen(false)
      setClassToDelete(null)
      setIsDeleteMode(false)
      setCreateSuccess(`${deletedClassName} 수업을 목록에서 제외했습니다.`)
    } catch (error) {
      const message = getErrorMessage(error)
      setClassActionError(message)
      console.error('Failed to delete class:', message, error)
    } finally {
      setIsDeletingClass(false)
    }
  }

  const selectorClasses = isDeleteMode ? allClasses || [] : classes || []

  if (isAccessLoading) {
    return (
      <div className="px-4 pb-28 pt-6 md:px-6 md:pb-8 md:pt-6 lg:px-7">
        <Card className={adminInsetCardClass}>
          <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            관리자 권한을 확인하고 있습니다.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!accessState?.isAuthenticated) {
    return (
      <div className="px-4 pb-28 pt-6 md:px-6 md:pb-8 md:pt-6 lg:px-7">
        <Card className={adminAlertCardClass('warning')}>
          <CardContent className="flex flex-col gap-4 py-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div className="space-y-1">
                <p className="font-medium text-amber-950">관리자 세션이 확인되지 않습니다.</p>
                <p className="text-sm text-amber-900/80">
                  다시 로그인한 뒤 운영 화면으로 돌아와 주세요.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="surface" size="sm" className={adminPrimaryButtonClass}>
                <Link href="/">
                  <LogIn className="h-4 w-4" />
                  로그인하기
                </Link>
              </Button>
              <Button asChild variant="surface" size="sm" className={adminCompactButtonClass}>
                <Link href="/">처음으로</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!accessState.canManage) {
    return (
      <div className="px-4 pb-28 pt-6 md:px-6 md:pb-8 md:pt-6 lg:px-7">
        <Card className={adminAlertCardClass('danger')}>
          <CardContent className="flex flex-col gap-4 py-5">
            <div className="space-y-1">
              <p className="font-medium text-destructive">현재 계정에는 관리자 권한이 없습니다.</p>
              <p className="text-sm text-muted-foreground">
                로그인 계정: {accessState.email ?? '알 수 없음'} / 역할: {getRoleLabel(accessState.role)}
              </p>
              <p className="text-sm text-muted-foreground">
                학생 계정이면 학생 화면으로 이동하고, 운영 계정이면 다시 로그인해 주세요.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="surface" size="sm" className={adminPrimaryButtonClass}>
                <Link href="/student">학생 화면으로 이동</Link>
              </Button>
              <Button asChild variant="surface" size="sm" className={adminCompactButtonClass}>
                <Link href="/">다시 로그인하기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <AdminShellHeader
        controlsClassName="md:flex-nowrap"
        mobileActionMenu={
          accessState?.canManage ? (
            <>
              <DropdownMenuItem onSelect={handleOpenScheduleDialog} disabled={!resolvedSelectedClass || !hasValidYearMonth} className={adminDropdownItemClass}>
                <CalendarDays className="h-4 w-4" />
                일정 관리
              </DropdownMenuItem>
              {accessState.canCreateClass ? <DropdownMenuSeparator /> : null}
              {accessState.canCreateClass ? (
                <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)} className={adminDropdownItemClass}>
                  <Plus className="h-4 w-4" />
                  새 수업 만들기
                </DropdownMenuItem>
              ) : null}
              {accessState.canCreateClass ? <DropdownMenuSeparator /> : null}
              {accessState.canCreateClass ? (
                <DropdownMenuItem
                  onSelect={handleToggleDeleteMode}
                  disabled={isAllClassesLoading || (allClasses?.length ?? 0) === 0}
                  variant={isDeleteMode ? 'default' : 'destructive'}
                  className={adminDropdownItemClass}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleteMode ? '삭제 취소' : '삭제 모드'}
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null
        }
        desktopSecondaryActions={
          accessState?.canManage ? (
            <>
              <AdminHeaderActionMenu label="일정">
                <DropdownMenuItem onSelect={handleOpenScheduleDialog} disabled={!resolvedSelectedClass || !hasValidYearMonth} className={adminDropdownItemClass}>
                  <CalendarDays className="h-4 w-4" />
                  일정 관리
                </DropdownMenuItem>
              </AdminHeaderActionMenu>
              {accessState.canCreateClass ? (
                <AdminHeaderActionMenu label="작업">
                  <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)} className={adminDropdownItemClass}>
                    <Plus className="h-4 w-4" />
                    새 수업 만들기
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleToggleDeleteMode}
                    disabled={isAllClassesLoading || (allClasses?.length ?? 0) === 0}
                    variant={isDeleteMode ? 'default' : 'destructive'}
                    className={adminDropdownItemClass}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleteMode ? '삭제 취소' : '삭제 모드'}
                  </DropdownMenuItem>
                </AdminHeaderActionMenu>
              ) : null}
            </>
          ) : null
        }
        controls={
          <>
            <ClassSelector
              classes={selectorClasses}
              selectedClass={resolvedSelectedClass}
              onSelect={handleSelectClass}
              ariaLabel={isDeleteMode ? '삭제할 운영 수업 선택' : '운영 수업 선택'}
              triggerClassName="min-w-0 flex-1 max-w-none sm:min-w-0 sm:max-w-none md:min-w-[10.75rem] md:max-w-[13rem] lg:min-w-[11rem] lg:max-w-[14rem]"
              onCreateNew={accessState?.canCreateClass ? () => setIsCreateDialogOpen(true) : undefined}
              isDeleteMode={isDeleteMode}
              onDeleteRequest={accessState?.canCreateClass ? handleDeleteRequest : undefined}
              showDeleteActionInMenu={false}
              placeholder={
                isDeleteMode
                  ? isAllClassesLoading
                    ? '수업 불러오는 중'
                    : '삭제할 수업 선택'
                  : isClassesLoading
                    ? '수업 불러오는 중'
                    : '수업 선택'
              }
              emptyLabel={
                isDeleteMode
                  ? '삭제할 수업이 없습니다.'
                  : hasValidYearMonth
                    ? '활성 수업이 없습니다.'
                    : '먼저 유효한 월을 선택해 주세요.'
              }
            />
            <AdminMonthSelector
              value={selectedYearMonth}
              onValueChange={setSelectedYearMonth}
              ariaLabel="운영 월 선택"
            />
          </>
        }
      />

      <div className="flex-1 space-y-4 px-4 pb-28 pt-3 md:space-y-4 md:px-6 md:pb-8 md:pt-3 lg:px-7 lg:pt-4">
        {exportError ? (
          <Card className={adminAlertCardClass('danger')}>
            <CardContent className="py-4 text-sm text-destructive">
              {exportError}
            </CardContent>
          </Card>
        ) : null}

        {classActionError ? (
          <Card className={adminAlertCardClass('danger')}>
            <CardContent className="py-4 text-sm text-destructive">{classActionError}</CardContent>
          </Card>
        ) : null}

        {createSuccess ? (
          <Card className={adminAlertCardClass('success')}>
            <CardContent className="py-4 text-sm text-emerald-950">{createSuccess}</CardContent>
          </Card>
        ) : null}

        {stats ? (
          <>
            <div className="grid grid-cols-3 gap-2 md:hidden">
              <Card className={adminMetricCardClass('mint')}>
                <CardContent className="flex items-center justify-between gap-2 px-3 py-3 md:px-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:text-sm">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>학생 수</span>
                    </div>
                  </div>
                  <div className="spm-display text-[1.45rem] text-foreground md:text-[1.8rem]">{stats.totalStudents}</div>
                </CardContent>
              </Card>
              <Card className={adminMetricCardClass('warm')}>
                <CardContent className="flex items-center justify-between gap-2 px-3 py-3 md:px-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:text-sm">
                      <CreditCard className="h-3.5 w-3.5 shrink-0" />
                      <span>결제 확인</span>
                    </div>
                  </div>
                  <div className="spm-display text-[1.45rem] text-accent-foreground md:text-[1.8rem]">{stats.paidStudents}</div>
                </CardContent>
              </Card>
              <Card className={adminMetricCardClass('blue')}>
                <CardContent className="flex items-center justify-between gap-2 px-3 py-3 md:px-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:text-sm">
                      <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>출석률</span>
                    </div>
                  </div>
                  <div className="spm-display text-[1.45rem] text-secondary-foreground md:text-[1.8rem]">{stats.avgAttendance}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="hidden md:grid md:grid-cols-3 md:gap-3">
              <Card className={adminMetricCardClass('mint')}>
                <CardContent className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#73815f]">학생 수</div>
                    <div className="mt-1 text-sm text-[#556449]">이번 달 운영 대상</div>
                  </div>
                  <div className="spm-display text-[1.35rem] text-[#314127]">{stats.totalStudents}</div>
                </CardContent>
              </Card>
              <Card className={adminMetricCardClass('warm')}>
                <CardContent className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b742e]">결제 확인</div>
                    <div className="mt-1 text-sm text-[#75663d]">승인된 등록</div>
                  </div>
                  <div className="spm-display text-[1.35rem] text-[#8a6a25]">{stats.paidStudents}</div>
                </CardContent>
              </Card>
              <Card className={adminMetricCardClass('blue')}>
                <CardContent className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e74b7]">출석률</div>
                    <div className="mt-1 text-sm text-[#6174a7]">이달 평균 상태</div>
                  </div>
                  <div className="spm-display text-[1.35rem] text-[#5a79c9]">{stats.avgAttendance}%</div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}

        <Card className={adminSurfaceCardClass}>
          <CardHeader className="px-4 pb-2 pt-3.5 md:px-5 md:pb-2.5 md:pt-4 lg:px-6 lg:pb-3 lg:pt-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="spm-display text-[1.65rem] text-foreground md:text-[1.85rem] lg:text-[1.45rem]">출석부</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="surface"
                  size="sm"
                  onClick={handleExportCSV}
                  aria-label="출석 CSV 다운로드"
                  disabled={
                    !accessState?.canManage ||
                    !resolvedSelectedClass ||
                    !hasValidYearMonth ||
                    !matrixData ||
                    matrixData.students.length === 0 ||
                    isExporting
                  }
                  className={cn(adminCompactIconButtonClass, 'h-9 w-9 rounded-[0.95rem]')}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="surface"
                      aria-label="학생 출석부 필터 열기"
                      className={cn(
                        adminCompactIconButtonClass,
                        'relative h-9 w-9 rounded-[0.95rem]',
                        showReplyOnly ? 'border-[#e0d8ff] bg-[#f7f3ff] text-[#6f59b5]' : '',
                      )}
                    >
                      <Filter className="h-4 w-4" />
                      {showReplyOnly ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#7b68b1]" /> : null}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={adminDropdownContentClass}>
                    <DropdownMenuCheckboxItem
                      checked={showReplyOnly}
                      onCheckedChange={(checked) => setShowReplyOnly(checked === true)}
                      className={adminDropdownItemClass}
                    >
                      답글 도착만
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0 md:px-5 md:pb-5 lg:px-6 lg:pb-6">
            {!resolvedSelectedClass ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground">
                  {classesError
                    ? '수업 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
                    : !hasValidYearMonth
                      ? '먼저 유효한 월을 선택해 주세요.'
                      : isClassesLoading
                        ? '수업 목록을 불러오는 중입니다.'
                        : '선택할 수 있는 수업이 없습니다.'}
                </p>
                {accessState?.canCreateClass ? (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="surface"
                      className={adminPrimaryButtonClass}
                      onClick={() => setIsCreateDialogOpen(true)}
                      disabled={!accessState.canCreateClass}
                    >
                      <Plus className="h-4 w-4" />
                      새 수업 만들기
                    </Button>
                  </div>
                ) : accessState?.canManage ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    새 수업 만들기는 오너 계정에서만 가능합니다.
                  </p>
                ) : null}
              </div>
            ) : !hasValidYearMonth ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">유효한 월 범위를 선택해 주세요.</p>
              </div>
            ) : isMatrixLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : matrixError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-destructive" />
                    <p className="font-medium text-destructive">운영 데이터를 불러오지 못했습니다.</p>
                    <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(matrixError)}</p>
                  </div>
                ) : !matrixData ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">선택한 범위에 아직 운영 데이터가 없습니다.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      수업과 월 범위를 바꾸거나, 등록 상태와 수업 기록을 먼저 확인해 주세요.
                    </p>
                  </div>
                ) : (
                  <AdminMatrix
                    data={matrixData}
                    notesState={notesState ?? null}
                    showReplyOnly={showReplyOnly}
                    isNotesLoading={isNotesLoading}
                    notesErrorMessage={notesErrorMessage}
                    focusStudentId={requestedStudentId}
                    focusWeekNumber={requestedWeek}
                    onAttendanceChange={handleAttendanceChange}
                    onSaveWeekNotes={handleSaveNotes}
                  />
                )}
          </CardContent>
        </Card>
      </div>

      {/* Create Class Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setCreateError(null)
            setNewClassName('')
            setNewClassScheduleRules([buildDefaultScheduleRule()])
          }
        }}
      >
        <DialogContent className={adminDialogContentClass}>
          <DialogHeader>
            <DialogTitle>새 수업 만들기</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {createError ? (
              <div className="rounded-md border border-destructive/30 bg-[#fff5f0] px-3 py-2 text-sm text-destructive">
                {createError}
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="className">수업 이름</Label>
              <AdminClassNameField
                value={newClassName}
                onChange={(nextValue) => {
                  setNewClassName(nextValue)
                  setCreateError(null)
                }}
                suggestions={classNameSuggestions}
                disabled={isAllClassesLoading}
              />
            </div>
            <div className="space-y-3 rounded-[1.5rem] border border-[#e5ecd8] bg-[#fbfcf7] p-3">
              <div>
                <div className="text-sm font-semibold text-[#314127]">기본 반복 일정</div>
              </div>
              <div className="space-y-3">
                {newClassScheduleRules.map((rule, index) => (
                  <div key={rule.id} className="rounded-[1.2rem] border border-[#e5ecd8] bg-white px-3 py-3">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto]">
                      <div className="space-y-2">
                        <Label htmlFor={`new-rule-weekday-${rule.id}`}>요일</Label>
                        <select
                          id={`new-rule-weekday-${rule.id}`}
                          value={String(rule.weekday)}
                          onChange={(event) =>
                            setNewClassScheduleRules((current) =>
                              current.map((item) =>
                                item.id === rule.id ? { ...item, weekday: Number(event.target.value) } : item,
                              ),
                            )
                          }
                          className={`${adminSurfaceInputClass} h-11`}
                        >
                          {WEEKDAY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}요일
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`new-rule-start-${rule.id}-hour`}>시작</Label>
                        <AdminScheduleTimeField
                          idPrefix={`new-rule-start-${rule.id}`}
                          value={rule.startTime}
                          onChange={(nextStartTime) =>
                            setNewClassScheduleRules((current) =>
                              current.map((item) =>
                                item.id === rule.id ? updateEditableTimeRange(item, nextStartTime) : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`new-rule-end-${rule.id}-hour`}>종료</Label>
                        <AdminScheduleTimeField
                          idPrefix={`new-rule-end-${rule.id}`}
                          value={rule.endTime}
                          onChange={(nextEndTime) =>
                            setNewClassScheduleRules((current) =>
                              current.map((item) =>
                                item.id === rule.id
                                  ? {
                                      ...item,
                                      endTime: nextEndTime,
                                      isEndTimeAuto: nextEndTime.trim().length === 0,
                                    }
                                  : item,
                              ),
                            )
                          }
                          allowEmpty
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <Button
                          type="button"
                          variant="surface"
                          onClick={() =>
                            setNewClassScheduleRules((current) => current.filter((item) => item.id !== rule.id))
                          }
                          disabled={newClassScheduleRules.length <= 1}
                          className={adminCompactDangerButtonClass}
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-[#7b866e]">반복 규칙 {index + 1}</div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="surface"
                  onClick={() => setNewClassScheduleRules((current) => [...current, buildDefaultScheduleRule()])}
                  className={adminCompactButtonClass}
                >
                  <Plus className="h-4 w-4" />
                  반복 추가
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="surface" onClick={() => setIsCreateDialogOpen(false)} className={adminCompactButtonClass}>
              취소
            </Button>
            <Button
              variant="surface"
              onClick={handleCreateClass}
              disabled={!newClassName.trim() || createSchedulePayload.length === 0 || isCreating || !accessState?.canCreateClass}
              className={adminPrimaryButtonClass}
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={(open) => {
          setIsScheduleDialogOpen(open)
          if (!open) {
            setScheduleDialogError(null)
            setScheduleDialogSuccess(null)
          }
        }}
      >
        <DialogContent className={`${adminDialogContentClass} max-h-[85dvh] overflow-hidden`}>
          <DialogHeader>
            <DialogTitle>일정 관리</DialogTitle>
            <DialogDescription>
              {resolvedSelectedClass
                ? `${resolvedSelectedClass.name} / ${formatYearMonthLabel(selectedYearMonth)} 실제 수업 날짜를 관리합니다.`
                : '수업과 월을 먼저 선택해 주세요.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto py-2">
            {scheduleDialogError ? (
              <div className="rounded-md border border-destructive/30 bg-[#fff5f0] px-3 py-2 text-sm text-destructive">
                {scheduleDialogError}
              </div>
            ) : null}
            {scheduleDialogSuccess ? (
              <div className="rounded-md border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                {scheduleDialogSuccess}
              </div>
            ) : null}
            {isScheduleLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                수업 일정을 불러오는 중입니다.
              </div>
            ) : (
              <ClassScheduleEditor
                yearMonth={selectedYearMonth}
                rules={scheduleRules}
                sessions={scheduleSessions}
                canEditRules={canEditScheduleRules}
                onRulesChange={setScheduleRules}
                onSessionsChange={setScheduleSessions}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="surface" onClick={() => setIsScheduleDialogOpen(false)} className={adminCompactButtonClass}>
              닫기
            </Button>
            <Button
              variant="surface"
              onClick={handleSaveSchedule}
              disabled={isScheduleLoading || isScheduleSaving || !resolvedSelectedClass}
              className={adminPrimaryButtonClass}
            >
              {isScheduleSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setClassToDelete(null)
          }
        }}
      >
        <DialogContent className={adminDialogContentClass}>
          <DialogHeader>
            <DialogTitle>수업 삭제</DialogTitle>
            <DialogDescription>
              {classToDelete
                ? `${classToDelete.name} 수업을 운영 목록에서 제외합니다. 기존 데이터는 보존되고 활성 목록에서만 빠집니다.`
                : '삭제할 수업을 다시 선택해 주세요.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="surface"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setClassToDelete(null)
              }}
              className={adminCompactButtonClass}
            >
              취소
            </Button>
            <Button
              variant="surface"
              onClick={handleDeleteClass}
              disabled={!classToDelete || isDeletingClass}
              className={adminCompactDangerButtonClass}
            >
              {isDeletingClass ? <Loader2 className="h-4 w-4 animate-spin" /> : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
