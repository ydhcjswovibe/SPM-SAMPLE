'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Home, LogOut, Menu, Settings } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminDropdownContentClass, adminDropdownItemClass, adminMobileHeaderIconButtonClass } from '@/lib/admin/surface'

interface AdminMobileUtilityMenuProps {
  actionItems?: ReactNode
  className?: string
}

export function AdminMobileUtilityMenu({ actionItems, className }: AdminMobileUtilityMenuProps = {}) {
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()

    if (typeof window !== 'undefined') {
      window.location.assign('/auth/login')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            adminMobileHeaderIconButtonClass,
            'md:hidden',
            className,
          )}
          aria-label="관리자 메뉴 열기"
          title="메뉴"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn('w-48 md:hidden', adminDropdownContentClass)}>
        {actionItems ? (
          <>
            {actionItems}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild className={adminDropdownItemClass}>
          <Link href="/admin/settings" className="gap-2">
            <Settings className="h-4 w-4" />
            설정
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={adminDropdownItemClass}>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            처음으로
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleSignOut()} className={cn(adminDropdownItemClass, 'text-destructive')}>
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
