import { BookOpen, LayoutGrid, type LucideIcon, Users } from 'lucide-react'

export type AdminNavigationTone = 'warm' | 'mint' | 'blue'

export interface AdminNavigationItem {
  href: string
  label: string
  icon: LucideIcon
  tone: AdminNavigationTone
}

export const adminPrimaryNavItems: AdminNavigationItem[] = [
  { href: '/admin', label: '운영', icon: LayoutGrid, tone: 'warm' },
  { href: '/admin/students', label: '학생', icon: Users, tone: 'mint' },
  { href: '/admin/content', label: '수업', icon: BookOpen, tone: 'blue' },
]

export function isAdminNavItemActive(pathname: string, href: string) {
  return pathname === href || (href !== '/admin' && pathname.startsWith(href))
}
