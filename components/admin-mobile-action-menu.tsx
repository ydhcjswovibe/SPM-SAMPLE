'use client'

import type { ReactNode } from 'react'
import { Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  adminDropdownContentClass,
  adminMobileHeaderIconButtonClass,
} from '@/lib/admin/surface'
import { cn } from '@/lib/utils'

interface AdminMobileActionMenuProps {
  children: ReactNode
  label?: string
  className?: string
  contentClassName?: string
}

export function AdminMobileActionMenu({
  children,
  label = '현재 탭 작업',
  className,
  contentClassName,
}: AdminMobileActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          title={label}
          className={cn(adminMobileHeaderIconButtonClass, 'md:hidden', className)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn('w-48 md:hidden', adminDropdownContentClass, contentClassName)}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
