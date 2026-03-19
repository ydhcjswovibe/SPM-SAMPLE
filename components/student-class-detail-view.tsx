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
      <Card className="overflow-hidden rounded-[1.9rem] border border-[#dbe6c2] bg-white/92 py-0 shadow-[0_14px_30px_rgba(90,118,58,0.08)]">
        <CardContent className="px-4 py-10 text-center">
          <p className="text-base font-semibold text-[#334223]">
            {detail.enrollmentStatus === 'PENDING'
              ? '운영 승인 전입니다.'
              : '수강은 시작됐고 콘텐츠는 아직 준비 중입니다.'}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#66775b]">
            {detail.enrollmentStatus === 'PENDING'
              ? '승인이 끝나면 이 화면에서 수강 상태와 주차 콘텐츠를 바로 이어서 확인할 수 있습니다.'
              : '새로운 콘텐츠가 열리면 이 화면에서 바로 확인할 수 있습니다.'}
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
      <div className="space-y-3">
        <Tabs value={resolvedActiveWeek ?? String(detail.weeks[0]?.weekNumber ?? 1)} onValueChange={setActiveWeek}>
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-[1.8rem] border border-[#d9e5c1] bg-[#eef7dc] px-2 py-2 shadow-[0_12px_26px_rgba(90,118,58,0.08)]">
            {detail.weeks.map((week) => {
              const isSelected = String(week.weekNumber) === resolvedActiveWeek

              return (
                <TabsTrigger
                  key={week.weekNumber}
                  value={String(week.weekNumber)}
                  className={cn(
                    'h-auto min-w-[102px] flex-shrink-0 rounded-[1.2rem] px-3 py-2 text-left data-[state=active]:shadow-none',
                    isSelected
                      ? 'bg-[#fff2b7] text-[#88601d] shadow-[0_8px_18px_rgba(204,167,71,0.18)]'
                      : 'bg-white text-[#66775b] hover:bg-[#f8f8f0]'
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
              <TabsContent key={week.weekNumber} value={String(week.weekNumber)} className="mt-3 space-y-3">
                <Card className="overflow-hidden rounded-[1.9rem] border border-[#dbe6c2] bg-white/94 py-0 shadow-[0_14px_30px_rgba(90,118,58,0.08)]">
                  <CardHeader className="px-4 pb-2 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base text-[#334223]">{week.weekNumber}주차 콘텐츠</CardTitle>
                      <Badge className={attendance.className}>
                        <AttendanceIcon className="mr-1 h-3.5 w-3.5" />
                        {attendance.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    {week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0 ? (
                      <div className="rounded-[1.35rem] border border-amber-300/40 bg-[#fff6db] px-4 py-3.5 text-sm text-amber-950">
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
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#334223]">
                            <PlayCircle className="h-4 w-4 text-[#f07f59]" />
                            영상
                          </div>
                          {youtubeItems.length > 1 ? (
                            <p className="text-xs text-[#66775b]">아래 카드에서 볼 영상을 골라요.</p>
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
                          <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
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
                                    'min-w-[11rem] rounded-[1.35rem] border px-3 py-3 text-left shadow-sm transition',
                                    isSelected
                                      ? 'border-[#f3d56c] bg-[#fff6cf]'
                                      : 'border-[#ebefde] bg-white hover:border-[#c9dca8]'
                                  )}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-medium text-[#334223]">영상 {index + 1}</span>
                                      {isSelected ? (
                                        <Badge className="border-[#ffe39e] bg-[#fff4c8] text-[#a8781f]">현재</Badge>
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
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#334223]">
                            <ImageIcon className="h-4 w-4 text-[#69a3df]" />
                            이미지
                          </div>
                          <p className="text-xs text-[#66775b]">좌우로 넘기고 눌러 크게 봅니다.</p>
                        </div>

                        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
                          {imageItems.map((item, index) => {
                            const alt = `${week.weekNumber}주차 이미지 ${index + 1}`

                            return (
                              <button
                                key={item.mediaId}
                                type="button"
                                onClick={() => setSelectedImage({ url: item.url, alt })}
                                className="group min-w-[75%] overflow-hidden rounded-[1.35rem] border border-[#ebefde] bg-white text-left shadow-sm transition hover:border-[#c9dca8] sm:min-w-[22rem]"
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
                      <div className="rounded-[1.35rem] bg-[#fff7d7] px-4 py-3.5">
                        <p className="text-sm font-medium text-[#334223]">진행 메모</p>
                        <p className="mt-1 text-sm leading-6 text-[#66775b]">{week.progressText}</p>
                      </div>
                    ) : null}

                    {week.sharedFeedbackText ? (
                      <div className="rounded-[1.35rem] bg-[#eef7dc] px-4 py-3.5">
                        <p className="text-sm font-medium text-[#334223]">전체 피드백</p>
                        <p className="mt-1 text-sm leading-6 text-[#66775b]">{week.sharedFeedbackText}</p>
                      </div>
                    ) : null}

                    {week.privateFeedbackText ? (
                      <div className="rounded-[1.35rem] border border-[#d9e7ff] bg-[#edf4ff] px-4 py-3.5">
                        <p className="text-sm font-medium text-[#334223]">개인 피드백</p>
                        <p className="mt-1 text-sm leading-6 text-[#66775b]">{week.privateFeedbackText}</p>
                      </div>
                    ) : null}

                    {selectedWeek?.weekNumber === week.weekNumber &&
                    (week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0) &&
                    youtubeItems.length === 0 &&
                    imageItems.length === 0 &&
                    !week.progressText &&
                    !week.sharedFeedbackText &&
                    !week.privateFeedbackText ? (
                      <div className="rounded-[1.35rem] border border-dashed border-[#d5dfbf] bg-[#fafbf4] px-4 py-8 text-center text-sm text-[#66775b]">
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
                      <div className="rounded-[1.35rem] border border-dashed border-[#d5dfbf] bg-[#fafbf4] px-4 py-8 text-center text-sm text-[#66775b]">
                        {detail.enrollmentStatus === 'PENDING'
                          ? '운영 승인 전입니다.'
                          : '수강은 시작됐고 콘텐츠는 아직 준비 중입니다.'}
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
        <DialogContent className="max-h-[90dvh] overflow-hidden rounded-[1.8rem] p-3 sm:max-w-5xl">
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
