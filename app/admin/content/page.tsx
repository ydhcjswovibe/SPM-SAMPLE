'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { AlertCircle, Loader2, RefreshCcw } from 'lucide-react'

import { buildAdminContentHref } from '@/lib/admin/content-selection'
import { getCurrentYearMonth, resolveDefaultWeekNumber } from '@/lib/date-selection'
import { resolveDefaultWeekNumberFromSessions } from '@/lib/class-schedule'
import {
  adminAlertCardClass,
  adminCompactButtonClass,
  adminDropdownItemClass,
  adminEditorSurfaceClass,
  adminMetricCardClass,
} from '@/lib/admin/surface'
import type { Class } from '@/lib/types'
import type { WeeklyMediaWeek } from '@/lib/weekly-media'
import { formatYearMonthLabel, getVisibleWeekCount, isValidYearMonth, normalizeClassRow } from '@/lib/weekly-media'
import { AdminMonthSelector } from '@/components/admin-month-selector'
import { AdminShellHeader } from '@/components/admin-shell-header'
import { AdminHeaderActionMenu } from '@/components/admin-header-action-menu'
import { ClassSelector } from '@/components/class-selector'
import { WeekContentEditor } from '@/components/week-content-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const authRequiredMessage = '로그인이 필요합니다.'
const genericRequestError = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
const knownRouteMessages = new Set([
  authRequiredMessage,
  '관리자 권한이 필요합니다.',
  '클래스를 다시 선택해 주세요.',
  '선택한 클래스를 찾을 수 없습니다.',
  '월 범위를 다시 확인해 주세요.',
  '입력값을 다시 확인해 주세요.',
  '업로드할 이미지를 선택해 주세요.',
  '이미지 파일만 업로드할 수 있습니다.',
  '이미지는 10MB 이하만 업로드할 수 있습니다.',
  '대상 콘텐츠를 찾을 수 없습니다.',
  '주차 콘텐츠를 불러오지 못했습니다.',
  '콘텐츠 저장에 실패했습니다.',
  '콘텐츠 삭제에 실패했습니다.',
  '이미지 업로드에 실패했습니다.',
  '운영 메모를 불러오지 못했습니다.',
  '운영 메모 저장에 실패했습니다.',
])

interface AdminWeeklyMediaState {
  classInfo: Class
  yearMonth: string
  weeks: WeeklyMediaWeek[]
}

function parseRequestedWeek(value: string | null) {
  if (!value) return null

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
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

  const payload = (await response.json()) as {
    data?: Array<{ id: string; name: string | null; is_active?: boolean | null }>
  }

  return (payload.data ?? []).map((row) => normalizeClassRow(row))
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
    case 'CLASS_ID_REQUIRED':
      return '클래스를 다시 선택해 주세요.'
    case 'CLASS_NOT_FOUND':
      return '선택한 클래스를 찾을 수 없습니다.'
    case 'INVALID_YEAR_MONTH':
      return '월 범위를 다시 확인해 주세요.'
    case 'INVALID_MEDIA_INPUT':
      return '입력값을 다시 확인해 주세요.'
    case 'INVALID_NOTES_INPUT':
      return '운영 메모 입력값을 다시 확인해 주세요.'
    case 'IMAGE_REQUIRED':
      return '업로드할 이미지를 선택해 주세요.'
    case 'INVALID_IMAGE_TYPE':
      return '이미지 파일만 업로드할 수 있습니다.'
    case 'IMAGE_TOO_LARGE':
      return '이미지는 10MB 이하만 업로드할 수 있습니다.'
    case 'MEDIA_NOT_FOUND':
      return '대상 콘텐츠를 찾을 수 없습니다.'
    case 'MEDIA_READ_FAILED':
      return '주차 콘텐츠를 불러오지 못했습니다.'
    case 'MEDIA_SAVE_FAILED':
      return '콘텐츠 저장에 실패했습니다.'
    case 'MEDIA_DELETE_FAILED':
      return '콘텐츠 삭제에 실패했습니다.'
    case 'IMAGE_UPLOAD_FAILED':
      return '이미지 업로드에 실패했습니다.'
    case 'NOTES_READ_FAILED':
      return '운영 메모를 불러오지 못했습니다.'
    case 'NOTES_SAVE_FAILED':
      return '운영 메모 저장에 실패했습니다.'
    default:
      return genericRequestError
  }
}

function getKnownClientMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  return knownRouteMessages.has(error.message) ? error.message : fallback
}

function getWeekStatusLabel(week: WeeklyMediaWeek) {
  const hasInvalid = week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0
  const hasContent = week.video.items.length > 0 || week.image.items.length > 0

  if (hasInvalid) return '점검 필요'
  if (hasContent) return '공개 중'
  return '비어 있음'
}

async function fetchWeeklyMediaState(classId: string, yearMonth: string): Promise<AdminWeeklyMediaState> {
  const searchParams = new URLSearchParams({
    classId,
    yearMonth,
  })

  const response = await fetch(`/api/admin/weekly-media?${searchParams.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(getFriendlyRouteError(await readRouteError(response)))
  }

  const payload = (await response.json()) as { data: AdminWeeklyMediaState }
  return payload.data
}

export default function ContentPage() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.toString()
  const requestedClassId = searchParams.get('classId')
  const requestedYearMonth = searchParams.get('yearMonth')
  const requestedWeekParam = searchParams.get('week')
  const [selectedClassId, setSelectedClassId] = useState<string | null>(requestedClassId)
  const [selectedYearMonth, setSelectedYearMonth] = useState(
    requestedYearMonth && isValidYearMonth(requestedYearMonth) ? requestedYearMonth : getCurrentYearMonth(),
  )
  const [activeWeek, setActiveWeek] = useState<string | null>(searchParams.get('week'))
  const hasValidYearMonth = isValidYearMonth(selectedYearMonth)

  useEffect(() => {
    setSelectedClassId(requestedClassId)
  }, [requestedClassId])

  useEffect(() => {
    setSelectedYearMonth(
      requestedYearMonth && isValidYearMonth(requestedYearMonth) ? requestedYearMonth : getCurrentYearMonth(),
    )
  }, [requestedYearMonth])

  useEffect(() => {
    setActiveWeek(requestedWeekParam)
  }, [requestedWeekParam])

  const {
    data: classes,
    error: classError,
    isLoading: isClassesLoading,
    mutate: mutateClasses,
  } = useSWR(
    hasValidYearMonth ? ['content-classes', selectedYearMonth] : null,
    ([, yearMonth]) => fetchClasses(yearMonth),
  )
  const classErrorMessage = getKnownClientMessage(classError, '클래스 목록을 다시 불러오지 못했습니다.')

  const resolvedSelectedClass =
    classes?.find((classItem) => classItem.id === selectedClassId)
      ?? classes?.find((classItem) => classItem.id === requestedClassId)
      ?? classes?.[0]
      ?? null

  const {
    data: mediaState,
    error: mediaError,
    isLoading: isMediaLoading,
    mutate: mutateMediaState,
  } = useSWR(
    resolvedSelectedClass && hasValidYearMonth
      ? ['admin-weekly-media', resolvedSelectedClass.id, selectedYearMonth]
      : null,
    ([, classId, yearMonth]) => fetchWeeklyMediaState(classId, yearMonth),
  )
  const visibleWeekCount = mediaState ? getVisibleWeekCount(mediaState.weeks.length, mediaState.weeks.length) : 0
  const resolvedVisibleWeekCount = visibleWeekCount
  const requestedWeek = parseRequestedWeek(activeWeek)
  const availableWeekNumbers = mediaState?.weeks.map((week) => week.weekNumber) ?? []
  const defaultWeekNumber =
    mediaState?.weeks.length
      ? resolveDefaultWeekNumberFromSessions(
          mediaState.weeks.map((week) => ({
            weekNumber: week.weekNumber,
            sessions: week.sessions.map((session) => ({ sessionDate: session.sessionDate })),
          })),
          selectedYearMonth,
        ) ?? mediaState.weeks[0]?.weekNumber ?? null
      : availableWeekNumbers[0] ?? null
  const resolvedActiveWeek =
    availableWeekNumbers.length > 0
      ? String(
          requestedWeek && availableWeekNumbers.includes(requestedWeek)
            ? requestedWeek
            : defaultWeekNumber ?? availableWeekNumbers[0],
        )
      : String(resolveDefaultWeekNumber())
  const isWeeklyStateLoading = isMediaLoading && !mediaState

  useEffect(() => {
    if (!resolvedSelectedClass || !hasValidYearMonth || resolvedVisibleWeekCount === 0) {
      return
    }

    const nextHref = buildAdminContentHref({
      classId: resolvedSelectedClass.id,
      yearMonth: selectedYearMonth,
      week: resolvedActiveWeek,
    })
    const currentHref = currentSearch ? `${pathname}?${currentSearch}` : pathname

    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false })
    }
  }, [
    hasValidYearMonth,
    pathname,
    resolvedActiveWeek,
    resolvedSelectedClass,
    resolvedVisibleWeekCount,
    router,
    currentSearch,
    selectedYearMonth,
  ])

  async function requestJson(
    input: RequestInfo,
    init?: RequestInit,
  ) {
    const response = await fetch(input, init)
    if (!response.ok) {
      throw new Error(getFriendlyRouteError(await readRouteError(response)))
    }

    return response
  }

  async function handleCreateVideo(weekNumber: number, url: string) {
    if (!resolvedSelectedClass) return

    await requestJson('/api/admin/weekly-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId: resolvedSelectedClass.id,
        yearMonth: selectedYearMonth,
        weekNumber,
        url,
      }),
    })

    await mutateMediaState()
  }

  async function handleUpdateVideo(mediaId: string, url: string) {
    await requestJson('/api/admin/weekly-media', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId,
        url,
      }),
    })

    await mutateMediaState()
  }

  async function handleDeleteMedia(mediaId: string) {
    await requestJson('/api/admin/weekly-media', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId,
      }),
    })

    await mutateMediaState()
  }

  async function handleUploadImage(weekNumber: number, file: File, mediaId?: string) {
    if (!resolvedSelectedClass) return

    const formData = new FormData()
    formData.set('classId', resolvedSelectedClass.id)
    formData.set('yearMonth', selectedYearMonth)
    formData.set('weekNumber', String(weekNumber))
    formData.set('file', file)
    if (mediaId) {
      formData.set('mediaId', mediaId)
    }

    await requestJson('/api/admin/weekly-media/image', {
      method: 'POST',
      body: formData,
    })

    await mutateMediaState()
  }

  return (
    <div className="flex flex-col">
      <AdminShellHeader
        controlsClassName="md:flex-nowrap"
        mobileActionMenu={
          <DropdownMenuItem
            onSelect={() => void mutateMediaState()}
            disabled={!resolvedSelectedClass || !hasValidYearMonth || isMediaLoading}
            className={adminDropdownItemClass}
          >
            <RefreshCcw className="h-4 w-4" />
            새로고침
          </DropdownMenuItem>
        }
        desktopSecondaryActions={
          <AdminHeaderActionMenu label="작업">
            <DropdownMenuItem
              onSelect={() => void mutateMediaState()}
              disabled={!resolvedSelectedClass || !hasValidYearMonth || isMediaLoading}
              className={adminDropdownItemClass}
            >
              <RefreshCcw className="h-4 w-4" />
              새로고침
            </DropdownMenuItem>
          </AdminHeaderActionMenu>
        }
        controls={
          <>
            <ClassSelector
              classes={classes ?? []}
              selectedClass={resolvedSelectedClass}
              ariaLabel="콘텐츠 수업 선택"
              triggerClassName="min-w-0 flex-1 max-w-none sm:min-w-0 sm:max-w-none md:min-w-[10.75rem] md:max-w-[13rem] lg:min-w-[11rem] lg:max-w-[14rem]"
              onSelect={(classItem) => {
                setSelectedClassId(classItem.id)
                setActiveWeek(null)
              }}
            />
            <AdminMonthSelector
              value={selectedYearMonth}
              onValueChange={(value) => {
                setSelectedYearMonth(value)
                setActiveWeek(null)
              }}
              ariaLabel="콘텐츠 월 선택"
            />
          </>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:space-y-4 md:px-6 md:pb-5 md:pt-3 lg:px-7 lg:pt-4">
        {classError ? (
          <Card className={adminAlertCardClass('danger')}>
            <CardContent className="space-y-3 py-4 text-sm text-destructive">
              <p>{classErrorMessage}</p>
              {classErrorMessage === authRequiredMessage ? (
                <Button asChild variant="ghost" size="sm" className={adminCompactButtonClass}>
                  <Link href="/">다시 로그인하기</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => void mutateClasses()} className={adminCompactButtonClass}>
                  수업 다시 불러오기
                </Button>
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="hidden md:grid md:grid-cols-1 md:gap-3 lg:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,0.7fr))]">
          <Card className={adminMetricCardClass('mint')}>
            <CardContent className="px-4 py-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#73815f]">편집 대상</div>
              <div className="mt-2 text-sm font-semibold text-[#314127]">
                {resolvedSelectedClass ? resolvedSelectedClass.name : '수업 선택 필요'}
              </div>
              <div className="mt-1 text-sm text-[#6f7c60]">
                {hasValidYearMonth ? formatYearMonthLabel(selectedYearMonth) : '월 다시 확인'}
              </div>
            </CardContent>
          </Card>
          <Card className={adminMetricCardClass('mint')}>
            <CardContent className="px-4 py-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#73815f]">현재 주차</div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-sm text-[#556449]">선택된 주차</span>
                <span className="spm-display text-[1.35rem] text-[#314127]">{resolvedActiveWeek}주</span>
              </div>
            </CardContent>
          </Card>
          <Card className={adminMetricCardClass('blue')}>
            <CardContent className="px-4 py-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e74b7]">표시 주차</div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <span className="text-sm text-[#6174a7]">노출된 분량</span>
                <span className="spm-display text-[1.35rem] text-[#5a79c9]">{resolvedVisibleWeekCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className={adminEditorSurfaceClass}>
          <div>
            <h2 className="font-semibold text-base lg:text-[1.05rem]">
              {resolvedSelectedClass
                ? `${resolvedSelectedClass.name} / ${formatYearMonthLabel(selectedYearMonth)}`
                : '관리할 수업을 먼저 선택해 주세요'}
            </h2>
          </div>
          <div className="space-y-4">
            {isClassesLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">수업 목록을 불러오는 중입니다.</p>
              </div>
            ) : !resolvedSelectedClass ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">관리할 수업을 먼저 선택해 주세요.</p>
              </div>
            ) : !hasValidYearMonth ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">유효한 월 범위를 선택해 주세요.</p>
              </div>
            ) : isWeeklyStateLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  선택한 클래스의 주차 콘텐츠를 불러오는 중입니다.
                </p>
              </div>
            ) : mediaError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="mb-4 h-8 w-8 text-destructive" />
                <p className="font-medium text-destructive">
                  {getKnownClientMessage(mediaError, '주차 콘텐츠를 다시 불러오지 못했습니다.')}
                </p>
                <Button variant="ghost" size="sm" onClick={() => void mutateMediaState()} className={`mt-3 ${adminCompactButtonClass}`}>
                  다시 시도
                </Button>
              </div>
            ) : mediaState ? (
              <div className="space-y-4">
                <Tabs value={resolvedActiveWeek} onValueChange={setActiveWeek}>
                  <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                    {mediaState.weeks.map((week) => {
                      return (
                        <TabsTrigger
                          key={week.weekNumber}
                          value={String(week.weekNumber)}
                          className="h-auto min-w-[104px] flex-shrink-0 rounded-[1.2rem] border border-[#dce8cc] bg-white/96 px-3 py-2 text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] data-[state=active]:border-[#d8e9b7] data-[state=active]:bg-[linear-gradient(180deg,rgba(246,252,227,0.99)_0%,rgba(229,244,193,0.98)_100%)] data-[state=active]:text-[#34501f]"
                        >
                          <div className="flex flex-col items-start gap-0.5 text-left">
                            <span>{week.weekNumber}주차</span>
                            <span className="text-[11px] opacity-70">
                              {week.sessionRangeLabel ?? getWeekStatusLabel(week)}
                            </span>
                          </div>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                  {mediaState.weeks.map((week) => {
                    return (
                      <TabsContent
                        key={week.weekNumber}
                        value={String(week.weekNumber)}
                        className="mt-3 space-y-3"
                      >
                        <WeekContentEditor
                          week={week}
                          yearMonth={selectedYearMonth}
                          onCreateVideo={(url) => handleCreateVideo(week.weekNumber, url)}
                          onUpdateVideo={handleUpdateVideo}
                          onDeleteMedia={handleDeleteMedia}
                          onUploadImage={(file, mediaId) => handleUploadImage(week.weekNumber, file, mediaId)}
                        />
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
