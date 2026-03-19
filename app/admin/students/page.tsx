'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { AlertCircle, Loader2, Plus, Search, Trash2, UserPlus } from 'lucide-react'

import { formatYearMonthLabel, getCurrentYearMonth, isValidYearMonth } from '@/lib/admin/matrix'
import { isAdminRole, normalizeUserRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/client'
import type { Class, EnrollmentLifecycleStatus, PaymentStatus } from '@/lib/types'
import { AdminMobileUtilityMenu } from '@/components/admin-mobile-utility-menu'
import { AdminMobileSettingsLink } from '@/components/admin-mobile-settings-link'
import { ClassSelector } from '@/components/class-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const supabase = createClient()

interface AdminAccessState {
  email: string | null
  role: string | null
  canManage: boolean
  isOwner: boolean
}

interface EnrollmentStudent {
  id: string
  email: string | null
  full_name: string | null
}

interface EnrollmentWithProfile {
  id: string
  class_id: string
  student_id: string
  year_month: string
  payment_status: boolean | null
  status: EnrollmentLifecycleStatus
  profiles: EnrollmentStudent
}

interface AvailableStudent {
  id: string
  email: string | null
  full_name: string | null
}

const enrollmentStatusMeta: Record<EnrollmentLifecycleStatus, { label: string; description: string }> = {
  ACTIVE: {
    label: '수강 중',
    description: '현재 월 운영 기준으로 계속 관리하는 상태',
  },
  PENDING: {
    label: '보류',
    description: '배정은 되었지만 아직 확인 중인 상태',
  },
  CANCELLED: {
    label: '취소됨',
    description: '삭제 대신 취소 기록으로 남겨 두는 상태',
  },
}

const paymentStatusMeta: Record<'paid' | 'unpaid', { label: string; buttonClassName: string }> = {
  paid: {
    label: '결제 확인',
    buttonClassName: 'border-success/40 bg-success/10 text-success hover:bg-success/15 hover:text-success',
  },
  unpaid: {
    label: '미결제',
    buttonClassName: 'border-warning/40 bg-warning/10 text-warning-foreground hover:bg-warning/15 hover:text-warning-foreground',
  },
}

async function readRouteError(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null
  return payload?.error ?? 'REQUEST_FAILED'
}

async function fetchClassesByYearMonth(yearMonth: string): Promise<Class[]> {
  const searchParams = new URLSearchParams({ yearMonth })
  const response = await fetch(`/api/admin/classes?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(await readRouteError(response))
  }

  const payload = (await response.json()) as { data?: Class[] }
  return payload.data ?? []
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
      isOwner: false,
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  const role = typeof profile?.role === 'string' ? profile.role : null
  const normalizedRole = normalizeUserRole(role)

  return {
    email: profile?.email ?? user.email ?? null,
    role,
    canManage: isAdminRole(role),
    isOwner: normalizedRole === 'OWNER',
  }
}

async function fetchEnrollments(classId: string, yearMonth: string): Promise<EnrollmentWithProfile[]> {
  const searchParams = new URLSearchParams({ classId, yearMonth })
  const response = await fetch(`/api/admin/enrollments?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(await readRouteError(response))
  }

  const payload = (await response.json()) as { data?: EnrollmentWithProfile[] }
  return payload.data ?? []
}

async function fetchAvailableStudents(classId: string, yearMonth: string): Promise<AvailableStudent[]> {
  const { data: enrolledIds, error: enrolledIdsError } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('class_id', classId)
    .eq('year_month', yearMonth)

  if (enrolledIdsError) throw enrolledIdsError

  const enrolledStudentIds = enrolledIds?.map((item) => item.student_id) || []

  let query = supabase
    .from('profiles')
    .select('id, email, full_name')
    .or('role.eq.STUDENT,role.eq.student')
    .order('full_name', { ascending: true })

  if (enrolledStudentIds.length > 0) {
    query = query.not('id', 'in', `(${enrolledStudentIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as AvailableStudent[]
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return '요청 처리에 실패했습니다.'
}

function getFriendlyErrorMessage(message: string) {
  if (message === 'AUTH_REQUIRED') {
    return '로그인이 필요합니다.'
  }

  if (message === 'ADMIN_REQUIRED') {
    return '현재 계정으로는 이 작업을 수행할 수 없습니다.'
  }

  if (message === 'OWNER_REQUIRED') {
    return '등록 삭제는 오너 계정만 할 수 있습니다.'
  }

  if (message === 'INVALID_ENROLLMENT_INPUT') {
    return '등록 입력값을 다시 확인해 주세요.'
  }

  if (message === 'INVALID_YEAR_MONTH') {
    return '유효한 월 범위를 선택해 주세요.'
  }

  if (message === 'CLASS_LIST_READ_FAILED') {
    return '수업 목록을 불러오지 못했습니다.'
  }

  if (message === 'INVALID_ENROLLMENT_STATUS') {
    return '유효한 등록 상태가 아닙니다.'
  }

  if (message === 'ENROLLMENT_ALREADY_EXISTS') {
    return '이미 같은 월에 등록된 학생입니다.'
  }

  if (message === 'ENROLLMENT_NOT_FOUND') {
    return '대상 등록 정보를 찾을 수 없습니다.'
  }

  if (message === 'ENROLLMENT_READ_FAILED') {
    return '학생 등록 정보를 불러오지 못했습니다.'
  }

  if (message === 'ENROLLMENT_CREATE_FAILED') {
    return '학생 등록 추가에 실패했습니다.'
  }

  if (message === 'ENROLLMENT_STATUS_UPDATE_FAILED') {
    return '등록 상태 변경에 실패했습니다.'
  }

  if (message === 'ENROLLMENT_DELETE_FAILED') {
    return '등록 삭제에 실패했습니다.'
  }

  if (message === 'INVALID_PAYMENT_INPUT') {
    return '결제 상태 입력값을 다시 확인해 주세요.'
  }

  if (message === 'PAYMENT_UPDATE_FAILED') {
    return '결제 상태 변경에 실패했습니다.'
  }

  if (message.includes('permission denied')) {
    return '현재 계정으로는 이 작업을 수행할 수 없습니다.'
  }

  if (message.includes('duplicate key value')) {
    return '이미 같은 월에 등록된 학생입니다.'
  }

  if (message.includes('invalid enrollment status')) {
    return '유효한 등록 상태가 아닙니다.'
  }

  if (message.includes('enrollment not found')) {
    return '대상 등록 정보를 찾을 수 없습니다.'
  }

  return message
}

export default function StudentsPage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedYearMonth, setSelectedYearMonth] = useState(getCurrentYearMonth())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const hasValidYearMonth = isValidYearMonth(selectedYearMonth)

  const { data: accessState, error: accessError } = useSWR('admin-students-access', fetchAdminAccessState)
  const {
    data: classes,
    error: classesError,
    isLoading: isClassesLoading,
  } = useSWR(
    hasValidYearMonth ? ['admin-student-classes', selectedYearMonth] : null,
    ([, yearMonth]) => fetchClassesByYearMonth(yearMonth),
  )
  const resolvedSelectedClass =
    classes?.find((classItem) => classItem.id === selectedClass?.id) ?? classes?.[0] ?? null

  const {
    data: enrollments,
    error: enrollmentsError,
    isLoading: isEnrollmentsLoading,
    mutate: mutateEnrollments,
  } = useSWR(
    resolvedSelectedClass && hasValidYearMonth
      ? ['admin-enrollments', resolvedSelectedClass.id, selectedYearMonth]
      : null,
    ([, classId, yearMonth]) => fetchEnrollments(classId, yearMonth),
  )

  const {
    data: availableStudents,
    error: availableStudentsError,
    isLoading: isAvailableStudentsLoading,
    mutate: mutateAvailableStudents,
  } = useSWR(
    resolvedSelectedClass && hasValidYearMonth && isAddDialogOpen
      ? ['available-students', resolvedSelectedClass.id, selectedYearMonth]
      : null,
    ([, classId, yearMonth]) => fetchAvailableStudents(classId, yearMonth),
  )

  useEffect(() => {
    if (!classes) return

    if (resolvedSelectedClass?.id === selectedClass?.id) {
      return
    }

    setSelectedClass(resolvedSelectedClass)
  }, [classes, resolvedSelectedClass, selectedClass])

  useEffect(() => {
    setIsDeleteMode(false)
  }, [selectedYearMonth])

  useEffect(() => {
    if ((enrollments?.length ?? 0) > 0) return
    setIsDeleteMode(false)
  }, [enrollments])

  const handleEnrollStudent = async (studentId: string) => {
    if (!resolvedSelectedClass || !hasValidYearMonth) return

    setIsEnrolling(studentId)
    setActionError(null)

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: resolvedSelectedClass.id,
          studentId,
          yearMonth: selectedYearMonth,
          status: 'ACTIVE',
        }),
      })

      if (!response.ok) {
        throw new Error(await readRouteError(response))
      }

      await mutateEnrollments()
      await mutateAvailableStudents()
    } catch (error) {
      setActionError(getFriendlyErrorMessage(getErrorMessage(error)))
    } finally {
      setIsEnrolling(null)
    }
  }

  const handleStatusChange = async (enrollmentId: string, status: EnrollmentLifecycleStatus) => {
    setIsUpdatingStatus(enrollmentId)
    setActionError(null)

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          status,
        }),
      })

      if (!response.ok) {
        throw new Error(await readRouteError(response))
      }

      await mutateEnrollments()
    } catch (error) {
      setActionError(getFriendlyErrorMessage(getErrorMessage(error)))
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  const handlePaymentChange = async (enrollmentId: string, paymentStatus: Extract<PaymentStatus, 'paid' | 'unpaid'>) => {
    setIsUpdatingPayment(enrollmentId)
    setActionError(null)

    try {
      const response = await fetch('/api/admin/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          paymentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error(await readRouteError(response))
      }

      await mutateEnrollments()
    } catch (error) {
      setActionError(getFriendlyErrorMessage(getErrorMessage(error)))
    } finally {
      setIsUpdatingPayment(null)
    }
  }

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!accessState?.isOwner) {
      setActionError('등록 삭제는 오너 계정만 할 수 있습니다.')
      return
    }

    setIsRemoving(enrollmentId)
    setActionError(null)

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
        }),
      })

      if (!response.ok) {
        throw new Error(await readRouteError(response))
      }

      await mutateEnrollments()
      await mutateAvailableStudents()
    } catch (error) {
      setActionError(getFriendlyErrorMessage(getErrorMessage(error)))
    } finally {
      setIsRemoving(null)
    }
  }

  const filteredAvailableStudents =
    availableStudents?.filter((student) => {
      const normalizedQuery = searchQuery.toLowerCase()
      return (
        student.full_name?.toLowerCase().includes(normalizedQuery) ||
        student.email?.toLowerCase().includes(normalizedQuery)
      )
    }) || []

  const pageErrorMessage = accessError
    ? '운영 권한을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'
    : classesError
      ? '수업 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
      : enrollmentsError
        ? getFriendlyErrorMessage(getErrorMessage(enrollmentsError))
        : null

  const addDialogErrorMessage = availableStudentsError
    ? '배정 가능한 학생 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    : null

  const classSelectionHint = resolvedSelectedClass
    ? `${resolvedSelectedClass.name} / ${formatYearMonthLabel(selectedYearMonth)}`
    : hasValidYearMonth
      ? '등록을 관리할 수업을 먼저 선택해 주세요'
      : '월 범위를 다시 확인해 주세요'

  const handleSelectClass = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsDeleteMode(false)
  }

  const enrollmentSummary = resolvedSelectedClass
    ? {
        total: enrollments?.length ?? 0,
        active: enrollments?.filter((item) => item.status === 'ACTIVE').length ?? 0,
        pending: enrollments?.filter((item) => item.status === 'PENDING').length ?? 0,
        paid: enrollments?.filter((item) => item.payment_status).length ?? 0,
      }
    : null

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex min-h-[3.25rem] flex-wrap items-center gap-2 px-4 py-2 md:h-[3.25rem] md:flex-nowrap md:justify-between md:px-6 md:py-0">
          <h1 className="mr-auto font-semibold text-lg md:hidden">학생</h1>
          <div className="order-3 flex w-full items-center gap-2 md:order-none md:w-auto">
            <ClassSelector
              classes={classes || []}
              selectedClass={resolvedSelectedClass}
              onSelect={handleSelectClass}
              placeholder={isClassesLoading ? '수업 불러오는 중' : '수업 선택'}
              emptyLabel={
                hasValidYearMonth
                  ? '활성 수업이 없습니다.'
                  : '먼저 유효한 월을 선택해 주세요.'
              }
            />
            <Input
              type="month"
              value={selectedYearMonth}
              onChange={(event) => setSelectedYearMonth(event.target.value)}
              className="w-[132px] sm:w-[148px]"
              aria-label="등록 월 선택"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <AdminMobileSettingsLink />
            <AdminMobileUtilityMenu />
            <Button
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              disabled={!resolvedSelectedClass || !hasValidYearMonth || !accessState?.canManage}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">학생 배정</span>
            </Button>
            {accessState?.isOwner ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeleteMode((current) => !current)}
                disabled={!resolvedSelectedClass || (enrollments?.length ?? 0) === 0}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{isDeleteMode ? '삭제 취소' : '삭제'}</span>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-3 p-4 md:p-5">
        {actionError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-4 text-sm text-destructive">{actionError}</CardContent>
          </Card>
        ) : null}

        <Card className="gap-0 py-0">
          <CardHeader className="px-4 pt-3.5 pb-2 md:px-5 md:pt-4">
            <CardTitle className="text-base">{classSelectionHint}</CardTitle>
            {resolvedSelectedClass && enrollmentSummary ? (
              <CardDescription>
                학생 {enrollmentSummary.total}명 · 수강 중 {enrollmentSummary.active}명 · 보류 {enrollmentSummary.pending}명 · 결제 확인 {enrollmentSummary.paid}명
              </CardDescription>
            ) : null}
            {resolvedSelectedClass && isDeleteMode ? (
              <p className="text-xs text-destructive">
                삭제 모드입니다. 오른쪽 휴지통 버튼을 눌러 현재 월 등록을 삭제합니다.
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5">
            {pageErrorMessage ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-destructive" />
                <p className="font-medium text-sm">학생 등록 정보를 불러오지 못했습니다.</p>
                <p className="mt-1 text-sm text-muted-foreground">{pageErrorMessage}</p>
              </div>
            ) : isClassesLoading && !resolvedSelectedClass ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Loader2 className="mb-4 h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">수업 목록을 불러오는 중입니다.</p>
              </div>
            ) : !resolvedSelectedClass ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">선택된 수업이 없습니다.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {!hasValidYearMonth
                    ? '먼저 유효한 월을 선택해 주세요.'
                    : '수업과 월을 먼저 선택해 주세요.'}
                </p>
              </div>
            ) : !hasValidYearMonth ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">유효한 월 범위를 선택해 주세요.</p>
              </div>
            ) : isEnrollmentsLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">이달 등록 현황을 불러오는 중입니다.</p>
              </div>
            ) : !enrollments || enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 rounded-full bg-muted p-3.5">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium">아직 배정된 학생이 없습니다.</h3>
                <p className="mt-1 mb-3 text-sm text-muted-foreground">
                  기존 학생 계정을 바로 현재 월 등록으로 배정할 수 있습니다.
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gap-2"
                  disabled={!accessState?.canManage}
                >
                  <UserPlus className="h-4 w-4" />
                  학생 배정
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="grid grid-cols-[minmax(0,1fr)_5.35rem_5rem_auto] items-center gap-1.5 py-1.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                      <span className="min-w-0 truncate text-sm font-medium leading-none">
                        {enrollment.profiles.full_name || '이름 미등록'}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`${enrollment.profiles.full_name || '학생'} 결제 상태`}
                          className={`h-8 w-full justify-center px-2 text-xs ${paymentStatusMeta[enrollment.payment_status ? 'paid' : 'unpaid'].buttonClassName}`}
                          disabled={isUpdatingPayment === enrollment.id || !accessState?.canManage}
                        >
                          {isUpdatingPayment === enrollment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            paymentStatusMeta[enrollment.payment_status ? 'paid' : 'unpaid'].label
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(['paid', 'unpaid'] as const).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handlePaymentChange(enrollment.id, status)}
                          >
                            {paymentStatusMeta[status].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`${enrollment.profiles.full_name || '학생'} 등록 상태`}
                          className="h-8 w-full justify-center px-2 text-xs"
                          disabled={isUpdatingStatus === enrollment.id}
                        >
                          {isUpdatingStatus === enrollment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            enrollmentStatusMeta[enrollment.status].label
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(Object.keys(enrollmentStatusMeta) as EnrollmentLifecycleStatus[]).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(enrollment.id, status)}
                          >
                            {enrollmentStatusMeta[status].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex justify-end">
                      {isDeleteMode ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveStudent(enrollment.id)}
                          disabled={isRemoving === enrollment.id || !accessState?.isOwner}
                          aria-label={accessState?.isOwner ? '등록 삭제' : '등록 삭제는 오너 계정만 가능합니다'}
                          title={accessState?.isOwner ? '등록 삭제' : '등록 삭제는 오너 계정만 가능합니다'}
                        >
                          {isRemoving === enrollment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="flex max-h-[80dvh] flex-col">
          <DialogHeader>
            <DialogTitle>학생 배정</DialogTitle>
            <DialogDescription>
              {resolvedSelectedClass
                ? `${resolvedSelectedClass.name} / ${formatYearMonthLabel(selectedYearMonth)}에 기존 학생 계정을 배정합니다.`
                : '수업과 월을 먼저 선택해 주세요.'}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름 또는 이메일로 찾기"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>

          <div className="min-h-[10rem] flex-1 overflow-y-auto -mx-6 px-6">
            {addDialogErrorMessage ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="mb-3 h-6 w-6 text-destructive" />
                <p className="text-sm text-muted-foreground">{addDialogErrorMessage}</p>
              </div>
            ) : isAvailableStudentsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">배정 가능한 학생을 찾는 중입니다.</p>
              </div>
            ) : filteredAvailableStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? '검색 결과가 없습니다.' : '현재 월에 추가할 수 있는 학생이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAvailableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {student.full_name || '이름 미등록'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {student.email || '이메일 미등록'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnrollStudent(student.id)}
                      disabled={isEnrolling === student.id}
                      className="gap-2"
                    >
                      {isEnrolling === student.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      배정
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
