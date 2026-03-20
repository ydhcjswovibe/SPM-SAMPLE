'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutGrid, Users, BookOpen, Settings, LogOut, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', label: '운영', icon: LayoutGrid },
  { href: '/admin/students', label: '학생', icon: Users },
  { href: '/admin/content', label: '수업', icon: BookOpen },
  { href: '/admin/settings', label: '설정', icon: Settings },
]

export function DesktopSidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()

    if (typeof window !== 'undefined') {
      window.location.assign('/auth/login')
    }
  }

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-sidebar fixed left-0 top-0">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          S
        </div>
        <span className="font-semibold text-sidebar-foreground">SPM 운영</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <Button
          asChild
          variant="ghost"
          className="mb-1 w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            처음으로
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  )
}
