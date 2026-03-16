'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel, getCurrentYearMonth, isValidYearMonth } from '@/lib/admin/matrix'
import { getRoleLabel, isAdminRole, isOwnerRole } from '@/lib/auth/roles'
import { AdminMobileUtilityMenu } from '@/components/admin-mobile-utility-menu'
import { AdminMobileSettingsLink } from '@/components/admin-mobile-settings-link'
import { ClassSelector } from '@/components/class-selector'
import { AdminMatrix } from '@/components/admin-matrix'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CalendarCheck, CreditCard, Download, Loader2, LogIn, Plus, Users } from 'lucide-react'
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
  const response = await fetch('/api/admin/classes', {
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
    case 'ENROLLMENT_NOT_FOUND':
      return '대상 등록 정보를 찾을 수 없습니다.'
    case 'CLASS_LOG_NOT_FOUND':
      return '대상 수업 기록을 찾을 수 없습니다.'
    default:
      return code
  }
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

function parseAttendanceTarget(attendanceId: string) {
  if (attendanceId.startsWith('missing:')) return null

  const [classLogId, studentId] = attendanceId.split(':')
  if (!classLogId || !studentId) return null

  return {
    classLogId,
    studentId,
  }
}

function getDownloadFileName(response: Response, fallbackName: string) {
  const contentDisposition = response.headers.get('content-disposition')
  const matchedName = contentDisposition?.match(/filename="([^"]+)"/)
  return matchedName?.[1] ?? fallbackName
}

