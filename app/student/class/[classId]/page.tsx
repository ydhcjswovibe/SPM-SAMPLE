'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  Loader2,
  PlayCircle,
  ZoomIn,
  XCircle,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel, readStudentClassDetail, type StudentClassDetail } from '@/lib/weekly-media'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SelectedVideoPlayer } from '@/components/selected-video-player'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const supabase = createClient()
const authRequiredMessage = '로그인이 필요합니다.'

const attendanceConfig = {
  present: {
    label: '출석 확인',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-900',
  },
  absent: {
    label: '결석',
    icon: XCircle,
    className: 'bg-rose-100 text-rose-900',
  },
  pending: {
    label: '확인 전',
    icon: Clock3,
    className: 'bg-muted text-muted-foreground',
  },
} as const

async function fetchStudentClassDetail(
  classId: string,
  yearMonth: string,
): Promise<StudentClassDetail | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(authRequiredMessage)
  }

  return readStudentClassDetail(supabase, user.id, classId, yearMonth)
}

function getFriendlyStudentDetailMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '수업 상세를 다시 불러오지 못했습니다.'
  }

  if (error.message === authRequiredMessage) {
    return authRequiredMessage
  }

  return '수업 상세를 다시 불러오지 못했습니다.'
}

function getWeekStatusLabel(week: StudentClassDetail['weeks'][number]) {
  const hasInvalid = week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0
  const hasReadableContent =
    week.video.items.length > 0 ||
    week.image.items.length > 0 ||
    Boolean(week.sharedFeedbackText) ||
    Boolean(week.privateFeedbackText) ||
    Boolean(week.progressText)

  if (hasInvalid) return '점검 필요'
  if (hasReadableContent) return '공개 중'
  return '준비 중'
}

