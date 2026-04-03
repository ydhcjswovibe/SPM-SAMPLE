'use client'

import type { ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { adminCompactButtonClass, adminDropdownContentClass } from '@/lib/admin/surface'
import { cn } from '@/lib/utils'

interface AdminHeaderActionMenuProps {
  label?: string
  children: ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function AdminHeaderActionMenu({
  label = '작업',
  children,
  className,
  triggerClassName,
  contentClassName,
}: AdminHeaderActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${label} 메뉴`}
          title={label}
          className={cn(adminCompactButtonClass, triggerClassName)}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden xl:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-52',
          adminDropdownContentClass,
          className,
          contentClassName,
        )}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
