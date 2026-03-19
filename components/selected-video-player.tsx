'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, Shrink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

type FullscreenCapableDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void
}

type OrientationAwareScreen = Screen & {
  orientation?: ScreenOrientation & {
    lock?: (orientation: 'landscape') => Promise<void>
    unlock?: () => void
  }
}

interface SelectedVideoPlayerProps {
  label: string
  countLabel?: string | null
  canNavigate?: boolean
  onPrevious?: () => void
  onNext?: () => void
  surfaceClassName?: string
  playerClassName?: string
  children: ReactNode
}

export function SelectedVideoPlayer({
  label,
  countLabel,
  canNavigate = false,
  onPrevious,
  onNext,
  surfaceClassName,
  playerClassName,
  children,
}: SelectedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const hasNavigation = canNavigate && onPrevious && onNext

  useEffect(() => {
    function handleFullscreenChange() {
      const nextIsFullscreen = document.fullscreenElement === containerRef.current
      setIsFullscreen(nextIsFullscreen)

      if (!nextIsFullscreen) {
        try {
          (screen as OrientationAwareScreen).orientation?.unlock?.()
        } catch {
          // Ignore unsupported orientation unlock failures.
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  async function toggleFullscreen() {
    const element = containerRef.current as FullscreenCapableElement | null
    if (!element) {
      return
    }

    const fullscreenDocument = document as FullscreenCapableDocument

    if (document.fullscreenElement === element) {
      try {
        if (fullscreenDocument.exitFullscreen) {
          await fullscreenDocument.exitFullscreen()
        } else {
          await fullscreenDocument.webkitExitFullscreen?.()
        }
      } finally {
        try {
          (screen as OrientationAwareScreen).orientation?.unlock?.()
        } catch {
          // Ignore unsupported orientation unlock failures.
        }
      }

      return
    }

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else {
        await element.webkitRequestFullscreen?.()
      }

      try {
        await (screen as OrientationAwareScreen).orientation?.lock?.('landscape')
      } catch {
        // Landscape lock is best-effort only.
      }
    } catch {
      // Ignore browsers that block fullscreen on the current device.
    }
  }

  function renderControls(overlay: boolean) {
    const buttonClassName = overlay
      ? 'border border-white/15 bg-black/55 text-white hover:bg-black/72 hover:text-white'
      : undefined

    return (
      <div
        className={cn(
          'flex items-center gap-2',
          overlay && 'pointer-events-auto rounded-full border border-white/10 bg-black/25 p-1.5 backdrop-blur-sm',
        )}
      >
        <Button
          type="button"
          variant={overlay ? 'ghost' : isFullscreen ? 'secondary' : 'outline'}
          size="icon"
          className={buttonClassName}
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? `${label} 전체화면 종료` : `${label} 전체화면`}
        >
          {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </Button>
        {hasNavigation ? (
          <>
            <Button
              type="button"
              variant={overlay ? 'ghost' : isFullscreen ? 'secondary' : 'outline'}
              size="icon"
              className={buttonClassName}
              onClick={onPrevious}
              aria-label="이전 영상"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={overlay ? 'ghost' : isFullscreen ? 'secondary' : 'outline'}
              size="icon"
              className={buttonClassName}
              onClick={onNext}
              aria-label="다음 영상"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-xl border',
        surfaceClassName,
        isFullscreen && 'flex h-full w-full flex-col rounded-none border-0 bg-black text-white',
      )}
    >
      {!isFullscreen ? (
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{label}</Badge>
            {countLabel ? (
              <span className="text-xs text-muted-foreground">
                {countLabel}
              </span>
            ) : null}
          </div>
          {renderControls(false)}
        </div>
      ) : null}

      <div className={cn('relative aspect-video bg-muted', isFullscreen && 'min-h-0 flex-1 bg-black', playerClassName)}>
        {isFullscreen ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/65 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-full border border-white/12 bg-black/55 px-3 py-2 backdrop-blur-sm">
                <Badge
                  variant="outline"
                  className="border-white/18 bg-white/12 text-white"
                >
                  {label}
                </Badge>
                {countLabel ? (
                  <span className="truncate text-xs font-medium text-white/80">
                    {countLabel}
                  </span>
                ) : null}
              </div>
              {renderControls(true)}
            </div>
          </>
        ) : null}
        {children}
      </div>
    </div>
  )
}
