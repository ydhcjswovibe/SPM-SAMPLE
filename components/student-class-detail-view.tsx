'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon, PlayCircle, ZoomIn } from 'lucide-react'

import type { StudentClassDetail } from '@/lib/weekly-media'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SelectedVideoPlayer } from '@/components/selected-video-player'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

function hasReadyMedia(week: StudentClassDetail['weeks'][number]) {
  return week.video.items.length > 0 || week.image.items.length > 0
}

function getEmptyWeekMessage(enrollmentStatus: StudentClassDetail['enrollmentStatus']) {
  return enrollmentStatus === 'PENDING' ? '운영 승인 전입니다.' : '이 주차 콘텐츠는 아직 준비 중입니다.'
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
      <Card className="overflow-hidden rounded-[1.9rem] border border-[#e2ead5] bg-white/94 py-0 shadow-[0_14px_30px_rgba(111,145,72,0.08)]">
        <CardContent className="px-4 py-10 text-center">
          <p className="text-base font-semibold text-[#314127]">{getEmptyWeekMessage(detail.enrollmentStatus)}</p>
          <p className="mt-2 text-sm leading-6 text-[#6b7d5e]">
            {detail.enrollmentStatus === 'PENDING'
              ? '승인이 끝나면 이 화면에서 바로 콘텐츠를 이어서 볼 수 있습니다.'
              : '새로운 콘텐츠가 열리면 이 화면에서 바로 확인할 수 있습니다.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const defaultActiveWeek = detail.weeks.find(hasReadyMedia)?.weekNumber ?? detail.weeks[0]?.weekNumber ?? null
  const resolvedActiveWeek =
    activeWeek && detail.weeks.some((week) => String(week.weekNumber) === activeWeek)
      ? activeWeek
      : defaultActiveWeek
        ? String(defaultActiveWeek)
        : null

  const selectedWeek =
    detail.weeks.find((week) => String(week.weekNumber) === resolvedActiveWeek) ?? detail.weeks[0] ?? null

  const youtubeItems = selectedWeek?.video.items ?? []
  const imageItems = selectedWeek?.image.items ?? []
  const weekKey = String(selectedWeek?.weekNumber ?? '')
  const selectedVideo =
    youtubeItems.find((item) => item.mediaId === selectedVideoByWeek[weekKey]) ?? youtubeItems[0] ?? null
  const selectedVideoIndex = selectedVideo
    ? youtubeItems.findIndex((item) => item.mediaId === selectedVideo.mediaId)
    : -1
  const videoCountLabel =
    youtubeItems.length > 1 && selectedVideoIndex >= 0 ? `${selectedVideoIndex + 1} / ${youtubeItems.length}` : null
  const hasVisibleContent = youtubeItems.length > 0 || imageItems.length > 0

  function moveSelectedVideo(direction: -1 | 1) {
    if (youtubeItems.length <= 1 || selectedVideoIndex === -1) {
      return
    }

    const nextIndex = (selectedVideoIndex + direction + youtubeItems.length) % youtubeItems.length

    setSelectedVideoByWeek((current) => ({
      ...current,
      [weekKey]: youtubeItems[nextIndex]?.mediaId ?? current[weekKey],
    }))
  }

  return (
    <>
      <div className="space-y-3">
        <Tabs value={resolvedActiveWeek ?? String(detail.weeks[0]?.weekNumber ?? 1)} onValueChange={setActiveWeek}>
          <TabsList
            style={{ gridTemplateColumns: `repeat(${detail.weeks.length}, minmax(0, 1fr))` }}
            className="grid h-auto w-full gap-2 rounded-[1.7rem] border border-[#e2ead4] bg-[#f7fbef] p-2 shadow-[0_12px_26px_rgba(111,145,72,0.08)]"
          >
            {detail.weeks.map((week) => {
              const isSelected = String(week.weekNumber) === resolvedActiveWeek

              return (
                <TabsTrigger
                  key={week.weekNumber}
                  value={String(week.weekNumber)}
                  className={cn(
                    'h-11 rounded-[1.15rem] border px-0 text-sm font-semibold data-[state=active]:shadow-none',
                    isSelected
                      ? 'border-[#f0d77b] bg-[#fff4c8] text-[#88601d] shadow-[0_8px_18px_rgba(204,167,71,0.14)]'
                      : 'border-[#e8eedc] bg-white text-[#66775b] hover:bg-[#fafaf4]',
                  )}
                >
                  {week.weekNumber}주차
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {selectedWeek ? (
          <Card className="overflow-hidden rounded-[1.9rem] border border-[#e2ead5] bg-white/96 py-0 shadow-[0_14px_30px_rgba(111,145,72,0.08)]">
            <CardContent className="space-y-4 px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
              {youtubeItems.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#314127]">
                      <PlayCircle className="h-4 w-4 text-[#eb8d60]" />
                      <span>영상</span>
                    </div>

                    {youtubeItems.length > 1 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-[2.8rem] text-right text-[11px] font-semibold text-[#7b8b69]">
                          {videoCountLabel}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => moveSelectedVideo(-1)}
                          aria-label="이전 영상"
                          className="h-8 w-8 rounded-full border-[#dbe5c9] bg-white text-[#486035]"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => moveSelectedVideo(1)}
                          aria-label="다음 영상"
                          className="h-8 w-8 rounded-full border-[#dbe5c9] bg-white text-[#486035]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {selectedVideo ? (
                    <SelectedVideoPlayer
                      label="재생 중"
                      countLabel={videoCountLabel}
                      canNavigate={youtubeItems.length > 1}
                      onPrevious={() => moveSelectedVideo(-1)}
                      onNext={() => moveSelectedVideo(1)}
                      showHeader={false}
                      fullscreenControlMode="overlay"
                      surfaceClassName="rounded-[1.45rem] border border-[#e4ead8] bg-[#f6faef]"
                      playerClassName="bg-[#eef3e4]"
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                        title={`${selectedWeek.weekNumber}주차 선택 영상`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </SelectedVideoPlayer>
                  ) : null}
                </div>
              ) : null}

              {imageItems.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#314127]">
                      <ImageIcon className="h-4 w-4 text-[#79a6e4]" />
                      이미지
                    </div>
                    <p className="text-xs text-[#6b7d5e]">좌우로 넘기고 눌러 크게 봅니다.</p>
                  </div>

                  <div className="-mx-3.5 flex gap-2.5 overflow-x-auto px-3.5 pb-1 sm:-mx-4 sm:px-4">
                    {imageItems.map((item, index) => {
                      const alt = `${selectedWeek.weekNumber}주차 이미지 ${index + 1}`

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

              {!hasVisibleContent ? (
                <div className="rounded-[1.35rem] border border-dashed border-[#d8e2c7] bg-[#fbfcf6] px-4 py-8 text-center text-sm text-[#6b7d5e]">
                  {getEmptyWeekMessage(detail.enrollmentStatus)}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
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
