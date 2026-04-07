import { cn } from '@/lib/utils'

type SpmMascotVariant = 'base' | 'welcome' | 'petIdle' | 'petTap'
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
  const isPet = variant === 'petIdle' || variant === 'petTap'
  const isPetTap = variant === 'petTap'

  const wingFill = isPet ? '#f0b37d' : '#c8d8ef'
  const bodyFill = isPet ? '#f7cc95' : '#d7efc3'
  const bellyFill = isPet ? '#fff1e4' : '#f8f5ea'
  const highlightFill = isPet ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.78)'
  const eyeFill = '#37452a'
  const noseFill = isPet ? '#ff9656' : '#f6c85f'
  const cheekFill = isPet ? 'rgba(255,150,100,0.72)' : 'rgba(255,177,163,0.72)'
  const mouthStroke = isPet ? '#744121' : '#37452a'
  const shadowFill = isPet ? 'rgba(159,93,43,0.14)' : 'rgba(79,103,58,0.12)'
  const leftWingPath = isWelcome
    ? 'M19 58c6-8 15-11 23-9 3 1 6 3 8 5-5 2-9 5-13 10-4 4-6 8-8 13-7-4-12-11-10-19Z'
    : isPetTap
      ? 'M18 60c7-8 16-11 24-9 3 1 6 3 8 5-5 3-10 7-13 12-3 4-5 8-6 13-9-5-14-12-13-21Z'
      : isPet
        ? 'M19 60c6-7 15-10 23-8 3 1 6 3 8 5-5 2-9 6-12 10-4 4-6 8-8 12-8-4-13-11-11-19Z'
        : 'M21 61c6-7 14-10 22-8 3 1 6 3 8 5-4 2-8 5-12 9-4 4-6 8-7 12-8-3-13-10-11-18Z'
  const rightWingPath = isWelcome
    ? 'M101 58c-6-8-15-11-23-9-3 1-6 3-8 5 5 2 9 5 13 10 4 4 6 8 8 13 7-4 12-11 10-19Z'
    : isPetTap
      ? 'M102 60c-7-8-16-11-24-9-3 1-6 3-8 5 5 3 10 7 13 12 3 4 5 8 6 13 9-5 14-12 13-21Z'
      : isPet
        ? 'M101 60c-6-7-15-10-23-8-3 1-6 3-8 5 5 2 9 6 12 10 4 4 6 8 8 12 8-4 13-11 11-19Z'
        : 'M99 61c-6-7-14-10-22-8-3 1-6 3-8 5 4 2 8 5 12 9 4 4 6 8 7 12 8-3 13-10 11-18Z'
  const mouthPath = isWelcome
    ? 'M52 74c2 4 14 4 16 0'
    : isPetTap
      ? 'M51 74c3 5 15 5 18 0'
      : isPet
        ? 'M53 74c2 3 12 3 14 0'
        : 'M54 74c2 2 10 2 12 0'

  return (
    <div className={cn('relative shrink-0', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="h-full w-full drop-shadow-[0_16px_22px_rgba(111,150,74,0.16)]"
      >
        <ellipse cx="60" cy="105" rx="21" ry="6" fill={shadowFill} />

        <path d={leftWingPath} fill={wingFill} />
        <path d={rightWingPath} fill={wingFill} />

        <circle cx="60" cy="58" r="33" fill={bodyFill} />
        <ellipse cx="60" cy="68" rx="24" ry="26" fill={bellyFill} />
        <ellipse cx="50" cy="38" rx="8" ry="11" fill={highlightFill} transform="rotate(-32 50 38)" />

        {isPet ? (
          <>
            <path d="M56 21c2-5 6-8 10-8-1 4-1 7 1 10-4-2-8-2-11-2Z" fill="#f3c678" />
            <path d="M44 81c8 4 24 4 32 0" fill="none" stroke="#eb945f" strokeLinecap="round" strokeWidth="4" />
          </>
        ) : null}

        <circle cx="49" cy="55" r="4.6" fill={eyeFill} />
        <circle cx="71" cy="55" r="4.6" fill={eyeFill} />
        <circle cx="47.7" cy="53.4" r="1.2" fill="#ffffff" />
        <circle cx="69.7" cy="53.4" r="1.2" fill="#ffffff" />

        <path d="M55 63 60 68 65 63Z" fill={noseFill} />

        <path
          d={mouthPath}
          fill="none"
          stroke={mouthStroke}
          strokeLinecap="round"
          strokeWidth="3.3"
        />

        <ellipse cx="42" cy="68" rx="6" ry="4" fill={cheekFill} />
        <ellipse cx="78" cy="68" rx="6" ry="4" fill={cheekFill} />

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
