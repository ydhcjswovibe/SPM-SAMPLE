'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { adminCompactIconButtonClass, adminDropdownContentClass, adminSurfaceInputClass } from '@/lib/admin/surface'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface AdminClassNameFieldProps {
  value: string
  onChange: (nextValue: string) => void
  suggestions: string[]
  disabled?: boolean
}

export function AdminClassNameField({
  value,
  onChange,
  suggestions,
  disabled = false,
}: AdminClassNameFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filteredSuggestions = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('ko')

    if (!keyword) {
      return suggestions
    }

    return suggestions.filter((name) => name.toLocaleLowerCase('ko').includes(keyword))
  }, [query, suggestions])

  return (
    <div className="flex items-center gap-2">
      <Input
        id="className"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="예: 2026년 3월 기초반"
        className={cn(adminSurfaceInputClass, 'flex-1')}
        disabled={disabled}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="surface"
            className={cn(adminCompactIconButtonClass, 'shrink-0')}
            aria-label="기존 수업명 목록 열기"
            disabled={disabled || suggestions.length === 0}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(adminDropdownContentClass, 'w-[min(24rem,calc(100vw-4rem))] p-0')} align="end">
          <Command className="bg-transparent">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="기존 수업명 검색"
              className="text-sm"
            />
            <CommandList>
              <CommandEmpty>기존 수업명이 없습니다.</CommandEmpty>
              <CommandGroup heading="기존 수업명">
                {filteredSuggestions.map((name) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => {
                      onChange(name)
                      setIsOpen(false)
                      setQuery('')
                    }}
                    className="rounded-xl px-3 py-2.5"
                  >
                    <Check className={cn('h-4 w-4', value === name ? 'opacity-100' : 'opacity-0')} />
                    <span className="truncate">{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
