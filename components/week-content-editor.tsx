'use client'

import { type DragEvent, useEffect, useState } from 'react'
import { AlertCircle, Image as ImageIcon, Loader2, Plus, Save, Trash2, Upload, Youtube } from 'lucide-react'

import type { WeeklyMediaWeek } from '@/lib/weekly-media'
import { extractYoutubeId, formatYearMonthLabel, normalizeYoutubeInput } from '@/lib/weekly-media'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

  useEffect(() => {
    const nextDrafts = Object.fromEntries(
      week.video.items.map((item) => [item.mediaId, item.url]),
    )
    setVideoDrafts(nextDrafts)
    setActionError(null)
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
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-2 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{actionError}</p>
          </CardContent>
        </Card>
      ) : null}

      {(week.video.invalidItems.length > 0 || week.image.invalidItems.length > 0) && (
        <Card className="border-amber-300/40 bg-amber-50/60">
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

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-2 text-base font-semibold">
          <Youtube className="h-4 w-4 text-red-500" />
          <span>영상</span>
          <Badge variant="secondary">{week.video.items.length}개</Badge>
        </div>
        <div className="space-y-3">
          {week.video.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 등록된 영상이 없습니다.</p>
          ) : (
            week.video.items.map((item) => {
              const previewId = extractYoutubeId(videoDrafts[item.mediaId] ?? item.url)

              return (
                <div key={item.mediaId} className="space-y-3 rounded-xl border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">저장된 영상</Badge>
                  </div>
                  <Input
                    value={videoDrafts[item.mediaId] ?? item.url}
                    onChange={(event) =>
                      setVideoDrafts((current) => ({
                        ...current,
                        [item.mediaId]: event.target.value,
                      }))
                    }
                    onBlur={() => {
                      if (!videoDrafts[item.mediaId]?.trim()) return
                      normalizeVideoDraft(item.mediaId)
                    }}
                    placeholder="YouTube 주소 또는 영상 ID"
                  />
                  {previewId ? (
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                      <iframe
                        src={`https://www.youtube.com/embed/${previewId}`}
                        title={`${week.weekNumber}주차 영상 미리보기`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => void handleUpdateVideo(item.mediaId)}
                      disabled={busyKey === `update-video-${item.mediaId}`}
                      className="gap-2"
                    >
                      {busyKey === `update-video-${item.mediaId}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleDeleteMedia(item.mediaId)}
                      disabled={busyKey === `delete-media-${item.mediaId}`}
                      className="gap-2"
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
            })
          )}

          <div
            className={cn(
              'space-y-2 rounded-xl border border-dashed p-3 transition-colors',
              isVideoDropActive && 'border-red-300 bg-red-50/60',
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
              onClick={() => void handleCreateVideo()}
              disabled={busyKey === `create-video-${week.weekNumber}` || !newVideoUrl.trim()}
              className="gap-2"
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

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-2 text-base font-semibold">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          <span>이미지</span>
          <Badge variant="secondary">{week.image.items.length}개</Badge>
        </div>
        <div className="space-y-3">
          {week.image.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 업로드된 이미지가 없습니다.</p>
          ) : (
            week.image.items.map((item) => (
              <div key={item.mediaId} className="space-y-3 rounded-xl border p-3">
                <div className="overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={item.url}
                    alt={`${week.weekNumber}주차 이미지`}
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">저장된 이미지</Badge>
                  <span className="text-xs text-muted-foreground">새 파일을 고르면 바로 교체됩니다.</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Label
                    htmlFor={`replace-image-${item.mediaId}`}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
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
                    variant="outline"
                    onClick={() => void handleDeleteMedia(item.mediaId)}
                    disabled={busyKey === `delete-media-${item.mediaId}`}
                    className="gap-2"
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
            ))
          )}

          <div className="space-y-2 rounded-xl border border-dashed p-3">
            <Label
              htmlFor={`new-image-${week.weekNumber}`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
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
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            아직 이 주차에 공개 중인 영상이나 이미지가 없습니다.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
