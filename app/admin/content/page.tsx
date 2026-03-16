'use client'

import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { AlertCircle, Loader2, RefreshCcw } from 'lucide-react'

import type { Class } from '@/lib/types'
import type { WeeklyMediaWeek } from '@/lib/weekly-media'
import { formatYearMonthLabel, getVisibleWeekCount, isValidYearMonth, normalizeClassRow } from '@/lib/weekly-media'
import { AdminMobileUtilityMenu } from '@/components/admin-mobile-utility-menu'
import { AdminMobileSettingsLink } from '@/components/admin-mobile-settings-link'
import { ClassSelector } from '@/components/class-selector'
import { WeekContentEditor } from '@/components/week-content-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
])

interface AdminWeeklyMediaState {
  classInfo: Class
  yearMonth: string
  weeks: WeeklyMediaWeek[]
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

function getCurrentYearMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function ContentPage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedYearMonth, setSelectedYearMonth] = useState(getCurrentYearMonth())
  const [activeWeek, setActiveWeek] = useState('1')
  const hasValidYearMonth = isValidYearMonth(selectedYearMonth)

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
    selectedClass && classes?.some((classItem) => classItem.id === selectedClass.id)
      ? selectedClass
      : classes?.[0] ?? null

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
  const normalizedActiveWeek = Number(activeWeek)
  const resolvedActiveWeek =
    mediaState &&
    Number.isInteger(normalizedActiveWeek) &&
    normalizedActiveWeek >= 1 &&
    normalizedActiveWeek <= visibleWeekCount
      ? activeWeek
      : String(mediaState?.weeks[0]?.weekNumber ?? 1)

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
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-2 md:h-14 md:flex-nowrap md:justify-between md:px-6 md:py-0">
          <h1 className="mr-auto font-semibold text-lg md:hidden">수업</h1>
          <div className="order-3 flex w-full items-center gap-2 md:order-none md:w-auto">
            <ClassSelector
              classes={classes ?? []}
              selectedClass={resolvedSelectedClass}
              onSelect={setSelectedClass}
            />
            <Input
              type="month"
              value={selectedYearMonth}
              onChange={(event) => setSelectedYearMonth(event.target.value)}
              className="w-[132px] sm:w-[148px]"
              aria-label="콘텐츠 월 선택"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <AdminMobileSettingsLink className="ml-0" />
            <AdminMobileUtilityMenu />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void mutateMediaState()}
            disabled={!resolvedSelectedClass || !hasValidYearMonth || isMediaLoading}
            className="gap-2"
          >
            {isMediaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            새로고침
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {classError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="space-y-3 py-4 text-sm text-destructive">
              <p>{classErrorMessage}</p>
              {classErrorMessage === authRequiredMessage ? (
              <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">다시 로그인하기</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => void mutateClasses()}>
                  수업 다시 불러오기
                </Button>
              )}
            </CardContent>
          </Card>
        ) : null}

        <section className="space-y-4 rounded-2xl border bg-card p-4 md:p-5">
          <div>
            <h2 className="font-semibold text-base">
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
            ) : isMediaLoading && !mediaState ? (
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
                <Button variant="outline" size="sm" onClick={() => void mutateMediaState()} className="mt-3">
                  다시 시도
                </Button>
              </div>
            ) : mediaState ? (
              <Tabs value={resolvedActiveWeek} onValueChange={setActiveWeek}>
                <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                  {mediaState.weeks.map((week) => {
                    return (
                      <TabsTrigger
                        key={week.weekNumber}
                        value={String(week.weekNumber)}
                        className="h-auto min-w-[104px] flex-shrink-0 rounded-xl border px-3 py-2 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background"
                      >
                        <div className="flex flex-col items-start gap-0.5 text-left">
                          <span>{week.weekNumber}주차</span>
                          <span className="text-[11px] opacity-70">{getWeekStatusLabel(week)}</span>
                        </div>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                {mediaState.weeks.map((week) => (
                  <TabsContent
                    key={week.weekNumber}
                    value={String(week.weekNumber)}
                    className="mt-3"
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
                ))}
              </Tabs>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
