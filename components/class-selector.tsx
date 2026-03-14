'use client'

import { Check, ChevronDown, Plus } from 'lucide-react'
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
}

export function ClassSelector({ 
  classes, 
  selectedClass, 
  onSelect,
  onCreateNew 
}: ClassSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
          <span className="truncate">
            {selectedClass?.name || 'Select Class'}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {classes.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No classes yet
          </div>
        ) : (
          classes.map((classItem) => (
            <DropdownMenuItem
              key={classItem.id}
              onClick={() => onSelect(classItem)}
              className="gap-2"
            >
              <Check
                className={cn(
                  'h-4 w-4',
                  selectedClass?.id === classItem.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span className="truncate">{classItem.name}</span>
            </DropdownMenuItem>
          ))
        )}
        {onCreateNew && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Class
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
