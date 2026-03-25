import type { AdminNavigationTone } from '@/lib/admin/navigation'
import { cn } from '@/lib/utils'

type AdminMetricTone = 'warm' | 'mint' | 'blue' | 'green'
type AdminAlertTone = 'danger' | 'warning' | 'success'

const adminActiveItemToneClass: Record<AdminNavigationTone, string> = {
  warm:
    'border-[#f0dfaa] bg-[linear-gradient(180deg,rgba(255,250,236,0.99)_0%,rgba(255,238,204,0.98)_100%)] text-[#6d5421] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(197,168,95,0.2)]',
  mint:
    'border-[#d8e9b7] bg-[linear-gradient(180deg,rgba(246,252,227,0.99)_0%,rgba(229,244,193,0.98)_100%)] text-[#34501f] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_18px_rgba(143,182,98,0.2)]',
  blue:
    'border-[#d7e7f6] bg-[linear-gradient(180deg,rgba(244,249,255,0.99)_0%,rgba(229,240,255,0.98)_100%)] text-[#4666a2] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(133,162,205,0.18)]',
}

const adminActiveIconToneClass: Record<AdminNavigationTone, string> = {
  warm:
    'border-[#f2cf82] bg-[#ffe1ad] text-[#bb8033] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(201,156,74,0.24)]',
  mint:
    'border-[#f5d985] bg-[#fff1b4] text-[#d79d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_8px_18px_rgba(220,177,70,0.24)]',
  blue:
    'border-[#cfe0f6] bg-[#eaf3ff] text-[#5d79ab] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(133,162,205,0.2)]',
}

const adminMetricToneClass: Record<AdminMetricTone, string> = {
  warm:
    'border-[#f0dfaa] bg-[linear-gradient(155deg,rgba(255,252,241,0.98)_0%,rgba(255,245,210,0.98)_100%)]',
  mint:
    'border-[#dce8cf] bg-[linear-gradient(155deg,rgba(249,253,242,0.98)_0%,rgba(238,247,222,0.98)_100%)]',
  blue:
    'border-[#d9e8fb] bg-[linear-gradient(155deg,rgba(246,251,255,0.98)_0%,rgba(229,241,255,0.98)_100%)]',
  green:
    'border-[#d8e8da] bg-[linear-gradient(155deg,rgba(247,253,247,0.98)_0%,rgba(230,245,232,0.98)_100%)]',
}

const adminAlertToneClass: Record<AdminAlertTone, string> = {
  danger:
    'border border-[rgba(214,104,96,0.26)] bg-[#fff6f2] shadow-[0_18px_36px_rgba(184,86,70,0.08)]',
  warning:
    'border border-[#ecdca7] bg-[linear-gradient(180deg,rgba(255,250,235,0.98)_0%,rgba(255,244,209,0.98)_100%)] shadow-[0_14px_26px_rgba(197,168,95,0.1)]',
  success:
    'border border-[#d8e8c8] bg-[linear-gradient(180deg,rgba(247,252,240,0.98)_0%,rgba(236,248,220,0.98)_100%)] shadow-[0_14px_26px_rgba(111,145,72,0.08)]',
}

export const adminToolbarSurfaceClass =
  'rounded-[1.9rem] border border-[#cfdcbf] bg-[linear-gradient(180deg,rgba(252,254,247,0.98)_0%,rgba(255,253,247,0.99)_100%)] px-3 py-2.5 shadow-[0_18px_32px_rgba(96,129,51,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md md:px-4 md:py-3 lg:px-5'

export const adminToolbarControlClass =
  'h-9 rounded-[1rem] border-[#dbe8cc] bg-white/96 text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] hover:bg-[#fbfdf6] active:bg-[#f5f9ea] active:text-[#314127] data-[state=open]:bg-[#f5f9ea] data-[state=open]:text-[#314127] data-[state=open]:border-[#d5e3c4] [-webkit-tap-highlight-color:transparent] touch-manipulation md:h-10 md:rounded-[1.1rem]'

export const adminToolbarMonthInputClass = cn(
  adminToolbarControlClass,
  'w-[5.95rem] min-w-[5.95rem] px-2.5 text-[13px] font-semibold sm:w-[6.25rem] sm:min-w-[6.25rem] md:w-[132px] md:min-w-[132px] md:px-3 md:text-sm lg:w-[128px] lg:min-w-[128px]',
)

export const adminToolbarPillButtonClass = cn(
  adminToolbarControlClass,
  'gap-2 rounded-[1.15rem] border px-3 text-[13px] font-semibold',
)

export const adminToolbarDangerButtonClass =
  'h-10 gap-2 rounded-[1.15rem] border border-[#f0d4cf] bg-[#fff5f1] px-3 text-[13px] font-semibold text-[#b65046] shadow-[0_8px_14px_rgba(182,80,70,0.08)] hover:bg-[#ffede7]'

export const adminPrimaryButtonClass =
  'border-[#75b84f] bg-[#8fcf62] text-white shadow-[0_10px_18px_rgba(111,174,71,0.2)] hover:bg-[#9ad670]'

