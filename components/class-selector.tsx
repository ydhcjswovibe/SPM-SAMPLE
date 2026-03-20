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
  showDeleteActionInMenu?: boolean
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
  showDeleteActionInMenu = true,
}: ClassSelectorProps) {
  const [open, setOpen] = useState(false)
  const canDelete = Boolean(showDeleteActionInMenu && onToggleDeleteMode && onDeleteRequest)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'min-w-[148px] justify-between gap-2 rounded-[1.25rem] border-[#dce8cc] bg-white/94 px-3 text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] hover:bg-[#fbfdf6] sm:min-w-[176px]',
            isDeleteMode && 'border-destructive/40 text-destructive hover:text-destructive',
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
        className="w-[220px] rounded-[1.25rem] border-[#dfe8d2] bg-white/96 p-1.5 shadow-[0_18px_32px_rgba(111,145,72,0.12)]"
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
                'gap-2 rounded-[0.95rem] px-2.5 py-2 text-[#314127]',
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
                className="gap-2 rounded-[0.95rem] px-2.5 py-2 text-[#314127]"
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
                  'gap-2 rounded-[0.95rem] px-2.5 py-2 text-[#314127]',
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
