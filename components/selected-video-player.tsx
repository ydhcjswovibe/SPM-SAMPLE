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

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-hidden rounded-xl border',
        surfaceClassName,
        isFullscreen && 'flex h-full w-full flex-col rounded-none border-0 bg-black text-white',
      )}
    >
      <div className={cn('flex items-center justify-between gap-3 px-3 py-3', isFullscreen && 'bg-black text-white')}>
        <div className="flex items-center gap-2">
          <Badge variant={isFullscreen ? 'secondary' : 'outline'}>{label}</Badge>
          {countLabel ? (
            <span className={cn('text-xs text-muted-foreground', isFullscreen && 'text-white/75')}>
              {countLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isFullscreen ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? `${label} 전체화면 종료` : `${label} 전체화면`}
          >
            {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
          {canNavigate && onPrevious && onNext ? (
            <>
              <Button
                type="button"
                variant={isFullscreen ? 'secondary' : 'outline'}
                size="icon"
                onClick={onPrevious}
                aria-label="이전 영상"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={isFullscreen ? 'secondary' : 'outline'}
                size="icon"
                onClick={onNext}
                aria-label="다음 영상"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <div className={cn('aspect-video bg-muted', isFullscreen && 'min-h-0 flex-1 bg-black', playerClassName)}>
        {children}
      </div>
    </div>
  )
}
