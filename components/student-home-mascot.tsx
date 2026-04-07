'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

import { SpmMascot } from '@/components/spm-mascot'
import { cn } from '@/lib/utils'

interface StudentHomeMascotProps {
  className?: string
}

const tapMessages = [
  '좋아요, 한 스텝 더',
  '리듬이 차오르고 있어요',
  '오늘도 잘하고 있어요',
  '가볍게 한 번 더',
  '진행감이 쌓이고 있어요',
]

const tapDurationMs = 720
const bubbleDurationMs = 1400

export function StudentHomeMascot({ className }: StudentHomeMascotProps) {
  const [messageIndex, setMessageIndex] = useState(-1)
  const [isTapped, setIsTapped] = useState(false)
  const [isBubbleVisible, setIsBubbleVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const tapTimeoutRef = useRef<number | null>(null)
  const bubbleTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event?: MediaQueryListEvent) => {
      setPrefersReducedMotion(event ? event.matches : media.matches)
    }

    handleChange()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange)
    } else {
      media.addListener(handleChange)
    }

    return () => {
      if (tapTimeoutRef.current !== null) {
        window.clearTimeout(tapTimeoutRef.current)
      }
      if (bubbleTimeoutRef.current !== null) {
        window.clearTimeout(bubbleTimeoutRef.current)
      }

      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', handleChange)
      } else {
        media.removeListener(handleChange)
      }
    }
  }, [])

  function handleTap() {
    setMessageIndex((current) => (current + 1 + tapMessages.length) % tapMessages.length)
    setIsTapped(true)
    setIsBubbleVisible(true)

    if (tapTimeoutRef.current !== null) {
      window.clearTimeout(tapTimeoutRef.current)
    }
    if (bubbleTimeoutRef.current !== null) {
      window.clearTimeout(bubbleTimeoutRef.current)
    }

    tapTimeoutRef.current = window.setTimeout(() => {
      setIsTapped(false)
      tapTimeoutRef.current = null
    }, prefersReducedMotion ? 180 : tapDurationMs)

    bubbleTimeoutRef.current = window.setTimeout(() => {
      setIsBubbleVisible(false)
      bubbleTimeoutRef.current = null
    }, bubbleDurationMs)
  }

  const bubbleMessage = messageIndex >= 0 ? tapMessages[messageIndex] : tapMessages[0]

  return (
    <div className={cn('relative flex h-36 w-[13.5rem] max-w-full items-center justify-center', className)}>
      <div className="absolute inset-x-7 bottom-3 h-4 rounded-full bg-[rgba(159,194,101,0.24)] blur-md" aria-hidden="true" />

      {isBubbleVisible ? (
        <div
          data-slot="student-home-mascot-bubble"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            'pointer-events-none absolute right-0 top-0 z-20 max-w-[9.25rem] rounded-2xl border border-[#ead9bf] bg-card px-3 py-2 text-[11px] font-semibold leading-4 text-[#6a5630] shadow-[0_12px_22px_rgba(154,124,53,0.12)]',
            !prefersReducedMotion && 'student-home-mascot__bubble',
            isTapped && !prefersReducedMotion && 'student-home-mascot__bubble--tapped',
          )}
        >
          <span className="absolute bottom-3 left-3 h-2.5 w-2.5 rotate-45 border-b border-r border-[#ead9bf] bg-card" />
          <span className="relative flex items-start gap-1.5">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#c49a2f]" />
            <span>{bubbleMessage}</span>
          </span>
        </div>
      ) : null}

      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-white/52 blur-lg" aria-hidden="true" />
        <button
          type="button"
          onClick={handleTap}
          data-slot="student-home-mascot"
          aria-label="미니펫 상호작용"
          className="group relative flex h-32 w-32 items-center justify-center rounded-full border border-[#edf2e2] bg-card shadow-[0_18px_34px_rgba(111,145,72,0.12)] transition-transform duration-200 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c766] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="absolute inset-2 rounded-full border border-[#f3ecd4]" aria-hidden="true" />
          <span
            className={cn(
              'relative flex h-28 w-28 items-center justify-center',
              !prefersReducedMotion && 'student-home-mascot__pet',
              isTapped && !prefersReducedMotion && 'student-home-mascot__pet--tapped',
            )}
            aria-hidden="true"
          >
            <SpmMascot variant={isTapped ? 'petTap' : 'petIdle'} size="lg" className="h-28 w-28" />
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute right-5 top-5 h-3 w-3 rounded-full bg-[#ffe8a7] shadow-[0_0_0_4px_rgba(255,225,124,0.18)]',
              !prefersReducedMotion && 'student-home-mascot__sparkle',
              isTapped && !prefersReducedMotion && 'student-home-mascot__sparkle--tapped',
            )}
          />
        </button>
      </div>

      <style jsx>{`
        .student-home-mascot__pet {
          transform-origin: 50% 82%;
          animation: student-home-bob 4.2s ease-in-out infinite;
        }

        .student-home-mascot__bubble {
          transform-origin: 24% 100%;
          animation: student-home-bubble 220ms ease-out;
        }

        .student-home-mascot__pet--tapped {
          animation: student-home-tap ${tapDurationMs}ms cubic-bezier(0.2, 0.85, 0.2, 1);
        }

        .student-home-mascot__bubble--tapped {
          animation: student-home-bubble-tap ${tapDurationMs}ms ease-out;
        }

        .student-home-mascot__sparkle {
          animation: student-home-sparkle 3.4s ease-in-out infinite;
        }

        .student-home-mascot__sparkle--tapped {
          animation: student-home-sparkle-tap ${tapDurationMs}ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .student-home-mascot__pet,
          .student-home-mascot__bubble,
          .student-home-mascot__pet--tapped,
          .student-home-mascot__bubble--tapped,
          .student-home-mascot__sparkle,
          .student-home-mascot__sparkle--tapped {
            animation: none !important;
            transition: none !important;
          }
        }

        @keyframes student-home-bob {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          35% {
            transform: translateY(-2px) rotate(-1deg);
          }
          70% {
            transform: translateY(1px) rotate(1deg);
          }
        }

        @keyframes student-home-tap {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          35% {
            transform: translateY(-4px) scale(1.03) rotate(-4deg);
          }
          70% {
            transform: translateY(2px) scale(0.99) rotate(2deg);
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes student-home-bubble {
          0% {
            opacity: 0;
            transform: translateY(4px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes student-home-bubble-tap {
          0% {
            transform: translateY(0) scale(1);
          }
          30% {
            transform: translateY(-3px) scale(1.02);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes student-home-sparkle {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.82;
          }
          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }

        @keyframes student-home-sparkle-tap {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          40% {
            transform: scale(1.35);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  )
}
