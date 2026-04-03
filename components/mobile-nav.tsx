'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { adminPrimaryNavItems, isAdminNavItemActive } from '@/lib/admin/navigation'
import { adminBottomNavIconClass, adminBottomNavItemClass } from '@/lib/admin/surface'

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="mx-auto flex h-[4rem] max-w-[24rem] items-center gap-1.5 rounded-2xl border border-[#dce8cc] bg-white px-1.5 py-1.5 shadow-[0_18px_34px_rgba(107,129,70,0.16)]">
        {adminPrimaryNavItems.map((item) => {
          const isActive = isAdminNavItemActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={adminBottomNavItemClass(item.tone, isActive)}
            >
              <div className={adminBottomNavIconClass(item.tone, isActive)}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
