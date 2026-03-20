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
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="flex h-[5.1rem] items-center gap-2 rounded-[2.2rem] border border-white/75 bg-white/94 px-2.5 py-2.5 shadow-[0_22px_42px_rgba(107,129,70,0.16)] backdrop-blur">
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
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.5rem] border px-2 py-2.5 text-[11px] font-bold leading-none transition-all duration-200',
                isActive
                  ? 'border-[#d8e9b7] bg-[linear-gradient(180deg,rgba(246,252,227,0.98)_0%,rgba(229,244,193,0.98)_100%)] text-[#34501f] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_24px_rgba(143,182,98,0.24)]'
                  : 'border-transparent text-[#7a8470] hover:border-[#ece8d9] hover:bg-[#faf8ee] hover:text-[#324223]'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200',
                  isActive
                    ? 'border-[#f5d985] bg-[#fff1b4] text-[#d79d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_8px_18px_rgba(220,177,70,0.24)]'
                    : 'border-transparent bg-[#f6f3ea] text-[#98a08d]'
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
