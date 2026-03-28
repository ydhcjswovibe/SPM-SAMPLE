'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  PlayCircle,
  Send,
  UserRound,
  ZoomIn,
} from 'lucide-react'

import type { StudentClassDetail } from '@/lib/weekly-media'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SelectedVideoPlayer } from '@/components/selected-video-player'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

function getEmptyWeekMessage(enrollmentStatus: StudentClassDetail['enrollmentStatus']) {
  return enrollmentStatus === 'PENDING' ? '운영 승인 전입니다.' : '이 주차 콘텐츠는 아직 준비 중입니다.'
}

function getAttendanceTone(status: 'present' | 'absent' | 'pending' | 'excused') {
  if (status === 'present') {
    return 'border-[#cfe7c6] bg-[#eef8ea] text-[#38632b]'
  }

  if (status === 'absent') {
    return 'border-[#efd3cc] bg-[#fff1ed] text-[#a14f42]'
  }

  if (status === 'excused') {
    return 'border-[#d4e1fb] bg-[#f2f7ff] text-[#5576b7]'
  }

  return 'border-[#e7deca] bg-[#fbf6ea] text-[#816f48]'
}

export function StudentClassDetailView({
  detail,
  initialWeekNumber,
}: {
  detail: StudentClassDetail
  initialWeekNumber?: number | null
}) {
  const [activeWeek, setActiveWeek] = useState<string | null>(null)
  const [selectedVideoByWeek, setSelectedVideoByWeek] = useState<Record<string, string>>({})
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
  } | null>(null)
  const [replyDraftByWeek, setReplyDraftByWeek] = useState<Record<string, string>>(() =>
    Object.fromEntries(detail.weeks.map((week) => [String(week.weekNumber), week.studentReplyText ?? ''])),
  )
  const [savingReplyWeek, setSavingReplyWeek] = useState<string | null>(null)
  const [replyFeedbackByWeek, setReplyFeedbackByWeek] = useState<Record<string, string | null>>({})

  if (detail.weeks.length === 0) {
    return (
      <Card className="overflow-hidden rounded-[1.9rem] border border-[#e2ead5] bg-white py-0 shadow-[0_14px_30px_rgba(111,145,72,0.08)]">
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

  const defaultActiveWeek =
    typeof initialWeekNumber === 'number' &&
    detail.weeks.some((week) => week.weekNumber === initialWeekNumber)
      ? initialWeekNumber
      : detail.defaultWeekNumber && detail.weeks.some((week) => week.weekNumber === detail.defaultWeekNumber)
        ? detail.defaultWeekNumber
        : detail.weeks[0]?.weekNumber ?? null
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
  const noteSections = [
    {
      key: 'private',
      label: '개별 피드백',
      text: selectedWeek?.privateFeedbackText ?? null,
      icon: UserRound,
      tone: 'border-[#d7e6fb] bg-[#f4f8ff] text-[#5478b8]',
    },
  ].filter((section) => Boolean(section.text))
  const canReply = Boolean(selectedWeek?.privateFeedbackText)
  const replyDraft = replyDraftByWeek[weekKey] ?? ''
  const replyFeedback = replyFeedbackByWeek[weekKey] ?? null

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

  async function handleReplySave() {
    if (!selectedWeek) {
      return
    }

    setSavingReplyWeek(weekKey)
    setReplyFeedbackByWeek((current) => ({
      ...current,
      [weekKey]: null,
    }))

    try {
      const response = await fetch('/api/student/weekly-feedback-reply', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: detail.classId,
          yearMonth: detail.yearMonth,
          weekNumber: selectedWeek.weekNumber,
          replyText: replyDraft,
        }),
      })

      if (!response.ok) {
        throw new Error('답글 저장에 실패했습니다.')
      }

      setReplyFeedbackByWeek((current) => ({
        ...current,
        [weekKey]: replyDraft.trim() ? '이번 주 답글을 저장했습니다.' : '이번 주 답글을 지웠습니다.',
      }))
    } catch (error) {
      setReplyFeedbackByWeek((current) => ({
        ...current,
        [weekKey]: error instanceof Error ? error.message : '답글 저장에 실패했습니다.',
      }))
    } finally {
      setSavingReplyWeek(null)
    }
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
                    'h-auto rounded-[1.15rem] border px-2 py-2.5 text-left data-[state=active]:shadow-none',
                    isSelected
                      ? 'border-[#f0d77b] bg-[#fff4c8] text-[#88601d] shadow-[0_8px_18px_rgba(204,167,71,0.14)]'
                      : 'border-[#e8eedc] bg-white text-[#66775b] hover:bg-[#fafaf4]',
                  )}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-semibold">{week.weekNumber}주차</span>
                    <span className="text-[11px] font-medium opacity-80">
                      {week.sessionRangeLabel ?? `${week.sessions.length || 0}회차`}
                    </span>
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {selectedWeek ? (
          <Card className="overflow-hidden rounded-[1.9rem] border border-[#e2ead5] bg-white py-0 shadow-[0_14px_30px_rgba(111,145,72,0.08)]">
            <CardContent className="space-y-4 px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
              {selectedWeek.sessions.length > 0 ? (
                <div className="rounded-[1.45rem] border border-[#e6ecd8] bg-[#fbfdf7] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#314127]">이번 주 실제 수업 날짜</div>
                      <div className="mt-1 text-xs text-[#6b7d5e]">
                        {selectedWeek.sessionRangeLabel ?? `${selectedWeek.sessions.length}회차`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedWeek.sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[0_6px_12px_rgba(111,145,72,0.06)]',
                          getAttendanceTone(session.attendanceStatus),
                        )}
                      >
                        <span>{session.label}</span>
                        {session.timeLabel ? <span className="ml-1.5 opacity-80">{session.timeLabel}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

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

              {noteSections.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#314127]">
                    <MessageSquareText className="h-4 w-4 text-[#7a9f4c]" />
                    <span>이번 주 기록</span>
                  </div>
                  <div className="space-y-2.5">
                    {noteSections.map((section) => {
                      const Icon = section.icon

                      return (
                        <div key={section.key} className={cn('rounded-[1.35rem] border px-3.5 py-3', section.tone)}>
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Icon className="h-4 w-4" />
                            <span>{section.label}</span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#314127]">{section.text}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {canReply ? (
                <div className="space-y-2.5 rounded-[1.45rem] border border-[#dde6ce] bg-[#f9fcf2] px-3.5 py-3.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#314127]">
                    <Send className="h-4 w-4 text-[#6a9540]" />
                    <span>이번 주 답글</span>
                  </div>
                  <p className="text-xs leading-5 text-[#6b7d5e]">
                    개별 피드백에 대한 짧은 확인이나 질문을 남길 수 있습니다.
                  </p>
                  <Textarea
                    value={replyDraft}
                    onChange={(event) => {
                      setReplyDraftByWeek((current) => ({
                        ...current,
                        [weekKey]: event.target.value,
                      }))
                      setReplyFeedbackByWeek((current) => ({
                        ...current,
                        [weekKey]: null,
                      }))
                    }}
                    placeholder="이번 주 개별 피드백을 보고 느낀 점이나 질문을 적어 주세요."
                    className="min-h-24 rounded-[1.2rem] border-[#dce8cc] bg-white"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-[#7a876d]">
                      {selectedWeek.studentReplyText ? '저장된 답글이 있습니다.' : '아직 답글을 남기지 않았습니다.'}
                    </div>
                    <Button
                      type="button"
                      onClick={() => void handleReplySave()}
                      disabled={savingReplyWeek === weekKey}
                      className="h-10 rounded-full bg-[#8fcf62] px-4 font-semibold text-white hover:bg-[#98d86d]"
                    >
                      {savingReplyWeek === weekKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      저장
                    </Button>
                  </div>
                  {replyFeedback ? (
                    <div className="rounded-[1rem] border border-[#dce8cc] bg-white px-3 py-2 text-sm text-[#4c5f3e]">
                      {replyFeedback}
                    </div>
                  ) : null}
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
              <img src={selectedImage.url} alt={selectedImage.alt} className="max-h-[75dvh] w-full object-contain" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
