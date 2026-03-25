'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SpmMascot } from '@/components/spm-mascot'
import { adminPrimaryNavItems, isAdminNavItemActive } from '@/lib/admin/navigation'
import { adminSidebarIconClass, adminSidebarItemClass } from '@/lib/admin/surface'

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block">
      <div className="sticky top-0 h-dvh px-3 py-4 lg:px-4 lg:py-5">
        <div className="flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-[#d7e4c9] bg-[linear-gradient(180deg,rgba(248,252,255,0.98)_0%,rgba(255,253,247,0.98)_44%,rgba(245,250,236,0.98)_100%)] px-3 py-3.5 shadow-[0_18px_32px_rgba(107,129,70,0.11)] lg:rounded-[2rem] lg:px-3.5 lg:py-4 lg:shadow-[0_22px_40px_rgba(107,129,70,0.12)]">
          <div className="mb-5 flex items-center gap-2.5 rounded-[1.35rem] border border-[#e7edde] bg-white/96 px-2.5 py-2.5 shadow-[0_8px_16px_rgba(111,145,72,0.06)] lg:mb-6 lg:rounded-[1.45rem] lg:px-3 lg:py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#e7edde] bg-white shadow-[0_8px_16px_rgba(111,145,72,0.08)] lg:h-11 lg:w-11 lg:rounded-[1.05rem]">
              <SpmMascot size="sm" className="h-6 w-6 lg:h-7 lg:w-7" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#314127]">SPM 운영</div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2">
              {adminPrimaryNavItems.map((item) => {
                const isActive = isAdminNavItemActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link href={item.href} className={adminSidebarItemClass(item.tone, isActive)}>
                      <span className={adminSidebarIconClass(item.tone, isActive)}>
                        <Icon className="h-4 w-4 lg:h-4.5 lg:w-4.5" />
                      </span>
                      <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  )
}
