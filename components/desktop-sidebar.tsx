'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SpmMascot } from '@/components/spm-mascot'
import { adminPrimaryNavItems, isAdminNavItemActive } from '@/lib/admin/navigation'
import {
  adminDesktopSidebarBrandClass,
  adminDesktopSidebarPanelClass,
  adminSidebarIconClass,
  adminSidebarItemClass,
} from '@/lib/admin/surface'

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block md:w-[16rem] md:shrink-0 lg:w-[17rem]" aria-label="운영 데스크톱 사이드바">
      <div className="md:fixed md:inset-y-0 md:left-0 md:z-30 md:w-[16rem] lg:w-[17rem]">
        <div className="flex h-full flex-col px-2.5 pt-4 pb-4 lg:px-3 lg:pt-5 lg:pb-5">
          <div className={adminDesktopSidebarBrandClass}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#e7edde] bg-white shadow-[0_8px_16px_rgba(111,145,72,0.08)] lg:h-11 lg:w-11 lg:rounded-[1.05rem]">
                <SpmMascot size="sm" className="h-6 w-6 lg:h-7 lg:w-7" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8b69]">운영 셸</div>
                <div className="mt-1 truncate text-[1.02rem] font-semibold text-[#314127]">SPM 운영</div>
              </div>
            </div>
          </div>

          <div className={`${adminDesktopSidebarPanelClass} mt-2.5`}>
            <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8b69]">
              이동
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto pr-0.5">
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
      </div>
    </aside>
  )
}