export default function AdminDashboard() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedYearMonth, setSelectedYearMonth] = useState(getCurrentYearMonth())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeletingClass, setIsDeletingClass] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [classActionError, setClassActionError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const hasValidYearMonth = isValidYearMonth(selectedYearMonth)

  const { data: accessState, isLoading: isAccessLoading } = useSWR('admin-access', fetchAdminAccessState)
  const {
    data: classes,
    error: classesError,
    isLoading: isClassesLoading,
    mutate: mutateClasses,
  } = useSWR(
    hasValidYearMonth ? ['admin-classes', selectedYearMonth] : null,
    ([, yearMonth]) => fetchClasses(yearMonth),
  )
  const resolvedSelectedClass =
    classes?.find((classItem) => classItem.id === selectedClass?.id) ?? classes?.[0] ?? null
  const { data: allClasses, isLoading: isAllClassesLoading, mutate: mutateAllClasses } = useSWR(
    accessState?.canCreateClass ? 'admin-all-classes' : null,
    fetchAllClasses,
  )

  const {
    data: matrixData,
    error: matrixError,
    isLoading: isMatrixLoading,
    mutate: mutateMatrix,
  } = useSWR(
    resolvedSelectedClass && hasValidYearMonth
      ? ['matrix', resolvedSelectedClass.id, selectedYearMonth]
      : null,
    ([, classId, yearMonth]) => fetchMatrixData(classId, yearMonth),
  )

  useEffect(() => {
    if (!classes) return

    if (resolvedSelectedClass?.id === selectedClass?.id) {
      return
    }

    setSelectedClass(resolvedSelectedClass)
  }, [classes, resolvedSelectedClass, selectedClass])

  useEffect(() => {
    setCreateSuccess(null)
    setClassActionError(null)
    setIsDeleteMode(false)
  }, [selectedYearMonth])

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return
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
      console.error('Failed to create class:', message, error)
    } finally {
      setIsCreating(false)
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

  const classSelectionHint = resolvedSelectedClass
    ? `${resolvedSelectedClass.name} / ${formatYearMonthLabel(selectedYearMonth)}`
    : hasValidYearMonth
      ? '관리할 수업을 먼저 선택해 주세요'
      : '월 범위를 다시 확인해 주세요'
  const selectorClasses = isDeleteMode ? allClasses || [] : classes || []

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-2 md:h-14 md:flex-nowrap md:justify-between md:px-6 md:py-0">
          <h1 className="mr-auto font-semibold text-lg md:hidden">운영</h1>
          <div className="order-3 flex w-full items-center gap-2 md:order-none md:w-auto">
            <ClassSelector
              classes={selectorClasses}
              selectedClass={resolvedSelectedClass}
              onSelect={handleSelectClass}
              onCreateNew={accessState?.canCreateClass ? () => setIsCreateDialogOpen(true) : undefined}
              isDeleteMode={isDeleteMode}
              onToggleDeleteMode={accessState?.canCreateClass ? handleToggleDeleteMode : undefined}
              onDeleteRequest={accessState?.canCreateClass ? handleDeleteRequest : undefined}
              placeholder={isDeleteMode ? (isAllClassesLoading ? '수업 불러오는 중' : '삭제할 수업 선택') : isClassesLoading ? '수업 불러오는 중' : '수업 선택'}
              emptyLabel={
                isDeleteMode
                  ? '삭제할 수업이 없습니다.'
                  : hasValidYearMonth
                    ? '활성 수업이 없습니다.'
                    : '먼저 유효한 월을 선택해 주세요.'
              }
            />
            <Input
              type="month"
              value={selectedYearMonth}
              onChange={(event) => setSelectedYearMonth(event.target.value)}
              className="w-[132px] sm:w-[148px]"
              aria-label="운영 월 선택"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <AdminMobileSettingsLink />
            <AdminMobileUtilityMenu />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={
                !accessState?.canManage ||
                !resolvedSelectedClass ||
                !hasValidYearMonth ||
                !matrixData ||
                matrixData.students.length === 0 ||
                isExporting
              }
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {isAccessLoading ? (
          <Card>
            <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              관리자 권한을 확인하고 있습니다.
            </CardContent>
          </Card>
        ) : !accessState?.isAuthenticated ? (
          <Card className="border-amber-300/50 bg-amber-50/50">
            <CardContent className="flex flex-col gap-3 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-950">관리자 작업을 하려면 먼저 로그인해야 합니다.</p>
                  <p className="text-sm text-amber-900/80">
                    현재 이 화면은 보이지만, 수업 만들기와 수정은 실제 로그인 권한을 따릅니다.
                  </p>
                </div>
              </div>
              <div>
                <Button asChild size="sm" className="gap-2">
                  <Link href="/auth/login">
                    <LogIn className="h-4 w-4" />
                    로그인하러 가기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !accessState.canManage ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col gap-2 py-4">
              <p className="font-medium text-destructive">현재 계정에는 관리자 권한이 없습니다.</p>
              <p className="text-sm text-muted-foreground">
                로그인 계정: {accessState.email ?? '알 수 없음'} / 역할: {getRoleLabel(accessState.role)}
              </p>
              <p className="text-sm text-muted-foreground">
                관리자 또는 오너 계정으로 다시 로그인한 뒤 시도해 주세요.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {exportError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-4 text-sm text-destructive">
              {exportError}
            </CardContent>
          </Card>
        ) : null}

        {classActionError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-4 text-sm text-destructive">{classActionError}</CardContent>
          </Card>
        ) : null}

        {createSuccess ? (
          <Card className="border-emerald-300/40 bg-emerald-50/50">
            <CardContent className="py-4 text-sm text-emerald-950">{createSuccess}</CardContent>
          </Card>
        ) : null}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <Card className="gap-0 py-0">
              <CardHeader className="px-3 pt-2 pb-1 md:px-6 md:pt-4">
                <CardTitle className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:text-sm">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>학생 수</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0 md:px-6 md:pb-4">
                <div className="text-base font-bold md:text-2xl">{stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card className="gap-0 py-0">
              <CardHeader className="px-3 pt-2 pb-1 md:px-6 md:pt-4">
                <CardTitle className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:text-sm">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  <span>결제 확인</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0 md:px-6 md:pb-4">
                <div className="text-base font-bold text-success md:text-2xl">{stats.paidStudents}</div>
              </CardContent>
            </Card>
            <Card className="gap-0 py-0">
              <CardHeader className="px-3 pt-2 pb-1 md:px-6 md:pt-4">
                <CardTitle className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:text-sm">
                  <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>출석률</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0 md:px-6 md:pb-4">
                <div className="text-base font-bold md:text-2xl">{stats.avgAttendance}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Matrix */}
        <Card className="gap-0 py-0">
          <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3">
            <CardTitle className="text-base">{classSelectionHint}</CardTitle>
            {!resolvedSelectedClass ? (
              <p className="text-sm text-muted-foreground">
                현재 월은 기본으로 잡혀 있고, 활성 수업 중 관리할 수업을 먼저 고를 수 있습니다. 이달 등록이 있는 수업이 먼저 보이고, 미배정 수업도 이어서 선택할 수 있습니다.
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0 md:px-6 md:pb-6">
            {!resolvedSelectedClass ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  {classesError
                    ? '수업 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
                    : !hasValidYearMonth
                      ? '먼저 유효한 월을 선택해 주세요.'
                      : isClassesLoading
                        ? '수업 목록을 불러오는 중입니다.'
                        : '선택할 수 있는 활성 수업이 없습니다.'}
                </p>
                {accessState?.canCreateClass ? (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      className="gap-2"
                      onClick={() => setIsCreateDialogOpen(true)}
                      disabled={!accessState.canCreateClass}
                    >
                      <Plus className="h-4 w-4" />
                      새 수업 만들기
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setIsDeleteMode((current) => !current)}
                      disabled={!accessState.canCreateClass || (classes?.length ?? 0) === 0}
                    >
                      삭제
                    </Button>
                  </div>
                ) : accessState?.canManage ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    새 수업 만들기는 오너 계정에서만 가능합니다.
                  </p>
                ) : null}
              </div>
            ) : !hasValidYearMonth ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">유효한 월 범위를 선택해 주세요.</p>
              </div>
            ) : isMatrixLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : matrixError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-destructive" />
                <p className="font-medium text-destructive">운영 데이터를 불러오지 못했습니다.</p>
                <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(matrixError)}</p>
              </div>
            ) : !matrixData ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">선택한 범위에 아직 운영 데이터가 없습니다.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  수업과 월 범위를 바꾸거나, 등록 상태와 수업 기록을 먼저 확인해 주세요.
                </p>
              </div>
            ) : (
              <AdminMatrix
                data={matrixData}
                onAttendanceChange={handleAttendanceChange}
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
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 수업 만들기</DialogTitle>
            <DialogDescription>
              현재 운영 기준에서는 수업 이름만 먼저 만들고, 생성 직후 선택 수업을 새 항목으로 바꿉니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {createError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {createError}
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="className">수업 이름</Label>
              <Input
                id="className"
                value={newClassName}
                onChange={(e) => {
                  setNewClassName(e.target.value)
                  setCreateError(null)
                }}
                placeholder="예: 2026년 3월 기초반"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              이 동작은 오너 계정에서만 열립니다.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateClass}
              disabled={!newClassName.trim() || isCreating || !accessState?.canCreateClass}
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : '생성'}
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
        <DialogContent>
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
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setClassToDelete(null)
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClass}
              disabled={!classToDelete || isDeletingClass}
            >
              {isDeletingClass ? <Loader2 className="h-4 w-4 animate-spin" /> : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
