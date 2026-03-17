import { cn } from '@/lib/utils'

type SpmMascotVariant = 'base' | 'welcome'
type SpmMascotSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<SpmMascotSize, string> = {
  sm: 'h-20 w-20',
  md: 'h-28 w-28',
  lg: 'h-40 w-40',
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
  return (
    <div className={cn('relative shrink-0', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="h-full w-full drop-shadow-[0_8px_0_var(--card-shadow)]"
      >
        <g>
          <path
            d="M80 12C61 12 44 31 44 57c0 13 4 22 9 30 7 12 13 23 15 35 1 8 5 14 12 18 12 8 28 8 40 0 7-4 11-10 12-18 2-12 8-23 15-35 5-8 9-17 9-30 0-26-17-45-36-45h-40Z"
            fill="var(--primary)"
            stroke="var(--primary-shadow)"
            strokeWidth="5"
          />
          <path
            d="M70 30c-11 4-21 16-21 31 0 8 3 15 7 22 5 8 10 16 12 24"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeLinecap="round"
            strokeWidth="9"
          />
          <ellipse cx="80" cy="118" rx="31" ry="18" fill="var(--primary-soft)" />
          <circle cx="63" cy="69" r="8" fill="#24313d" />
          <circle cx="99" cy="69" r="8" fill="#24313d" />
          <circle cx="61" cy="66.5" r="2.2" fill="#ffffff" />
          <circle cx="97" cy="66.5" r="2.2" fill="#ffffff" />
          {variant === 'welcome' ? (
            <path
              d="M66 93c7 8 21 8 28 0"
              fill="none"
              stroke="#24313d"
              strokeLinecap="round"
              strokeWidth="6"
            />
          ) : (
            <path
              d="M69 94c4 3 18 3 22 0"
              fill="none"
              stroke="#24313d"
              strokeLinecap="round"
              strokeWidth="5"
            />
          )}
          <path
            d="M50 93c-9 1-16 10-16 20"
            fill="none"
            stroke="#24313d"
            strokeLinecap="round"
            strokeWidth="6"
          />
          <path
            d="M111 93c10 0 18 8 18 18"
            fill="none"
            stroke="#24313d"
            strokeLinecap="round"
            strokeWidth="6"
          />
          {variant === 'welcome' ? (
            <path
              d="M30 92c0-11 8-21 19-23"
              fill="none"
              stroke="#24313d"
              strokeLinecap="round"
              strokeWidth="6"
            />
          ) : null}
          {variant === 'welcome' ? (
            <circle cx="31" cy="89" r="8" fill="var(--accent)" stroke="#d4af2e" strokeWidth="3" />
          ) : null}
          <path
            d="M64 141c0 7-6 13-13 13"
            fill="none"
            stroke="#24313d"
            strokeLinecap="round"
            strokeWidth="6"
          />
          <path
            d="M97 141c0 7 6 13 13 13"
            fill="none"
            stroke="#24313d"
            strokeLinecap="round"
            strokeWidth="6"
          />
        </g>
      </svg>
      <span className="absolute left-2 top-3 h-3 w-3 rounded-full bg-[var(--accent)] shadow-[0_2px_0_#d8af2a]" />
      <span className="absolute right-2 top-6 h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)] shadow-[0_2px_0_var(--brand-blue-shadow)]" />
    </div>
  )
}
