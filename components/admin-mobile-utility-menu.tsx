'use client'

import Link from 'next/link'
import { Home, LogOut, Settings } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminMobileUtilityMenu({ className }: { className?: string } = {}) {
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
            'h-11 w-11 rounded-[1.15rem] border border-white/72 bg-white/82 shadow-[0_8px_14px_rgba(121,148,84,0.1)] md:hidden',
            className,
          )}
          aria-label="관리자 메뉴 열기"
        >
          <Avatar className="h-9 w-9 border border-white/70">
            <AvatarFallback className="bg-[#fff6db] text-xs font-semibold text-[#866a2d]">
              운
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 md:hidden">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">운영 메뉴</p>
          <p className="text-xs text-muted-foreground">관리자</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="gap-2">
            <Settings className="h-4 w-4" />
            설정
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            처음으로
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleSignOut()} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
