'use client'

import type { ReactNode } from 'react'

import { AdminDesktopUtilityTray } from '@/components/admin-desktop-utility-tray'
import { AdminMobileUtilityMenu } from '@/components/admin-mobile-utility-menu'
import { SpmMascot } from '@/components/spm-mascot'
import { adminToolbarSurfaceClass } from '@/lib/admin/surface'
import { cn } from '@/lib/utils'

interface AdminShellHeaderProps {
  summaryChips?: ReactNode
  controls?: ReactNode
  mobileActionMenu?: ReactNode
  desktopLead?: ReactNode
  desktopSecondaryActions?: ReactNode
  desktopUtilityTray?: ReactNode
  className?: string
  controlsClassName?: string
}

export function AdminShellHeader({
  summaryChips,
  controls,
  mobileActionMenu,
  desktopLead,
  desktopSecondaryActions,
  desktopUtilityTray,
  className,
  controlsClassName,
}: AdminShellHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4 lg:px-7 lg:pt-5', className)}>
      <div className="relative md:hidden">
        <div className="pointer-events-none absolute inset-x-2 bottom-[-0.25rem] top-[0.55rem] rounded-[2rem] border border-[#c9d7b8]/85 bg-[linear-gradient(180deg,rgba(223,236,198,0.92)_0%,rgba(204,221,172,0.86)_100%)] shadow-[0_18px_32px_rgba(91,121,47,0.16)]" />
        <section className="relative overflow-hidden rounded-[1.95rem] border border-[#d7e3c8] bg-[linear-gradient(180deg,rgba(248,252,255,0.98)_0%,rgba(255,253,247,0.99)_46%,rgba(245,250,236,0.98)_100%)] px-2 py-2 shadow-[0_18px_32px_rgba(96,129,51,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="pointer-events-none absolute -right-3 top-2 h-20 w-20 rounded-full bg-[rgba(255,223,144,0.22)] blur-2xl" />
          <div className="pointer-events-none absolute -left-4 bottom-2 h-16 w-20 rounded-full bg-[rgba(177,214,112,0.16)] blur-2xl" />

          <div className="relative z-10 flex items-center gap-1.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.95rem] bg-white shadow-[0_8px_14px_rgba(116,146,78,0.1)]">
              <SpmMascot size="sm" className="h-6 w-6" />
            </div>

            {controls ? (
              <div className={cn('flex min-w-0 flex-1 items-center gap-1.5', controlsClassName)}>
                {controls}
              </div>
            ) : null}

            <div className="shrink-0">
              <AdminMobileUtilityMenu actionItems={mobileActionMenu} />
            </div>
          </div>

          {summaryChips ? (
            <div className="relative z-10 mt-2 flex flex-wrap items-center gap-2">
              {summaryChips}
            </div>
          ) : null}
        </section>
      </div>

      <div className="hidden md:block">
        <div className={adminToolbarSurfaceClass}>
          <div className="flex min-h-[4.4rem] items-center gap-3 lg:min-h-[4.6rem]">
            {desktopLead ? <div className="min-w-0 shrink-0">{desktopLead}</div> : null}
            {desktopLead && controls ? <div className="h-10 w-px shrink-0 bg-[#e1e8d4]" /> : null}
            <div className="min-w-0 flex flex-1 items-center gap-3">
              {controls ? (
                <div className={cn('flex min-w-0 flex-1 items-center gap-2.5', controlsClassName)}>
                  {controls}
                </div>
              ) : <div className="flex-1" />}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {desktopSecondaryActions ? <div className="shrink-0">{desktopSecondaryActions}</div> : null}
              <div className="shrink-0">{desktopUtilityTray ?? <AdminDesktopUtilityTray />}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
