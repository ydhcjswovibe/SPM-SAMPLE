'use client'

import { useState } from 'react'
import { Check, ChevronDown, Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Class } from '@/lib/types'

interface ClassSelectorProps {
  classes: Class[]
  selectedClass: Class | null
  onSelect: (classItem: Class) => void
  onCreateNew?: () => void
  placeholder?: string
  emptyLabel?: string
  isDeleteMode?: boolean
  onToggleDeleteMode?: () => void
  onDeleteRequest?: (classItem: Class) => void
}

export function ClassSelector({ 
  classes, 
  selectedClass, 
  onSelect,
  onCreateNew,
  placeholder = '수업 선택',
  emptyLabel = '아직 등록된 수업이 없습니다.',
  isDeleteMode = false,
  onToggleDeleteMode,
  onDeleteRequest,
}: ClassSelectorProps) {
  const [open, setOpen] = useState(false)
  const canDelete = Boolean(onToggleDeleteMode && onDeleteRequest)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'min-w-[136px] justify-between gap-2 sm:min-w-[160px]',
            isDeleteMode && 'border-destructive/40 text-destructive hover:text-destructive',
          )}
        >
          <span className="truncate">
            {selectedClass?.name || (isDeleteMode ? '삭제할 수업 선택' : placeholder)}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {classes.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          classes.map((classItem) => (
            <DropdownMenuItem
              key={classItem.id}
              onClick={() => {
                if (isDeleteMode && onDeleteRequest) {
                  onDeleteRequest(classItem)
                } else {
                  onSelect(classItem)
                }
                setOpen(false)
              }}
              className={cn('gap-2', isDeleteMode && 'text-destructive focus:text-destructive')}
            >
              {isDeleteMode ? (
                <Minus className="h-4 w-4 opacity-100" />
              ) : (
                <Check
                  className={cn(
                    'h-4 w-4',
                    selectedClass?.id === classItem.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
              )}
              <span className="truncate">{classItem.name}</span>
            </DropdownMenuItem>
          ))
        )}
        {(onCreateNew || canDelete) && (
          <>
            <DropdownMenuSeparator />
            {onCreateNew ? (
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false)
                  onCreateNew()
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                새 수업 만들기
              </DropdownMenuItem>
            ) : null}
            {canDelete ? (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onToggleDeleteMode?.()
                }}
                className={cn('gap-2', isDeleteMode && 'text-destructive focus:text-destructive')}
              >
                <Trash2 className="h-4 w-4" />
                {isDeleteMode ? '삭제 취소' : '수업 삭제'}
              </DropdownMenuItem>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
