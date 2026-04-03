'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { getCurrentYearMonth } from '@/lib/admin/matrix'
import { adminDropdownContentClass, adminDropdownItemClass, adminToolbarMonthInputClass } from '@/lib/admin/surface'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdminMonthSelectorProps {
  value: string
  onValueChange: (value: string) => void
  ariaLabel?: string
  className?: string
}

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function shiftYearMonth(yearMonth: string, delta: number) {
  const [year, month] = yearMonth.split('-').map(Number)
  if (!year || !month) return yearMonth

  const date = new Date(year, month - 1 + delta, 1)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${nextYear}-${nextMonth}`
}

function formatCompactKoreanYearMonth(value: string) {
  const [year, month] = value.split('-')
  if (!year || !month) return value

  return `${year.slice(-2)}년 ${Number(month)}월`
}

function buildMonthOptions(currentYearMonth: string, selectedYearMonth: string) {
  const options = new Set<string>()

  for (let delta = 3; delta >= -12; delta -= 1) {
    options.add(shiftYearMonth(currentYearMonth, delta))
  }

  if (selectedYearMonth) {
    options.add(selectedYearMonth)
  }

  return Array.from(options).sort((left, right) => right.localeCompare(left))
}

function getDisplayYear(value: string) {
  const [year] = value.split('-').map(Number)
  return year || Number(getCurrentYearMonth().split('-')[0])
}

function formatYearMonth(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function AdminMonthSelector({
  value,
  onValueChange,
  ariaLabel = '운영 월 선택',
  className,
}: AdminMonthSelectorProps) {
  const options = useMemo(
    () => buildMonthOptions(getCurrentYearMonth(), value),
    [value],
  )
  const optionSet = useMemo(() => new Set(options), [options])
  const years = useMemo(
    () => Array.from(new Set(options.map((option) => Number(option.slice(0, 4))))).sort((left, right) => right - left),
    [options],
  )
  const [isOpen, setIsOpen] = useState(false)
  const [displayYear, setDisplayYear] = useState(() => getDisplayYear(value))
  const selectedYear = getDisplayYear(value)
  const yearIndex = years.indexOf(displayYear)
  const canGoNext = yearIndex > 0
  const canGoPrev = yearIndex >= 0 && yearIndex < years.length - 1

  return (
    <>
      <div className="md:hidden">
        <Popover
          open={isOpen}
          onOpenChange={(nextOpen) => {
            setIsOpen(nextOpen)
            if (nextOpen) {
              setDisplayYear(selectedYear)
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="surface"
              aria-label={ariaLabel}
              className={cn(
                adminToolbarMonthInputClass,
                'justify-center gap-1.5 px-2.5 text-[13px] font-semibold',
                className,
              )}
            >
              <span className="truncate">{formatCompactKoreanYearMonth(value)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className={cn(
              adminDropdownContentClass,
              'w-[min(18.25rem,calc(100vw-1.5rem))] p-3 shadow-[0_20px_36px_rgba(111,145,72,0.14)]',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (canGoPrev) {
                    setDisplayYear(years[yearIndex + 1] ?? displayYear)
                  }
                }}
                disabled={!canGoPrev}
                className="flex h-8 w-8 items-center justify-center rounded-[0.95rem] border border-[#e1e8d4] bg-white text-[#647456] shadow-[0_6px_12px_rgba(121,148,84,0.08)] transition-colors disabled:opacity-40"
                aria-label="이전 연도"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="rounded-full border border-[#e1e8d4] bg-white px-3 py-1 text-sm font-semibold text-[#314127] shadow-[0_6px_12px_rgba(121,148,84,0.06)]">
                {displayYear}년
              </div>
              <button
                type="button"
                onClick={() => {
                  if (canGoNext) {
                    setDisplayYear(years[yearIndex - 1] ?? displayYear)
                  }
                }}
                disabled={!canGoNext}
                className="flex h-8 w-8 items-center justify-center rounded-[0.95rem] border border-[#e1e8d4] bg-white text-[#647456] shadow-[0_6px_12px_rgba(121,148,84,0.08)] transition-colors disabled:opacity-40"
                aria-label="다음 연도"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {MONTH_LABELS.map((label, monthIndex) => {
                const option = formatYearMonth(displayYear, monthIndex)
                const isEnabled = optionSet.has(option)
                const isSelected = option === value
                const isCurrentMonth = option === getCurrentYearMonth()

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!isEnabled}
                    onClick={() => {
                      if (!isEnabled) {
                        return
                      }

                      onValueChange(option)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'relative flex h-12 items-center justify-center rounded-[1rem] border text-sm font-semibold transition-all [-webkit-tap-highlight-color:transparent] touch-manipulation',
                      isSelected
                        ? 'border-[#d8e9b7] bg-muted text-[#34501f] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_18px_rgba(143,182,98,0.14)]'
                        : isEnabled
                          ? 'border-[#e1e8d4] bg-white text-[#526244] shadow-[0_8px_14px_rgba(121,148,84,0.06)]'
                          : 'border-[#edf1e6] bg-[#f9fbf5] text-[#a3ae95]',
                    )}
                  >
                    {label}
                    {isCurrentMonth && !isSelected ? (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#9dc469]" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="hidden md:block">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            aria-label={ariaLabel}
            className={cn(
              adminToolbarMonthInputClass,
              'justify-center gap-1.5 px-2.5 md:px-3 [&>span]:truncate',
              className,
            )}
          >
            <SelectValue placeholder="월" />
          </SelectTrigger>
          <SelectContent align="end" className={cn('max-h-80', adminDropdownContentClass)}>
            {options.map((option) => (
              <SelectItem key={option} value={option} className={adminDropdownItemClass}>
                {formatCompactKoreanYearMonth(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
