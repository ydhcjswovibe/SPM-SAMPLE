import type { AdminNavigationTone } from '@/lib/admin/navigation'
import { cn } from '@/lib/utils'

type AdminMetricTone = 'warm' | 'mint' | 'blue' | 'green'
type AdminAlertTone = 'danger' | 'warning' | 'success'

const adminShellSurfaceClass =
  'bg-card'
const adminControlSurfaceClass =
  'bg-white'
const adminMenuSurfaceClass =
  'bg-white'
const adminCardSurfaceClass =
  'bg-card'
const adminInsetSurfaceClass =
  'bg-white'
const adminDialogSurfaceClass =
  'bg-card'

const adminActiveItemToneClass: Record<AdminNavigationTone, string> = {
  warm:
    'border-[#f0dfaa] bg-accent text-[#6d5421] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(197,168,95,0.2)]',
  mint:
    'border-[#d8e9b7] bg-muted text-[#34501f] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_18px_rgba(143,182,98,0.2)]',
  blue:
    'border-[#d7e7f6] bg-secondary text-[#4666a2] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(133,162,205,0.18)]',
}

const adminActiveIconToneClass: Record<AdminNavigationTone, string> = {
  warm:
    'border-[#f2cf82] bg-white text-[#bb8033] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(201,156,74,0.24)]',
  mint:
    'border-[#d8e9b7] bg-white text-[#5d8840] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_8px_18px_rgba(143,182,98,0.24)]',
  blue:
    'border-[#cfe0f6] bg-white text-[#5d79ab] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(133,162,205,0.2)]',
}

const adminMetricToneClass: Record<AdminMetricTone, string> = {
  warm:
    'border-[#f0dfaa] bg-accent',
  mint:
    'border-[#dce8cf] bg-muted',
  blue:
    'border-[#d9e8fb] bg-secondary',
  green:
    'border-[#d8e8da] bg-muted',
}

const adminAlertToneClass: Record<AdminAlertTone, string> = {
  danger:
    'border border-destructive/30 bg-card shadow-[0_18px_36px_rgba(184,86,70,0.08)]',
  warning:
    'border border-[#ecdca7] bg-accent shadow-[0_14px_26px_rgba(197,168,95,0.1)]',
  success:
    'border border-[#d8e8c8] bg-muted shadow-[0_14px_26px_rgba(111,145,72,0.08)]',
}

export const adminDesktopShellSurfaceClass =
  `overflow-hidden rounded-2xl border border-[#cfdcbf] ${adminShellSurfaceClass} shadow-[0_18px_32px_rgba(96,129,51,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]`

export const adminMobileHeaderBackdropClass =
  'pointer-events-none absolute inset-x-2 bottom-[-0.2rem] top-[0.45rem] rounded-2xl border border-[#cfdcbf] bg-muted shadow-[0_16px_30px_rgba(91,121,47,0.16)]'

export const adminMobileHeaderShellClass =
  'relative isolate overflow-hidden rounded-2xl border-2 border-[#d6e2c8] bg-card px-2.5 py-2.5 shadow-[0_18px_32px_rgba(96,129,51,0.14),inset_0_1px_0_rgba(255,255,255,0.96)]'

export const adminMobileHeaderBadgeClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_8px_14px_rgba(116,146,78,0.1)]'

export const adminToolbarSurfaceClass =
  cn(adminDesktopShellSurfaceClass, 'px-3 py-2.5 md:px-4 md:py-3 lg:px-5')

export const adminDesktopSidebarBrandClass =
  cn(adminDesktopShellSurfaceClass, 'px-3 py-3 lg:px-3.5 lg:py-3.5')

export const adminDesktopSidebarPanelClass =
  cn(adminDesktopShellSurfaceClass, 'flex min-h-0 flex-1 flex-col px-3 py-3.5 lg:px-3.5 lg:py-4')

export const adminToolbarControlClass =
  `h-10 rounded-2xl border-[#dbe8cc] ${adminControlSurfaceClass} text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] data-[state=open]:border-[#d5e3c4] [-webkit-tap-highlight-color:transparent] touch-manipulation`

export const adminToolbarMonthInputClass = cn(
  adminToolbarControlClass,
  'w-[5.95rem] min-w-[5.95rem] px-2.5 text-[13px] font-semibold sm:w-[6.25rem] sm:min-w-[6.25rem] md:w-[132px] md:min-w-[132px] md:px-3 md:text-sm lg:w-[128px] lg:min-w-[128px]',
)

export const adminToolbarPillButtonClass = cn(
  adminToolbarControlClass,
  'gap-2 rounded-2xl border px-3 text-[13px] font-semibold',
)

export const adminToolbarDangerButtonClass =
  'h-10 gap-2 rounded-2xl border border-destructive/30 bg-card px-3 text-[13px] font-semibold text-[#b65046] shadow-[0_8px_14px_rgba(182,80,70,0.08)] hover:bg-white'

export const adminPrimaryButtonClass =
  'border-[#75b84f] bg-primary text-white shadow-[0_10px_18px_rgba(111,174,71,0.2)]'

