'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import {
  SCHEDULE_HOUR_OPTIONS,
  SCHEDULE_MINUTE_OPTIONS,
  buildTimeValue,
  splitTimeValue,
} from '@/lib/class-schedule'
import { cn } from '@/lib/utils'
import {
  adminDropdownContentClass,
  adminDropdownItemClass,
  adminSurfaceInputClass,
} from '@/lib/admin/surface'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const EMPTY_TIME_SENTINEL = '__empty__'

function scrollCheckedItemIntoCenter(contentKey: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const content = document.querySelector(`[data-time-select-content="${contentKey}"]`)
      const selectedItem = content?.querySelector('[data-state="checked"]')

      if (selectedItem instanceof HTMLElement) {
        selectedItem.scrollIntoView({
          block: 'center',
          inline: 'nearest',
        })
      }
    })
  })
}

interface AdminScheduleTimeFieldProps {
  idPrefix: string
  value: string
  onChange: (nextValue: string) => void
  disabled?: boolean
  allowEmpty?: boolean
  className?: string
}

export function AdminScheduleTimeField({
  idPrefix,
  value,
  onChange,
  disabled = false,
  allowEmpty = false,
  className,
}: AdminScheduleTimeFieldProps) {
  const { hour, minute } = splitTimeValue(value)
  const hasValue = hour.length > 0
  const hourSelectId = `${idPrefix}-hour`
  const minuteSelectId = `${idPrefix}-minute`
  const hourContentKey = `${hourSelectId}-content`
  const minuteContentKey = `${minuteSelectId}-content`
  const resolvedMinute = hasValue ? minute : SCHEDULE_MINUTE_OPTIONS[0]
  const [isHourOpen, setIsHourOpen] = useState(false)
  const [isMinuteOpen, setIsMinuteOpen] = useState(false)

  useEffect(() => {
    if (isHourOpen) {
      scrollCheckedItemIntoCenter(hourContentKey)
    }
  }, [hourContentKey, hour, isHourOpen])

  useEffect(() => {
    if (isMinuteOpen) {
      scrollCheckedItemIntoCenter(minuteContentKey)
    }
  }, [isMinuteOpen, minuteContentKey, resolvedMinute])

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <div className="flex min-w-0 flex-nowrap items-center gap-1.5">
        <Select
          open={isHourOpen}
          onOpenChange={setIsHourOpen}
          value={allowEmpty && !hasValue ? EMPTY_TIME_SENTINEL : hour}
          onValueChange={(nextHour) => {
            if (nextHour === EMPTY_TIME_SENTINEL && allowEmpty) {
              onChange('')
              return
            }

            onChange(buildTimeValue(nextHour, resolvedMinute))
          }}
          disabled={disabled}
        >
          <SelectTrigger
            id={hourSelectId}
            aria-label="시간"
            className={cn(
              adminSurfaceInputClass,
              'h-11 w-[4.9rem] min-w-[4.9rem] rounded-2xl px-3 text-sm font-semibold [&>span]:truncate',
            )}
          >
            <SelectValue placeholder="시간" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            sideOffset={4}
            data-time-select-content={hourContentKey}
            className={cn(adminDropdownContentClass, 'min-w-[4.9rem] w-[4.9rem] p-1')}
            style={{ maxHeight: '17.5rem' }}
          >
            {allowEmpty ? (
              <SelectItem value={EMPTY_TIME_SENTINEL} className={cn(adminDropdownItemClass, 'px-3 py-1.5')}>
                미정
              </SelectItem>
            ) : null}
            {SCHEDULE_HOUR_OPTIONS.map((hourOption) => (
              <SelectItem
                key={hourOption}
                value={hourOption}
                className={cn(adminDropdownItemClass, 'px-3 py-1.5')}
              >
                {hourOption}시
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm font-semibold text-[#6b7d5e]">:</span>
        <Select
          open={isMinuteOpen}
          onOpenChange={setIsMinuteOpen}
          value={resolvedMinute}
          onValueChange={(nextMinute) => {
            if (!hasValue && allowEmpty) {
              return
            }

            const nextHour = hasValue ? hour : SCHEDULE_HOUR_OPTIONS[0]
            onChange(buildTimeValue(nextHour, nextMinute))
          }}
          disabled={disabled || (!hasValue && allowEmpty)}
        >
          <SelectTrigger
            id={minuteSelectId}
            aria-label="분"
            className={cn(
              adminSurfaceInputClass,
              'h-11 w-[4.45rem] min-w-[4.45rem] rounded-2xl px-3 text-sm font-semibold [&>span]:truncate',
            )}
          >
            <SelectValue placeholder="분" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            sideOffset={4}
            data-time-select-content={minuteContentKey}
            className={cn(adminDropdownContentClass, 'min-w-[4.45rem] w-[4.45rem] p-1')}
            style={{ maxHeight: '5.75rem' }}
          >
            {SCHEDULE_MINUTE_OPTIONS.map((minuteOption) => (
              <SelectItem
                key={minuteOption}
                value={minuteOption}
                className={cn(adminDropdownItemClass, 'px-3 py-1.5')}
              >
                {minuteOption}분
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {allowEmpty ? (
        <Button
          type="button"
          variant="surface"
          onClick={() => onChange('')}
          disabled={disabled || !hasValue}
          aria-label="비우기"
          title="비우기"
          className="h-11 w-11 shrink-0 rounded-2xl border border-[#dce8cc] bg-white px-0 text-[#647456] shadow-[0_8px_14px_rgba(121,148,84,0.08)]"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
