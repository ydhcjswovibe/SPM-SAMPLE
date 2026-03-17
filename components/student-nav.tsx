'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BookOpen, Home, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SpmMascot } from '@/components/spm-mascot'

interface StudentNavProps {
  userName: string
}

export function StudentNav({ userName }: StudentNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="spm-soft-panel flex min-h-16 items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <SpmMascot size="sm" className="h-10 w-10" />
            <div>
              <p className="spm-kicker">Student Home</p>
              <span className="spm-display text-xl text-foreground">SPM</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-white/70">
                <Avatar className="h-9 w-9 border-2 border-white/80">
                  <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">학생</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/student/profile" className="gap-2">
                  <User className="h-4 w-4" />
                  내상태
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  처음으로
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
        <div className="spm-soft-panel flex h-[4.5rem] items-center gap-1 px-2 pb-safe pt-2">
          <Link
            href="/student"
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-2 text-[11px] font-bold leading-none transition-all',
              pathname === '/student'
                ? 'bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shadow)]'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                pathname === '/student' ? 'bg-white/18' : 'bg-white/80'
              )}
            >
              <BookOpen className="h-[18px] w-[18px]" />
            </div>
            <span className="whitespace-nowrap">수업</span>
          </Link>
          <Link
            href="/student/profile"
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-2 text-[11px] font-bold leading-none transition-all',
              pathname === '/student/profile'
                ? 'bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-shadow)]'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                pathname === '/student/profile' ? 'bg-white/18' : 'bg-white/80'
              )}
            >
              <User className="h-[18px] w-[18px]" />
            </div>
            <span className="whitespace-nowrap">내상태</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
