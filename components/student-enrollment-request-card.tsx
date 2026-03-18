'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { CalendarDays, CheckCircle2, Loader2, Send } from 'lucide-react'

import { getCurrentYearMonth, isValidYearMonth } from '@/lib/admin/matrix'
import type { EnrollmentLifecycleStatus } from '@/lib/types'
import { formatYearMonthLabel } from '@/lib/weekly-media'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StudentRequestableClass {
  id: string
  name: string
  existingStatus: EnrollmentLifecycleStatus | null
}

interface RequestResponse {
  data?: {
    class_id: string
    year_month: string
    status: EnrollmentLifecycleStatus
  }
  meta?: {
    className?: string
    reopened?: boolean
  }
  error?: string
}

interface StudentEnrollmentRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

async function readRouteError(response: Response) {
  const payload = (await response.json().catch(() => null)) as RequestResponse | null
  return payload?.error ?? 'REQUEST_FAILED'
}

async function fetchRequestableClasses(yearMonth: string): Promise<StudentRequestableClass[]> {
  const searchParams = new URLSearchParams({ yearMonth })
  const response = await fetch(`/api/student/enrollment-request?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(await readRouteError(response))
  }

  const payload = (await response.json()) as { data?: StudentRequestableClass[] }
  return payload.data ?? []
}

function getFriendlyRequestError(message: string) {
  switch (message) {
    case 'AUTH_REQUIRED':
      return '로그인이 필요합니다.'
    case 'STUDENT_REQUIRED':
      return '학생 계정에서만 수업 요청을 보낼 수 있습니다.'
    case 'INVALID_YEAR_MONTH':
      return '요청할 월을 다시 확인해 주세요.'
    case 'CLASS_NOT_FOUND':
      return '요청할 수업을 찾지 못했습니다.'
    case 'ENROLLMENT_ALREADY_ACTIVE':
      return '이미 이 달 수강 중인 수업입니다.'
    case 'ENROLLMENT_ALREADY_PENDING':
      return '이미 같은 달 승인 요청을 보낸 수업입니다.'
    case 'REQUESTABLE_CLASSES_READ_FAILED':
      return '요청 가능한 수업 목록을 불러오지 못했습니다.'
    case 'ENROLLMENT_REQUEST_FAILED':
      return '승인 요청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.'
    default:
      return message || '승인 요청을 처리하지 못했습니다.'
  }
}

function getStatusHint(option: StudentRequestableClass | null) {
  if (!option) return '요청할 수업을 골라 주세요.'

  if (option.existingStatus === 'ACTIVE') {
    return '이미 이 달 수강 중인 수업입니다.'
  }

  if (option.existingStatus === 'PENDING') {
    return '이미 같은 달 승인 요청을 보냈습니다.'
  }

  if (option.existingStatus === 'CANCELLED') {
    return '이전에 취소된 요청입니다. 다시 승인 요청을 보낼 수 있습니다.'
  }

  return '운영 확인 전까지는 등록 예정 상태로 보입니다.'
}

export function StudentEnrollmentRequestDialog({
  open,
  onOpenChange,
  title = '새 수업 요청',
  description = '원하는 수업과 월을 고르면 운영 쪽에 승인 요청이 바로 들어갑니다.',
}: StudentEnrollmentRequestDialogProps) {
  const { mutate } = useSWRConfig()
  const [selectedYearMonth, setSelectedYearMonth] = useState(getCurrentYearMonth())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: requestableClasses,
    error,
    isLoading,
    mutate: mutateRequestableClasses,
  } = useSWR(
    open && isValidYearMonth(selectedYearMonth)
      ? ['student-enrollment-request-options', selectedYearMonth]
      : null,
    ([, yearMonth]) => fetchRequestableClasses(yearMonth),
  )

  useEffect(() => {
    if (!open) {
      setActionError(null)
      setSuccessMessage(null)
      setIsSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    if (!requestableClasses || requestableClasses.length === 0) {
      setSelectedClassId(null)
      return
    }

    if (selectedClassId && requestableClasses.some((option) => option.id === selectedClassId)) {
      return
    }

    const preferredOption =
      requestableClasses.find(
        (option) => option.existingStatus !== 'ACTIVE' && option.existingStatus !== 'PENDING',
      ) ?? requestableClasses[0]

    setSelectedClassId(preferredOption.id)
  }, [requestableClasses, selectedClassId])

  const selectedOption = useMemo(
    () => requestableClasses?.find((option) => option.id === selectedClassId) ?? null,
    [requestableClasses, selectedClassId],
  )

  const canSubmit =
    Boolean(selectedOption) &&
    selectedOption?.existingStatus !== 'ACTIVE' &&
    selectedOption?.existingStatus !== 'PENDING' &&
    !isSubmitting

  const handleSubmit = async () => {
    if (!selectedOption) return

    setIsSubmitting(true)
    setActionError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/student/enrollment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedOption.id,
          yearMonth: selectedYearMonth,
        }),
      })

      if (!response.ok) {
        throw new Error(await readRouteError(response))
      }

      const payload = (await response.json()) as RequestResponse
      const className = payload.meta?.className ?? selectedOption.name
      const reopened = payload.meta?.reopened ?? false

      setSuccessMessage(
        reopened
          ? `${className} / ${formatYearMonthLabel(selectedYearMonth)} 요청을 다시 열었습니다. 운영 승인 전까지 등록 예정으로 보입니다.`
          : `${className} / ${formatYearMonthLabel(selectedYearMonth)} 승인 요청을 보냈습니다. 운영 확인 후 수업 탭에서 바로 확인할 수 있습니다.`,
      )

      await Promise.all([
        mutateRequestableClasses(),
        mutate('student-class-summaries'),
        mutate('student-status-summary'),
      ])
    } catch (submitError) {
      setActionError(
        getFriendlyRequestError(
          submitError instanceof Error ? submitError.message : 'ENROLLMENT_REQUEST_FAILED',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[1.8rem] border border-[rgba(23,33,42,0.08)] bg-white p-0 sm:max-w-[34rem]">
        <DialogHeader className="space-y-2 px-5 pt-5 pb-2 text-left">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d4e46]">
            <Send className="h-3.5 w-3.5" />
            승인 요청
          </div>
          <DialogTitle className="spm-display text-2xl text-[#17212a]">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#66707b]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5 pt-2">
          {successMessage ? (
            <div className="rounded-[1.2rem] border border-[rgba(41,163,118,0.22)] bg-[#effaf4] px-4 py-3 text-sm text-[#155c47]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="font-medium">{successMessage}</p>
              </div>
            </div>
          ) : null}

          {actionError || error ? (
            <div className="rounded-[1.2rem] border border-[rgba(214,104,96,0.26)] bg-[#fff3f1] px-4 py-3 text-sm text-[#b65046]">
              {actionError ??
                getFriendlyRequestError(
                  error instanceof Error ? error.message : 'REQUESTABLE_CLASSES_READ_FAILED',
                )}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_9rem]">
            <div className="space-y-2">
              <Label htmlFor="student-request-class">수업 선택</Label>
              <Select
                value={selectedClassId ?? undefined}
                onValueChange={(nextValue) => {
                  setSelectedClassId(nextValue)
                  setActionError(null)
                  setSuccessMessage(null)
                }}
                disabled={isLoading || !requestableClasses || requestableClasses.length === 0}
              >
                <SelectTrigger
                  id="student-request-class"
                  aria-label="요청할 수업 선택"
                  className="h-11 rounded-[1rem] border-[rgba(23,33,42,0.08)] bg-[#fbfaf7] text-left text-[#17212a]"
                >
                  <SelectValue placeholder={isLoading ? '수업 불러오는 중' : '수업을 골라 주세요'} />
                </SelectTrigger>
                <SelectContent>
                  {(requestableClasses ?? []).map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-request-month">월 선택</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8390]" />
                <Input
                  id="student-request-month"
                  type="month"
                  value={selectedYearMonth}
                  onChange={(event) => {
                    setSelectedYearMonth(event.target.value)
                    setActionError(null)
                    setSuccessMessage(null)
                  }}
                  className="h-11 rounded-[1rem] border-[rgba(23,33,42,0.08)] bg-[#fbfaf7] pl-10 text-[#17212a]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[1.1rem] border border-[rgba(23,33,42,0.06)] bg-[#fbfaf7] px-4 py-3 text-sm text-[#17212a]">
            {isLoading ? (
              <div className="flex items-center gap-2 text-[#66707b]">
                <Loader2 className="h-4 w-4 animate-spin" />
                요청 가능한 수업을 불러오는 중입니다.
              </div>
            ) : requestableClasses && requestableClasses.length > 0 ? (
              <p>{getStatusHint(selectedOption)}</p>
            ) : (
              <p className="text-[#66707b]">지금 요청 가능한 활성 수업이 없습니다.</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {selectedOption?.existingStatus === 'CANCELLED' ? '다시 승인 요청' : '승인 요청 보내기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