export const adminCompactButtonClass =
  'h-9 rounded-[1rem] border border-[#dce8cc] bg-white/96 px-3 text-[13px] font-semibold text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] hover:bg-[#fbfdf6]'

export const adminCompactDangerButtonClass =
  'h-9 rounded-[1rem] border border-[#f0d4cf] bg-[#fff5f1] px-3 text-[13px] font-semibold text-[#b65046] shadow-[0_8px_14px_rgba(182,80,70,0.08)] hover:bg-[#ffede7]'

export const adminCompactIconButtonClass =
  'h-10 w-10 rounded-[1rem] border border-white/72 bg-white/88 text-[#5f7250] shadow-[0_8px_14px_rgba(121,148,84,0.1)] hover:bg-white'

export const adminMobileHeaderIconButtonClass =
  'h-9 w-9 rounded-[0.95rem] border border-white/72 bg-white/92 text-[#5f7250] shadow-[0_8px_14px_rgba(121,148,84,0.1)] hover:bg-white active:bg-[#f5f9ea] active:text-[#314127] data-[state=open]:bg-[#f5f9ea] data-[state=open]:text-[#314127] data-[state=open]:border-[#d5e3c4] [-webkit-tap-highlight-color:transparent] touch-manipulation'

export const adminDropdownContentClass =
  'rounded-[1.25rem] border-[#dfe8d2] bg-white/98 p-1.5 shadow-[0_18px_32px_rgba(111,145,72,0.12)]'

export const adminDropdownItemClass =
  'gap-2 rounded-[0.95rem] px-2.5 py-2 text-[#314127] focus:bg-[#f5f9ea] focus:text-[#314127]'

export const adminSurfaceCardClass =
  'gap-0 overflow-hidden rounded-[2rem] border border-[#e6ecda] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(254,255,250,0.98)_100%)] py-0 shadow-[0_14px_28px_rgba(111,145,72,0.08)]'

export const adminInsetCardClass =
  'gap-0 overflow-hidden rounded-[1.85rem] border border-[#e7eddb] bg-white/98 py-0 shadow-[0_12px_24px_rgba(111,145,72,0.06)]'

export const adminSubtlePanelClass =
  'rounded-[1.55rem] border border-[#e5ecd8] bg-[#fbfcf7] p-3 shadow-[0_10px_18px_rgba(111,145,72,0.05)]'

export const adminDashedPanelClass =
  'rounded-[1.4rem] border border-dashed border-[#d9e3c9] bg-[#fbfcf6] p-3'

export const adminEditorSurfaceClass =
  'min-w-0 space-y-4 rounded-[2rem] border border-[#e6ecda] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(254,255,250,0.98)_100%)] p-4 shadow-[0_14px_28px_rgba(111,145,72,0.08)] md:p-5 lg:p-6'

export const adminSurfaceInputClass =
  'rounded-[1.2rem] border-[#dce8cc] bg-white/96 text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] placeholder:text-[#8fa081]'

export const adminSurfaceTextareaClass =
  'rounded-[1.2rem] border-[#dce8cc] bg-white/96 text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] placeholder:text-[#8fa081]'

export const adminDialogContentClass =
  'rounded-[1.9rem] border border-[#dfe8d2] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(254,255,249,0.98)_100%)] p-6 shadow-[0_24px_44px_rgba(111,145,72,0.14)]'

export function adminMetricCardClass(tone: AdminMetricTone) {
  return cn(
    'gap-0 rounded-[1.65rem] border py-0 shadow-[0_12px_22px_rgba(111,145,72,0.08)]',
    adminMetricToneClass[tone],
  )
}

export function adminAlertCardClass(tone: AdminAlertTone) {
  return cn('gap-0 rounded-[1.9rem] py-0', adminAlertToneClass[tone])
}

export function adminSidebarItemClass(tone: AdminNavigationTone, active: boolean) {
  return cn(
    'flex items-center gap-3 rounded-[1.25rem] border px-2.5 py-2.5 transition-all duration-200 lg:rounded-[1.35rem] lg:px-3 lg:py-3',
    active
      ? adminActiveItemToneClass[tone]
      : 'border-transparent bg-white/72 text-[#708061] hover:border-[#ece8d9] hover:bg-white/90 hover:text-[#314127]',
  )
}

export function adminSidebarIconClass(tone: AdminNavigationTone, active: boolean) {
  return cn(
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 lg:h-10 lg:w-10',
    active
      ? adminActiveIconToneClass[tone]
      : 'border-transparent bg-[#f6f3ea] text-[#98a08d]',
  )
}

export function adminBottomNavItemClass(tone: AdminNavigationTone, active: boolean) {
  return cn(
    'flex min-w-0 flex-1 items-center justify-center rounded-[1.2rem] border px-1.5 py-1.5 transition-all duration-200 active:opacity-100 [-webkit-tap-highlight-color:transparent] touch-manipulation',
    active
      ? cn(adminActiveItemToneClass[tone], 'active:border-current/20 active:brightness-[0.99]')
      : 'border-[#ece8d9] bg-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] hover:bg-[#faf8ee] active:bg-[#f7f6ec]',
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