export default function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = use(params)
  const searchParams = useSearchParams()
  const yearMonth = searchParams.get('yearMonth') ?? ''
  const [activeWeek, setActiveWeek] = useState<string | null>(null)
  const [selectedVideoByWeek, setSelectedVideoByWeek] = useState<Record<string, string>>({})
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
  } | null>(null)

  const {
    data: detail,
    error,
    isLoading,
  } = useSWR(
    yearMonth ? ['student-class-detail', classId, yearMonth] : null,
    ([, currentClassId, currentYearMonth]) => fetchStudentClassDetail(currentClassId, currentYearMonth),
  )

  if (!yearMonth) {
    return (
      <div className="p-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium">확인할 월 정보가 없습니다.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              수업 목록으로 돌아가 다시 선택해 주세요.
            </p>
            <Button asChild variant="link" className="mt-3">
              <Link href="/student">수업 목록으로</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">선택한 수업의 주차 콘텐츠를 불러오는 중입니다.</p>
      </div>
    )
  }

  if (error) {
    const needsLogin = error instanceof Error && error.message === authRequiredMessage

    return (
      <div className="p-4">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-start gap-3 py-4 text-sm text-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{getFriendlyStudentDetailMessage(error)}</p>
            </div>
            {needsLogin ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">다시 로그인하기</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/student">수업 목록으로</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="p-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium">해당 월의 수업 정보를 찾을 수 없습니다.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              등록 상태를 확인한 뒤 다시 시도해 주세요.
            </p>
            <Button asChild variant="link" className="mt-3">
              <Link href="/student">수업 목록으로</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const defaultActiveWeek =
    detail.weeks.find(
      (week) =>
        week.video.items.length > 0 ||
        week.image.items.length > 0 ||
        Boolean(week.sharedFeedbackText) ||
        Boolean(week.privateFeedbackText) ||
        Boolean(week.progressText),
    )?.weekNumber ?? detail.weeks[0]?.weekNumber ?? null

  const resolvedActiveWeek =
    activeWeek && detail.weeks.some((week) => String(week.weekNumber) === activeWeek)
      ? activeWeek
      : defaultActiveWeek
        ? String(defaultActiveWeek)
        : null

  const selectedWeek =
    detail.weeks.find((week) => String(week.weekNumber) === resolvedActiveWeek) ?? detail.weeks[0] ?? null

  return (
    <div className="flex flex-col">
      <div className="sticky top-14 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/student">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-semibold">{detail.className}</h1>
              <Badge variant={detail.enrollmentStatus === 'PENDING' ? 'secondary' : 'outline'}>
                {detail.enrollmentStatus === 'PENDING' ? '등록 예정' : '수강 중'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{formatYearMonthLabel(detail.yearMonth)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">결제 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{detail.paymentStatus ? '완료' : '미완료'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">주차 수</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{detail.weeks.length}개</p>
            </CardContent>
          </Card>
        </div>

        {detail.weeks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="font-medium">
                {detail.enrollmentStatus === 'PENDING' ? '곧 시작 예정입니다.' : '아직 공개된 콘텐츠가 없습니다.'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                새로운 콘텐츠가 열리면 이 화면에서 바로 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={resolvedActiveWeek ?? String(detail.weeks[0]?.weekNumber ?? 1)} onValueChange={setActiveWeek}>
            <div className="rounded-xl border border-dashed px-3 py-3 text-xs text-muted-foreground">
              공개 중은 지금 바로 볼 수 있는 주차, 점검 필요는 일부 항목만 먼저 열리는 주차, 준비 중은 아직 공개 전인 주차를 뜻합니다.
            </div>
            <TabsList className="h-auto w-full justify-start overflow-x-auto">
              {detail.weeks.map((week) => {
                return (
                  <TabsTrigger
                    key={week.weekNumber}
                    value={String(week.weekNumber)}
                    className="h-auto min-w-[88px] flex-shrink-0 px-3 py-2"
                  >
                    <div className="flex flex-col items-start gap-0.5 text-left">
                      <span>{week.weekNumber}주차</span>
                      <span className="text-[11px] text-muted-foreground">{getWeekStatusLabel(week)}</span>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {detail.weeks.map((week) => {
              const attendance = attendanceConfig[week.attendanceStatus]
              const AttendanceIcon = attendance.icon
              const youtubeItems = week.video.items
              const imageItems = week.image.items
              const weekKey = String(week.weekNumber)
              const selectedVideo =
                youtubeItems.find((item) => item.mediaId === selectedVideoByWeek[weekKey]) ??
                youtubeItems[0] ??
                null
              const selectedVideoIndex = selectedVideo
                ? youtubeItems.findIndex((item) => item.mediaId === selectedVideo.mediaId)
                : -1

              function moveSelectedVideo(direction: -1 | 1) {
                if (youtubeItems.length <= 1 || selectedVideoIndex === -1) {
                  return
                }

                const nextIndex =
                  (selectedVideoIndex + direction + youtubeItems.length) % youtubeItems.length

                setSelectedVideoByWeek((current) => ({
                  ...current,
                  [weekKey]: youtubeItems[nextIndex]?.mediaId ?? current[weekKey],
                }))
              }

              return (
                <TabsContent key={week.weekNumber} value={String(week.weekNumber)} className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">{week.weekNumber}주차 콘텐츠</CardTitle>
                        <Badge className={attendance.className}>
                          <AttendanceIcon className="mr-1 h-3.5 w-3.5" />
                          {attendance.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0 ? (
                        <div className="rounded-xl border border-amber-300/40 bg-amber-50/60 px-3 py-3 text-sm text-amber-950">
                          <p className="font-medium">일부 콘텐츠는 아직 열 수 없습니다.</p>
                          <p className="mt-1">운영자가 다시 정리하는 동안 먼저 열리는 항목부터 확인해 주세요.</p>
                          {week.video.invalidItems.map((item) => (
                            <p key={item.mediaId} className="mt-1">
                              영상 경고: {item.message}
                            </p>
                          ))}
                          {week.image.invalidItems.map((item) => (
                            <p key={item.mediaId} className="mt-1">
                              이미지 경고: {item.message}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {youtubeItems.length > 0 ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <PlayCircle className="h-4 w-4 text-red-500" />
                              영상
                            </div>
                            {youtubeItems.length > 1 ? (
                              <p className="text-xs text-muted-foreground">화살표나 아래 목록에서 재생할 영상을 고를 수 있습니다.</p>
                            ) : null}
                          </div>
                          {selectedVideo ? (
                            <SelectedVideoPlayer
                              label="현재 재생 영상"
                              countLabel={
                                youtubeItems.length > 1
                                  ? `${selectedVideoIndex + 1} / ${youtubeItems.length}`
                                  : null
                              }
                              canNavigate={youtubeItems.length > 1}
                              onPrevious={() => moveSelectedVideo(-1)}
                              onNext={() => moveSelectedVideo(1)}
                              surfaceClassName="bg-card"
                            >
                              <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                                title={`${week.weekNumber}주차 선택 영상`}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </SelectedVideoPlayer>
                          ) : null}
                          {youtubeItems.length > 1 ? (
                            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
                              {youtubeItems.map((item, index) => {
                                const isSelected = item.mediaId === selectedVideo?.mediaId

                                return (
                                  <button
                                    key={item.mediaId}
                                    type="button"
                                    aria-label={`${week.weekNumber}주차 영상 ${index + 1} 선택`}
                                    onClick={() =>
                                      setSelectedVideoByWeek((current) => ({
                                        ...current,
                                        [weekKey]: item.mediaId,
                                      }))
                                    }
                                    className={cn(
                                      'min-w-[11rem] snap-start rounded-xl border px-3 py-3 text-left shadow-sm transition',
                                      isSelected
                                        ? 'border-primary bg-primary/5'
                                        : 'bg-background hover:border-primary/40',
                                    )}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium">영상 {index + 1}</span>
                                        {isSelected ? <Badge variant="secondary">현재</Badge> : null}
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {imageItems.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                              이미지
                            </div>
                            <p className="text-xs text-muted-foreground">
                              좌우로 넘기고, 이미지를 누르면 크게 볼 수 있습니다.
                            </p>
                          </div>
                          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
                            {imageItems.map((item, index) => {
                              const alt = `${week.weekNumber}주차 이미지 ${index + 1}`

                              return (
                                <button
                                  key={item.mediaId}
                                  type="button"
                                  onClick={() => setSelectedImage({ url: item.url, alt })}
                                  className="group min-w-[75%] snap-start overflow-hidden rounded-xl border bg-background text-left shadow-sm transition hover:border-primary/40 sm:min-w-[22rem]"
                                >
                                  <div className="relative">
                                    <img
                                      src={item.url}
                                      alt={alt}
                                      className="h-56 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-3 py-2 text-xs text-white">
                                      <span>이미지 {index + 1}</span>
                                      <span className="inline-flex items-center gap-1">
                                        <ZoomIn className="h-3.5 w-3.5" />
                                        확대
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}

                      {week.progressText ? (
                        <div className="rounded-xl bg-muted/60 px-3 py-3">
                          <p className="text-sm font-medium">진행 메모</p>
                          <p className="mt-1 text-sm text-muted-foreground">{week.progressText}</p>
                        </div>
                      ) : null}

                      {week.sharedFeedbackText ? (
                        <div className="rounded-xl bg-muted/60 px-3 py-3">
                          <p className="text-sm font-medium">전체 피드백</p>
                          <p className="mt-1 text-sm text-muted-foreground">{week.sharedFeedbackText}</p>
                        </div>
                      ) : null}

                      {week.privateFeedbackText ? (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
                          <p className="text-sm font-medium">개인 피드백</p>
                          <p className="mt-1 text-sm text-muted-foreground">{week.privateFeedbackText}</p>
                        </div>
                      ) : null}

                      {selectedWeek?.weekNumber === week.weekNumber &&
                      (week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0) &&
                      youtubeItems.length === 0 &&
                      imageItems.length === 0 &&
                      !week.progressText &&
                      !week.sharedFeedbackText &&
                      !week.privateFeedbackText ? (
                        <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                          일부 항목은 아직 점검 중이며, 지금 바로 볼 수 있는 콘텐츠는 없습니다.
                        </div>
                      ) : null}

                      {selectedWeek?.weekNumber === week.weekNumber &&
                      week.video.invalidItems.length === 0 &&
                      week.image.invalidItems.length === 0 &&
                      youtubeItems.length === 0 &&
                      imageItems.length === 0 &&
                      !week.progressText &&
                      !week.sharedFeedbackText &&
                      !week.privateFeedbackText ? (
                        <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                          {detail.enrollmentStatus === 'PENDING'
                            ? '곧 시작 예정입니다. 이 주차 콘텐츠가 공개되면 여기에서 바로 볼 수 있습니다.'
                            : '아직 공개된 콘텐츠가 없습니다.'}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        )}
      </div>

      <Dialog open={selectedImage !== null} onOpenChange={(open) => (!open ? setSelectedImage(null) : null)}>
        <DialogContent className="max-h-[90dvh] overflow-hidden p-3 sm:max-w-5xl">
          <DialogHeader className="pr-8">
            <DialogTitle>이미지 크게 보기</DialogTitle>
            <DialogDescription>
              현재 주차 이미지를 크게 확인합니다.
            </DialogDescription>
          </DialogHeader>
          {selectedImage ? (
            <div className="overflow-auto rounded-xl bg-muted/40">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-h-[75dvh] w-full object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
