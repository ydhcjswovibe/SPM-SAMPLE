'use client'

import Link from 'next/link'
import { Home, LogOut, Settings } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  adminCompactButtonClass,
  adminCompactDangerButtonClass,
} from '@/lib/admin/surface'
import { cn } from '@/lib/utils'

interface AdminDesktopUtilityTrayProps {
  className?: string
}

export function AdminDesktopUtilityTray({ className }: AdminDesktopUtilityTrayProps) {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()

    if (typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        asChild
        variant="ghost"
        size="sm"
        aria-label="설정"
        title="설정"
        className={adminCompactButtonClass}
      >
        <Link href="/admin/settings">
          <Settings className="h-4 w-4" />
          <span className="hidden xl:inline">설정</span>
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        size="sm"
        aria-label="처음으로"
        title="처음으로"
        className={adminCompactButtonClass}
      >
        <Link href="/">
          <Home className="h-4 w-4" />
          <span className="hidden xl:inline">처음으로</span>
        </Link>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="로그아웃"
        title="로그아웃"
        onClick={() => void handleSignOut()}
        className={cn(adminCompactDangerButtonClass, 'hover:text-[#b65046]')}
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden xl:inline">로그아웃</span>
      </Button>
    </div>
  )
}