export const adminCompactButtonClass =
  `h-9 rounded-xl border border-[#dce8cc] ${adminControlSurfaceClass} px-3 text-[13px] font-semibold text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)]`

export const adminCompactDangerButtonClass =
  'h-9 rounded-xl border border-destructive/30 bg-card px-3 text-[13px] font-semibold text-[#b65046] shadow-[0_8px_14px_rgba(182,80,70,0.08)] hover:bg-white'

export const adminCompactIconButtonClass =
  `h-10 w-10 rounded-2xl border border-[#dce8cc] ${adminControlSurfaceClass} text-[#5f7250] shadow-[0_8px_14px_rgba(121,148,84,0.1)]`

export const adminMobileHeaderIconButtonClass =
  `h-10 w-10 rounded-2xl border border-[#dce8cc] ${adminControlSurfaceClass} text-[#5f7250] shadow-[0_8px_14px_rgba(121,148,84,0.1)] active:text-[#314127] data-[state=open]:text-[#314127] data-[state=open]:border-[#d5e3c4] [-webkit-tap-highlight-color:transparent] touch-manipulation`

export const adminDropdownContentClass =
  `rounded-2xl border border-[#dfe8d2] ${adminMenuSurfaceClass} p-1.5 shadow-[0_18px_32px_rgba(111,145,72,0.12)]`

export const adminDropdownItemClass =
  `gap-2 rounded-xl border border-transparent ${adminMenuSurfaceClass} px-2.5 py-2 text-[#314127] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-[#edf1e4] focus:text-[#314127]`

export const adminSurfaceCardClass =
  `gap-0 overflow-hidden rounded-2xl border border-[#e6ecda] ${adminCardSurfaceClass} py-0 shadow-[0_14px_28px_rgba(111,145,72,0.08)]`

export const adminInsetCardClass =
  `gap-0 overflow-hidden rounded-2xl border border-[#e7eddb] ${adminInsetSurfaceClass} py-0 shadow-[0_12px_24px_rgba(111,145,72,0.06)]`

export const adminSubtlePanelClass =
  'rounded-2xl border border-[#e5ecd8] bg-card p-3 shadow-[0_10px_18px_rgba(111,145,72,0.05)]'

export const adminDashedPanelClass =
  'rounded-2xl border border-dashed border-[#d9e3c9] bg-card p-3'

export const adminEditorSurfaceClass =
  `min-w-0 space-y-4 rounded-2xl border border-[#e6ecda] ${adminCardSurfaceClass} p-4 shadow-[0_14px_28px_rgba(111,145,72,0.08)] md:p-5 lg:p-6`

export const adminSurfaceInputClass =
  'rounded-2xl border-[#dce8cc] bg-white text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] placeholder:text-[#8fa081]'

export const adminSurfaceTextareaClass =
  'rounded-2xl border-[#dce8cc] bg-white text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] placeholder:text-[#8fa081]'

export const adminDialogContentClass =
  `rounded-2xl border border-[#dfe8d2] ${adminDialogSurfaceClass} p-6 shadow-[0_24px_44px_rgba(111,145,72,0.14)]`

export function adminMetricCardClass(tone: AdminMetricTone) {
  return cn(
    'gap-0 rounded-2xl border py-0 shadow-[0_12px_22px_rgba(111,145,72,0.08)]',
    adminMetricToneClass[tone],
  )
}

export function adminAlertCardClass(tone: AdminAlertTone) {
  return cn('gap-0 rounded-2xl py-0', adminAlertToneClass[tone])
}

export function adminSidebarItemClass(tone: AdminNavigationTone, active: boolean) {
  return cn(
    'flex items-center gap-3 rounded-2xl border px-2.5 py-2.5 transition-all duration-200 lg:px-3 lg:py-3',
    active
      ? adminActiveItemToneClass[tone]
      : 'border-[#ece8d9] bg-white text-[#708061] hover:border-[#ece8d9] hover:text-[#314127]',
  )
}

export function adminSidebarIconClass(tone: AdminNavigationTone, active: boolean) {
  return cn(
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 lg:h-10 lg:w-10',
    active
      ? adminActiveIconToneClass[tone]
      : 'border-transparent bg-card text-[#98a08d]',
  )
}

export function adminBottomNavItemClass(tone: AdminNavigationTone, active: boolean) {
  return cn(
    'flex min-w-0 flex-1 items-center justify-center rounded-2xl border px-1.5 py-1.5 transition-all duration-200 active:opacity-100 [-webkit-tap-highlight-color:transparent] touch-manipulation',
    active
      ? cn(adminActiveItemToneClass[tone], 'active:border-current/20 active:brightness-[0.99]')
      : 'border-[#ece8d9] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]',
  )
}

export function adminBottomNavIconClass(tone: AdminNavigationTone, active: boolean) {
  return cn(
    'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200',
    active
      ? adminActiveIconToneClass[tone]
      : 'border-[#ebe5d6] bg-white text-[#98a08d] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  )
}
