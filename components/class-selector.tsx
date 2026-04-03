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
import {
  adminDropdownContentClass,
  adminDropdownItemClass,
  adminToolbarControlClass,
} from '@/lib/admin/surface'
import { cn } from '@/lib/utils'
import type { Class } from '@/lib/types'

interface ClassSelectorProps {
  classes: Class[]
  selectedClass: Class | null
  onSelect: (classItem: Class) => void
  ariaLabel?: string
  triggerClassName?: string
  onCreateNew?: () => void
  placeholder?: string
  emptyLabel?: string
  isDeleteMode?: boolean
  onToggleDeleteMode?: () => void
  onDeleteRequest?: (classItem: Class) => void
  showDeleteActionInMenu?: boolean
}

export function ClassSelector({ 
  classes, 
  selectedClass, 
  onSelect,
  ariaLabel,
  triggerClassName,
  onCreateNew,
  placeholder = '수업 선택',
  emptyLabel = '아직 등록된 수업이 없습니다.',
  isDeleteMode = false,
  onToggleDeleteMode,
  onDeleteRequest,
  showDeleteActionInMenu = true,
}: ClassSelectorProps) {
  const [open, setOpen] = useState(false)
  const canDelete = Boolean(showDeleteActionInMenu && onToggleDeleteMode && onDeleteRequest)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="surface"
          aria-label={ariaLabel}
          className={cn(
            adminToolbarControlClass,
            'w-auto min-w-[9.75rem] max-w-[12.5rem] justify-between gap-2 rounded-2xl px-3 sm:min-w-[10.75rem] sm:max-w-[13.5rem] lg:min-w-[11rem] lg:max-w-[14.5rem] xl:max-w-[15.5rem]',
            triggerClassName,
            isDeleteMode && 'border-[#f0d4cf] bg-[#fff5f1] text-[#b65046] hover:bg-[#ffede7] hover:text-[#b65046]',
          )}
        >
          <span className="truncate">
            {isDeleteMode ? '삭제할 수업 선택' : selectedClass?.name || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn('w-[220px]', adminDropdownContentClass)}
      >
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
              className={cn(
                adminDropdownItemClass,
                isDeleteMode && 'text-destructive focus:text-destructive',
              )}
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
                className={adminDropdownItemClass}
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
                className={cn(
                  adminDropdownItemClass,
                  isDeleteMode && 'text-destructive focus:text-destructive',
                )}
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
