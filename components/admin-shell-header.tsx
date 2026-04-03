'use client'

import type { ReactNode } from 'react'

import { AdminDesktopUtilityTray } from '@/components/admin-desktop-utility-tray'
import { AdminMobileUtilityMenu } from '@/components/admin-mobile-utility-menu'
import { SpmMascot } from '@/components/spm-mascot'
import {
  adminMobileHeaderBackdropClass,
  adminMobileHeaderBadgeClass,
  adminMobileHeaderShellClass,
  adminToolbarSurfaceClass,
} from '@/lib/admin/surface'
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
      <div className="relative mx-auto max-w-[24rem] md:hidden">
        <div className={adminMobileHeaderBackdropClass} />
        <section className={adminMobileHeaderShellClass}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="pointer-events-none absolute -right-3 top-2 h-20 w-20 rounded-full bg-[rgba(255,223,144,0.22)] blur-2xl" />
          <div className="pointer-events-none absolute -left-4 bottom-2 h-16 w-20 rounded-full bg-[rgba(177,214,112,0.16)] blur-2xl" />

          <div className="relative z-10 flex items-center gap-2">
            <div className={adminMobileHeaderBadgeClass}>
              <SpmMascot size="sm" className="h-6 w-6" />
            </div>

            {controls ? (
              <div className={cn('flex min-w-0 flex-1 items-center gap-2', controlsClassName)}>
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
