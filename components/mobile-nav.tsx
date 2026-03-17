'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutGrid, Users, BookOpen } from 'lucide-react'

const navItems = [
  { href: '/admin', label: '운영', icon: LayoutGrid },
  { href: '/admin/students', label: '학생', icon: Users },
  { href: '/admin/content', label: '수업', icon: BookOpen },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 md:hidden">
      <div className="spm-soft-panel flex h-[4.5rem] items-center gap-1 px-2 pb-safe pt-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-2 text-[11px] font-bold leading-none transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shadow)]'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  isActive ? 'bg-white/18' : 'bg-white/80'
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
