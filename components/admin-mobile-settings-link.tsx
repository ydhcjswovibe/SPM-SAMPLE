'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AdminMobileSettingsLink({ className }: { className?: string }) {
  return (
    <Button asChild variant="ghost" size="icon" className={cn('h-9 w-9 shrink-0 md:hidden', className)}>
      <Link href="/admin/settings" aria-label="설정 열기" title="설정">
        <Settings className="h-4 w-4" />
      </Link>
    </Button>
  )
}
