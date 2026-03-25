'use client'

import { type DragEvent, useEffect, useState } from 'react'
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Youtube,
  ZoomIn,
} from 'lucide-react'

import type { WeeklyMediaWeek } from '@/lib/weekly-media'
import { extractYoutubeId, formatYearMonthLabel, normalizeYoutubeInput } from '@/lib/weekly-media'
import { cn } from '@/lib/utils'
import {
  adminAlertCardClass,
  adminCompactDangerButtonClass,
  adminDashedPanelClass,
  adminEditorSurfaceClass,
  adminInsetCardClass,
  adminPrimaryButtonClass,
  adminSubtlePanelClass,
  adminSurfaceInputClass,
  adminDialogContentClass,
} from '@/lib/admin/surface'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectedVideoPlayer } from '@/components/selected-video-player'

interface WeekContentEditorProps {
  week: WeeklyMediaWeek
  yearMonth: string
  onCreateVideo: (url: string) => Promise<void>
  onUpdateVideo: (mediaId: string, url: string) => Promise<void>
  onDeleteMedia: (mediaId: string) => Promise<void>
  onUploadImage: (file: File, mediaId?: string) => Promise<void>
}

export function WeekContentEditor({
  week,
  yearMonth,
  onCreateVideo,
  onUpdateVideo,
  onDeleteMedia,
  onUploadImage,
}: WeekContentEditorProps) {
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [videoDrafts, setVideoDrafts] = useState<Record<string, string>>({})
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isVideoDropActive, setIsVideoDropActive] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
  } | null>(null)

  useEffect(() => {
    const nextDrafts = Object.fromEntries(
      week.video.items.map((item) => [item.mediaId, item.url]),
    )
    setVideoDrafts(nextDrafts)
    setActionError(null)
    setSelectedVideoId((current) =>
      week.video.items.some((item) => item.mediaId === current)
        ? current
        : week.video.items[0]?.mediaId ?? null,
    )
  }, [week])

  function normalizeVideoDraft(mediaId: string) {
    const normalized = normalizeYoutubeInput(videoDrafts[mediaId] ?? '')
    if (!normalized) return false

    setVideoDrafts((current) => ({
      ...current,
      [mediaId]: normalized,
    }))

    return true
  }

  function normalizeNewVideoInput() {
    const normalized = normalizeYoutubeInput(newVideoUrl)
    if (!normalized) return false

    setNewVideoUrl(normalized)
    return true
  }

  function handleVideoDrop(event: DragEvent<HTMLDivElement>) {
    void (async () => {
      event.preventDefault()
      setIsVideoDropActive(false)
      setActionError(null)

      const droppedFile = event.dataTransfer.files?.[0]
      if (droppedFile) {
        setActionError('무료 운영 기준에서는 영상 파일 자동 업로드를 지원하지 않습니다. YouTube에 먼저 올린 뒤 링크를 붙여 넣어 주세요.')
        return
      }

      const droppedText =
        event.dataTransfer.getData('text/uri-list') ||
        event.dataTransfer.getData('text/plain') ||
        ''

      const normalized = normalizeYoutubeInput(droppedText)
      if (!normalized) {
        setActionError('YouTube 주소 또는 영상 ID를 드롭해 주세요.')
        return
      }

      setNewVideoUrl(normalized)
    })()
  }

  const hasAnyContent =
    week.video.items.length > 0 ||
    week.image.items.length > 0 ||
    week.video.invalidItems.length > 0 ||
    week.image.invalidItems.length > 0
  const newVideoPreviewId = extractYoutubeId(newVideoUrl)
  const selectedVideo =
    week.video.items.find((item) => item.mediaId === selectedVideoId) ?? week.video.items[0] ?? null
  const selectedVideoIndex = selectedVideo
    ? week.video.items.findIndex((item) => item.mediaId === selectedVideo.mediaId)
    : -1
  const selectedVideoPreviewId = selectedVideo
    ? extractYoutubeId(videoDrafts[selectedVideo.mediaId] ?? selectedVideo.url)
    : null

  function moveSelectedVideo(direction: -1 | 1) {
    if (week.video.items.length <= 1 || selectedVideoIndex === -1) {
      return
    }

    const nextIndex =
      (selectedVideoIndex + direction + week.video.items.length) % week.video.items.length

    setSelectedVideoId(week.video.items[nextIndex]?.mediaId ?? null)
  }

  async function handleCreateVideo() {
    const normalized = normalizeYoutubeInput(newVideoUrl)
    if (!normalized) return

    if (!extractYoutubeId(normalized)) {
      setActionError('유효한 YouTube 주소 또는 영상 ID를 입력해 주세요.')
      return
    }

    setBusyKey(`create-video-${week.weekNumber}`)
    setActionError(null)

    try {
      await onCreateVideo(normalized)
      setNewVideoUrl('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '영상 저장에 실패했습니다.')
    } finally {
      setBusyKey(null)
    }
  }

  async function handleUpdateVideo(mediaId: string) {
    const normalized = normalizeYoutubeInput(videoDrafts[mediaId] ?? '')
    if (!normalized) return

    if (!extractYoutubeId(normalized)) {
      setActionError('유효한 YouTube 주소 또는 영상 ID를 입력해 주세요.')
      return
    }

    setBusyKey(`update-video-${mediaId}`)
    setActionError(null)

    try {
      setVideoDrafts((current) => ({
        ...current,
        [mediaId]: normalized,
      }))
      await onUpdateVideo(mediaId, normalized)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '영상 수정에 실패했습니다.')
    } finally {
      setBusyKey(null)
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    setBusyKey(`delete-media-${mediaId}`)
    setActionError(null)

    try {
      await onDeleteMedia(mediaId)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '콘텐츠 삭제에 실패했습니다.')
    } finally {
      setBusyKey(null)
    }
  }

  async function handleUploadImage(file: File, mediaId?: string) {
    setBusyKey(`upload-image-${mediaId ?? 'new'}-${week.weekNumber}`)
    setActionError(null)

    try {
      await onUploadImage(file, mediaId)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{formatYearMonthLabel(yearMonth)} / {week.weekNumber}주차</span>
        <span className="hidden sm:inline">영상은 YouTube 링크로만 연결합니다.</span>
      </div>

      {actionError ? (
        <Card className={adminAlertCardClass('danger')}>
          <CardContent className="flex items-start gap-2 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{actionError}</p>
          </CardContent>
        </Card>
      ) : null}

      {(week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0) && (
        <Card className={adminAlertCardClass('warning')}>
          <CardContent className="space-y-2 py-4 text-sm text-amber-950">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" />
              다시 확인이 필요한 항목이 있습니다.
            </div>
            <p>다른 콘텐츠는 계속 확인하고 수정할 수 있습니다.</p>
            {week.video.invalidItems.map((item) => (
              <p key={item.mediaId}>영상 경고: {item.message}</p>
            ))}
            {week.image.invalidItems.map((item) => (
              <p key={item.mediaId}>이미지 경고: {item.message}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <section className={adminEditorSurfaceClass}>
        <div className="flex items-center gap-2 text-base font-semibold">
          <Youtube className="h-4 w-4 text-red-500" />
          <span>영상</span>
          <Badge variant="secondary">{week.video.items.length}개</Badge>
        </div>
        <div className="space-y-3">
          {week.video.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 등록된 영상이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {selectedVideo ? (
                <>
                  <SelectedVideoPlayer
                    label="현재 선택된 영상"
                    countLabel={
                      week.video.items.length > 1
                        ? `${selectedVideoIndex + 1} / ${week.video.items.length}`
                        : null
                    }
                    canNavigate={week.video.items.length > 1}
                    onPrevious={() => moveSelectedVideo(-1)}
                    onNext={() => moveSelectedVideo(1)}
                    surfaceClassName="bg-background"
                  >
                    {selectedVideoPreviewId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedVideoPreviewId}`}
                        title={`${week.weekNumber}주차 영상 미리보기`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        유효한 YouTube 주소를 입력하면 여기서 미리보기를 확인할 수 있습니다.
                      </div>
                    )}
                  </SelectedVideoPlayer>
                  <div className={adminSubtlePanelClass}>
                    <Input
                      value={videoDrafts[selectedVideo.mediaId] ?? selectedVideo.url}
                      onChange={(event) =>
                        setVideoDrafts((current) => ({
                          ...current,
                          [selectedVideo.mediaId]: event.target.value,
                        }))
                      }
                      onBlur={() => {
                        if (!videoDrafts[selectedVideo.mediaId]?.trim()) return
                        normalizeVideoDraft(selectedVideo.mediaId)
                      }}
                      placeholder="YouTube 주소 또는 영상 ID"
                      className={adminSurfaceInputClass}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => void handleUpdateVideo(selectedVideo.mediaId)}
                        disabled={busyKey === `update-video-${selectedVideo.mediaId}`}
                        className={adminPrimaryButtonClass}
                      >
                        {busyKey === `update-video-${selectedVideo.mediaId}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        저장
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => void handleDeleteMedia(selectedVideo.mediaId)}
                        disabled={busyKey === `delete-media-${selectedVideo.mediaId}`}
                        className={adminCompactDangerButtonClass}
                      >
                        {busyKey === `delete-media-${selectedVideo.mediaId}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        삭제
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
                {week.video.items.map((item, index) => {
                  const isSelected = item.mediaId === selectedVideo?.mediaId

                  return (
                    <button
                      key={item.mediaId}
                      type="button"
                      onClick={() => setSelectedVideoId(item.mediaId)}
                      className={cn(
                        'min-w-[11rem] snap-start rounded-[1.25rem] border px-3 py-3 text-left shadow-[0_8px_16px_rgba(111,145,72,0.06)] transition',
                        isSelected
                          ? 'border-[#d8e9b7] bg-[linear-gradient(180deg,rgba(246,252,227,0.99)_0%,rgba(229,244,193,0.98)_100%)]'
                          : 'bg-white/96 hover:border-[#d8e9b7]',
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
            </div>
          )}

          <div
            className={cn(
              adminDashedPanelClass,
              'space-y-2 transition-colors',
              isVideoDropActive && 'border-[#f0c0b9] bg-[#fff5f0]',
            )}
            onDragOver={(event) => {
              event.preventDefault()
              setIsVideoDropActive(true)
            }}
            onDragLeave={() => setIsVideoDropActive(false)}
            onDrop={handleVideoDrop}
          >
            <Label htmlFor={`video-create-${week.weekNumber}`}>새 영상 추가</Label>
            <Input
              id={`video-create-${week.weekNumber}`}
              value={newVideoUrl}
              onChange={(event) => setNewVideoUrl(event.target.value)}
              onBlur={() => {
                if (!newVideoUrl.trim()) return
                normalizeNewVideoInput()
              }}
              onPaste={(event) => {
                const pastedText = event.clipboardData.getData('text')
                const normalized = normalizeYoutubeInput(pastedText)
                if (!normalized) return

                event.preventDefault()
                setNewVideoUrl(normalized)
                setActionError(null)
              }}
              placeholder="YouTube 주소 또는 영상 ID"
              className={adminSurfaceInputClass}
            />
            {newVideoPreviewId ? (
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <iframe
                  src={`https://www.youtube.com/embed/${newVideoPreviewId}`}
                  title={`${week.weekNumber}주차 새 영상 미리보기`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              YouTube 주소나 영상 ID를 붙여넣거나 여기로 드롭할 수 있습니다.
              {' '}영상 파일 드롭은 지원하지 않습니다.
            </p>
            <Button
              variant="ghost"
              onClick={() => void handleCreateVideo()}
              disabled={busyKey === `create-video-${week.weekNumber}` || !newVideoUrl.trim()}
              className={adminPrimaryButtonClass}
            >
              {busyKey === `create-video-${week.weekNumber}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              영상 추가
            </Button>
          </div>
        </div>
      </section>

      <section className={adminEditorSurfaceClass}>
        <div className="flex items-center gap-2 text-base font-semibold">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          <span>이미지</span>
          <Badge variant="secondary">{week.image.items.length}개</Badge>
        </div>
        <div className="space-y-3">
          {week.image.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 업로드된 이미지가 없습니다.</p>
          ) : (
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
              {week.image.items.map((item, index) => {
                const imageAlt = `${week.weekNumber}주차 이미지 ${index + 1}`

                return (
                  <div
                    key={item.mediaId}
                    className="min-w-[78%] snap-start space-y-3 rounded-[1.3rem] border border-[#e5ecd8] bg-white/98 p-3 shadow-[0_10px_18px_rgba(111,145,72,0.06)] sm:min-w-[22rem]"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedImage({ url: item.url, alt: imageAlt })}
                      className="group w-full overflow-hidden rounded-lg border bg-muted text-left"
                    >
                      <div className="relative">
                        <img
                          src={item.url}
                          alt={imageAlt}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">저장된 이미지</Badge>
                      <span className="text-xs text-muted-foreground">새 파일을 고르면 바로 교체됩니다.</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Label
                        htmlFor={`replace-image-${item.mediaId}`}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-[1rem] border border-[#dce8cc] bg-white/96 px-3 py-2 text-sm font-medium text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)]"
                      >
                        {busyKey === `upload-image-${item.mediaId}-${week.weekNumber}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        교체
                      </Label>
                      <input
                        id={`replace-image-${item.mediaId}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) {
                            void handleUploadImage(file, item.mediaId)
                          }
                          event.currentTarget.value = ''
                        }}
                      />
                      <Button
                        variant="ghost"
                        onClick={() => void handleDeleteMedia(item.mediaId)}
                        disabled={busyKey === `delete-media-${item.mediaId}`}
                        className={adminCompactDangerButtonClass}
                      >
                        {busyKey === `delete-media-${item.mediaId}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        삭제
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className={cn(adminDashedPanelClass, 'space-y-2')}>
            <Label
              htmlFor={`new-image-${week.weekNumber}`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[1rem] border border-[#dce8cc] bg-white/96 px-3 py-2 text-sm font-medium text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)]"
            >
              {busyKey === `upload-image-new-${week.weekNumber}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              이미지 업로드
            </Label>
            <input
              id={`new-image-${week.weekNumber}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void handleUploadImage(file)
                }
                event.currentTarget.value = ''
              }}
            />
            <p className="text-xs text-muted-foreground">
              10MB 이하 이미지 파일만 업로드할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {!hasAnyContent ? (
        <Card className={adminInsetCardClass}>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            아직 이 주차에 공개 중인 영상이나 이미지가 없습니다.
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={selectedImage !== null} onOpenChange={(open) => (!open ? setSelectedImage(null) : null)}>
        <DialogContent className={`${adminDialogContentClass} max-h-[90dvh] overflow-hidden p-3 sm:max-w-5xl`}>
          <DialogHeader className="pr-8">
            <DialogTitle>이미지 크게 보기</DialogTitle>
            <DialogDescription>
              업로드된 주차 이미지를 크게 확인합니다.
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
