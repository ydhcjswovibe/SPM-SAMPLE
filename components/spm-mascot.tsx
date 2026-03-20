import { cn } from '@/lib/utils'

type SpmMascotVariant = 'base' | 'welcome'
type SpmMascotSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<SpmMascotSize, string> = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
}

interface SpmMascotProps {
  className?: string
  variant?: SpmMascotVariant
  size?: SpmMascotSize
}

export function SpmMascot({
  className,
  variant = 'base',
  size = 'md',
}: SpmMascotProps) {
  const isWelcome = variant === 'welcome'

  return (
    <div className={cn('relative shrink-0', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="h-full w-full drop-shadow-[0_16px_22px_rgba(111,150,74,0.16)]"
      >
        <ellipse cx="60" cy="105" rx="21" ry="6" fill="rgba(79,103,58,0.12)" />

        <path
          d={isWelcome ? 'M19 58c6-8 15-11 23-9 3 1 6 3 8 5-5 2-9 5-13 10-4 4-6 8-8 13-7-4-12-11-10-19Z' : 'M21 61c6-7 14-10 22-8 3 1 6 3 8 5-4 2-8 5-12 9-4 4-6 8-7 12-8-3-13-10-11-18Z'}
          fill="#c8d8ef"
        />
        <path
          d={isWelcome ? 'M101 58c-6-8-15-11-23-9-3 1-6 3-8 5 5 2 9 5 13 10 4 4 6 8 8 13 7-4 12-11 10-19Z' : 'M99 61c-6-7-14-10-22-8-3 1-6 3-8 5 4 2 8 5 12 9 4 4 6 8 7 12 8-3 13-10 11-18Z'}
          fill="#c8d8ef"
        />

        <circle cx="60" cy="58" r="33" fill="#d7efc3" />
        <ellipse cx="60" cy="68" rx="24" ry="26" fill="#f8f5ea" />
        <ellipse cx="50" cy="38" rx="8" ry="11" fill="rgba(255,255,255,0.78)" transform="rotate(-32 50 38)" />

        <circle cx="49" cy="55" r="4.6" fill="#37452a" />
        <circle cx="71" cy="55" r="4.6" fill="#37452a" />
        <circle cx="47.7" cy="53.4" r="1.2" fill="#ffffff" />
        <circle cx="69.7" cy="53.4" r="1.2" fill="#ffffff" />

        <path d="M55 63 60 68 65 63Z" fill="#f6c85f" />

        <path
          d={isWelcome ? 'M52 74c2 4 14 4 16 0' : 'M54 74c2 2 10 2 12 0'}
          fill="none"
          stroke="#37452a"
          strokeLinecap="round"
          strokeWidth="3.3"
        />

        <ellipse cx="42" cy="68" rx="6" ry="4" fill="rgba(255,177,163,0.72)" />
        <ellipse cx="78" cy="68" rx="6" ry="4" fill="rgba(255,177,163,0.72)" />

        <path d="M47 90c-2 4-3 8-3 12" fill="none" stroke="#c89465" strokeLinecap="round" strokeWidth="4" />
        <path d="M73 90c2 4 3 8 3 12" fill="none" stroke="#c89465" strokeLinecap="round" strokeWidth="4" />
        <path d="M41 101h7" fill="none" stroke="#c89465" strokeLinecap="round" strokeWidth="3.6" />
        <path d="M72 101h7" fill="none" stroke="#c89465" strokeLinecap="round" strokeWidth="3.6" />

        {isWelcome ? (
          <>
            <circle cx="91" cy="27" r="6" fill="#ffe17c" />
            <path d="M91 18v18M82 27h18" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="2.8" />
          </>
        ) : null}
      </svg>
    </div>
  )
}
