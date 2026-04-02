'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, Shrink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  studentOverlayBadgeClass,
  studentOverlayButtonClass,
  studentOverlayControlRowClass,
  studentOverlayButtonShellClass,
  studentOverlayClusterClass,
  studentVideoPlayerClass,
} from '@/lib/student/surface'
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
  showHeader?: boolean
  fullscreenControlMode?: 'header' | 'overlay' | 'both'
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
  showHeader = true,
  fullscreenControlMode = 'header',
  surfaceClassName,
  playerClassName,
  children,
}: SelectedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const hasNavigation = canNavigate && onPrevious && onNext
  const showHeaderFullscreenControl =
    fullscreenControlMode === 'header' || fullscreenControlMode === 'both'
  const showOverlayFullscreenControl =
    fullscreenControlMode === 'overlay' || fullscreenControlMode === 'both'

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

  function renderFullscreenButton(overlay: boolean) {
    const buttonClassName = overlay ? studentOverlayButtonClass : undefined

    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={buttonClassName}
        onClick={() => void toggleFullscreen()}
        aria-label={isFullscreen ? `${label} 전체화면 종료` : `${label} 전체화면`}
      >
        {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
      </Button>
    )
  }

  function renderNavigationControls(overlay: boolean) {
    if (!hasNavigation) {
      return null
    }

    const buttonClassName = overlay ? studentOverlayButtonClass : undefined

    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={buttonClassName}
          onClick={onPrevious}
          aria-label="이전 영상"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={buttonClassName}
          onClick={onNext}
          aria-label="다음 영상"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </>
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
      {!isFullscreen && showHeader ? (
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{label}</Badge>
            {countLabel ? (
              <span className="text-xs text-muted-foreground">
                {countLabel}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {showHeaderFullscreenControl ? renderFullscreenButton(false) : null}
            {renderNavigationControls(false)}
          </div>
        </div>
      ) : null}

      <div className={cn('relative aspect-video', studentVideoPlayerClass, isFullscreen && 'min-h-0 flex-1 bg-black', playerClassName)}>
        {!isFullscreen && showOverlayFullscreenControl ? (
          <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2">
            <div className={studentOverlayButtonShellClass}>
              {renderFullscreenButton(true)}
            </div>
          </div>
        ) : null}
        {isFullscreen ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-[#111711] shadow-[0_10px_24px_rgba(0,0,0,0.34)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div className={studentOverlayClusterClass}>
                <Badge
                  variant="outline"
                  className={studentOverlayBadgeClass}
                >
                  {label}
                </Badge>
                {countLabel ? (
                  <span className="truncate text-xs font-medium text-white">
                    {countLabel}
                  </span>
                ) : null}
              </div>
              <div className={studentOverlayControlRowClass}>
                {renderFullscreenButton(true)}
                {renderNavigationControls(true)}
              </div>
            </div>
          </>
        ) : null}
        {children}
      </div>
    </div>
  )
}
