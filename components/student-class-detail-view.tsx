'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  PlayCircle,
  XCircle,
  ZoomIn,
} from 'lucide-react'

import type { StudentClassDetail } from '@/lib/weekly-media'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SelectedVideoPlayer } from '@/components/selected-video-player'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

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

export function StudentClassDetailView({ detail }: { detail: StudentClassDetail }) {
  const [activeWeek, setActiveWeek] = useState<string | null>(null)
  const [selectedVideoByWeek, setSelectedVideoByWeek] = useState<Record<string, string>>({})
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
  } | null>(null)

  if (detail.weeks.length === 0) {
    return (
      <Card className="overflow-hidden rounded-[1.9rem] border border-[rgba(23,33,42,0.08)] bg-white py-0 shadow-[0_18px_50px_rgba(21,28,38,0.1)]">
        <CardContent className="px-5 py-12 text-center">
          <p className="text-base font-semibold text-[#17212a]">
            {detail.enrollmentStatus === 'PENDING' ? '곧 열릴 예정입니다.' : '아직 공개된 항목이 없습니다.'}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#66707b]">
            새로운 콘텐츠가 열리면 이 화면에서 바로 확인할 수 있습니다.
          </p>
        </CardContent>
      </Card>
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
    <>
      <div className="space-y-4">
        <Tabs value={resolvedActiveWeek ?? String(detail.weeks[0]?.weekNumber ?? 1)} onValueChange={setActiveWeek}>
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-[1.6rem] border border-[rgba(23,33,42,0.08)] bg-white px-2 py-2 shadow-[0_14px_34px_rgba(21,28,38,0.08)]">
            {detail.weeks.map((week) => {
              const isSelected = String(week.weekNumber) === resolvedActiveWeek

              return (
                <TabsTrigger
                  key={week.weekNumber}
                  value={String(week.weekNumber)}
                  className={cn(
                    'h-auto min-w-[96px] flex-shrink-0 rounded-[1.15rem] px-3 py-2.5 text-left data-[state=active]:shadow-none',
                    isSelected
                      ? 'bg-[#eef8f4] text-[#1d4e46]'
                      : 'bg-[#f8f6f1] text-[#66707b] hover:bg-[#f3efe8]'
                  )}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-semibold">{week.weekNumber}주차</span>
                    <span className="text-[11px]">{getWeekStatusLabel(week)}</span>
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
                <Card className="overflow-hidden rounded-[1.9rem] border border-[rgba(23,33,42,0.08)] bg-white py-0 shadow-[0_18px_50px_rgba(21,28,38,0.1)]">
                  <CardHeader className="px-5 pb-3 pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base text-[#17212a]">{week.weekNumber}주차 콘텐츠</CardTitle>
                      <Badge className={attendance.className}>
                        <AttendanceIcon className="mr-1 h-3.5 w-3.5" />
                        {attendance.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 px-5 pb-5">
                    {week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0 ? (
                      <div className="rounded-[1.25rem] border border-amber-300/40 bg-amber-50/60 px-4 py-4 text-sm text-amber-950">
                        <p className="font-medium">일부 항목은 아직 점검 중입니다.</p>
                        <p className="mt-1">먼저 열리는 항목부터 확인해 주세요.</p>
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
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#17212a]">
                            <PlayCircle className="h-4 w-4 text-red-500" />
                            영상
                          </div>
                          {youtubeItems.length > 1 ? (
                            <p className="text-xs text-[#66707b]">화살표나 아래 목록에서 재생할 영상을 고를 수 있습니다.</p>
                          ) : null}
                        </div>

                        {selectedVideo ? (
                          <SelectedVideoPlayer
                            label="재생 중"
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
                          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
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
                                    'min-w-[11rem] rounded-[1.2rem] border px-3 py-3 text-left shadow-sm transition',
                                    isSelected
                                      ? 'border-[#9ecdc1] bg-[#eef8f4]'
                                      : 'bg-white hover:border-[#b5c8f0]'
                                  )}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-medium text-[#17212a]">영상 {index + 1}</span>
                                      {isSelected ? (
                                        <Badge className="border-[#d9e4ff] bg-[#eef3ff] text-[#4368b8]">현재</Badge>
                                      ) : null}
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
                          <div className="flex items-center gap-2 text-sm font-medium text-[#17212a]">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            이미지
                          </div>
                          <p className="text-xs text-[#66707b]">좌우로 넘기고 눌러 크게 봅니다.</p>
                        </div>

                        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                          {imageItems.map((item, index) => {
                            const alt = `${week.weekNumber}주차 이미지 ${index + 1}`

                            return (
                              <button
                                key={item.mediaId}
                                type="button"
                                onClick={() => setSelectedImage({ url: item.url, alt })}
                                className="group min-w-[75%] overflow-hidden rounded-[1.2rem] border bg-white text-left shadow-sm transition hover:border-[#b5c8f0] sm:min-w-[22rem]"
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
                      <div className="rounded-[1.25rem] bg-[#f7f4ee] px-4 py-4">
                        <p className="text-sm font-medium text-[#17212a]">진행 메모</p>
                        <p className="mt-1 text-sm leading-6 text-[#66707b]">{week.progressText}</p>
                      </div>
                    ) : null}

                    {week.sharedFeedbackText ? (
                      <div className="rounded-[1.25rem] bg-[#f7f4ee] px-4 py-4">
                        <p className="text-sm font-medium text-[#17212a]">전체 피드백</p>
                        <p className="mt-1 text-sm leading-6 text-[#66707b]">{week.sharedFeedbackText}</p>
                      </div>
                    ) : null}

                    {week.privateFeedbackText ? (
                      <div className="rounded-[1.25rem] border border-[#d9e4ff] bg-[#eef3ff] px-4 py-4">
                        <p className="text-sm font-medium text-[#17212a]">개인 피드백</p>
                        <p className="mt-1 text-sm leading-6 text-[#66707b]">{week.privateFeedbackText}</p>
                      </div>
                    ) : null}

                    {selectedWeek?.weekNumber === week.weekNumber &&
                    (week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0) &&
                    youtubeItems.length === 0 &&
                    imageItems.length === 0 &&
                    !week.progressText &&
                    !week.sharedFeedbackText &&
                    !week.privateFeedbackText ? (
                      <div className="rounded-[1.25rem] border border-dashed px-4 py-8 text-center text-sm text-[#66707b]">
                        점검 중인 항목만 있습니다.
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
                      <div className="rounded-[1.25rem] border border-dashed px-4 py-8 text-center text-sm text-[#66707b]">
                        {detail.enrollmentStatus === 'PENDING'
                          ? '곧 열릴 예정입니다.'
                          : '아직 공개된 항목이 없습니다.'}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      <Dialog open={selectedImage !== null} onOpenChange={(open) => (!open ? setSelectedImage(null) : null)}>
        <DialogContent className="max-h-[90dvh] overflow-hidden p-3 sm:max-w-5xl">
          <DialogHeader className="pr-8">
            <DialogTitle>이미지 크게 보기</DialogTitle>
            <DialogDescription>선택한 이미지를 크게 봅니다.</DialogDescription>
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
    </>
  )
}
