'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BookOpen, User, LogOut } from 'lucide-react'
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
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              S
            </div>
            <span className="font-semibold">SPM</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
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
                  프로필
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
        <div className="flex h-16 items-center justify-around px-2 pb-safe">
          <Link
            href="/student"
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-6 py-2 text-xs transition-colors',
              pathname === '/student'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BookOpen className="h-5 w-5" />
            <span>내 수업</span>
          </Link>
          <Link
            href="/student/profile"
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-6 py-2 text-xs transition-colors',
              pathname === '/student/profile'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="h-5 w-5" />
            <span>프로필</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
