'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { BookOpen, Home, LogOut, User } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel } from '@/lib/weekly-media'
import {
  fetchStudentSummaries,
  getFeaturedSummary,
  getVisibleYearMonths,
  readSelectedSummary,
} from '@/lib/student-lessons'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SpmMascot } from '@/components/spm-mascot'

interface StudentNavProps {
  userName: string
}

export function StudentNav({ userName }: StudentNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLessonHome = pathname === '/student'
  const supabase = createClient()

  const { data: summaries } = useSWR(
    isLessonHome ? 'student-class-summaries' : null,
    () => fetchStudentSummaries(supabase),
  )

  const featuredSummary =
    summaries && summaries.length > 0
      ? getFeaturedSummary(summaries)
      : null
  const visibleYearMonths = summaries && summaries.length > 0 ? getVisibleYearMonths(summaries) : []
  const selectedYearMonth =
    visibleYearMonths.includes(searchParams.get('yearMonth') ?? '') && searchParams.get('yearMonth')
      ? searchParams.get('yearMonth')
      : featuredSummary?.yearMonth ?? null
  const monthSummaries =
    summaries && selectedYearMonth
      ? summaries.filter((item) => item.yearMonth === selectedYearMonth)
      : []
  const selectedSummary =
    monthSummaries.length > 0
      ? readSelectedSummary(monthSummaries, searchParams.get('classId'), selectedYearMonth)
      : null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function replaceSelection(classId: string, yearMonth: string) {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('classId', classId)
    nextParams.set('yearMonth', yearMonth)
    router.replace(`/student?${nextParams.toString()}`, { scroll: false })
  }

  function handleClassChange(classId: string) {
    const nextSummary = monthSummaries.find((item) => item.classId === classId)
    if (!nextSummary) {
      return
    }

    replaceSelection(nextSummary.classId, nextSummary.yearMonth)
  }

  function handleMonthChange(yearMonth: string) {
    if (!summaries) {
      return
    }

    const nextMonthSummaries = summaries.filter((item) => item.yearMonth === yearMonth)
    if (nextMonthSummaries.length === 0) {
      return
    }

    const nextSummary =
      nextMonthSummaries.find((item) => item.classId === selectedSummary?.classId) ??
      getFeaturedSummary(nextMonthSummaries)

    replaceSelection(nextSummary.classId, nextSummary.yearMonth)
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="rounded-[1.7rem] border border-[rgba(23,33,42,0.08)] bg-white/92 px-4 py-3 shadow-[0_14px_40px_rgba(19,26,34,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef8f4]">
                  <SpmMascot size="sm" className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a8390]">
                    수업 홈
                  </p>
                  <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    <span className="spm-display shrink-0 text-lg text-[#17212a] sm:text-xl">SPM</span>
                    {isLessonHome && selectedSummary ? (
                      <div className="ml-1 flex min-w-0 flex-1 items-center justify-end gap-1.5">
                        <Select value={selectedSummary.classId} onValueChange={handleClassChange}>
                          <SelectTrigger
                            aria-label="수업 선택"
                            className="h-9 w-[6.75rem] rounded-[0.95rem] border-[rgba(23,33,42,0.08)] bg-[#fbfaf7] text-left text-[#17212a] sm:w-[8rem]"
                          >
                            <SelectValue placeholder="수업" />
                          </SelectTrigger>
                          <SelectContent>
                            {monthSummaries.map((summary) => (
                              <SelectItem key={summary.classId} value={summary.classId}>
                                {summary.className}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={selectedSummary.yearMonth} onValueChange={handleMonthChange}>
                          <SelectTrigger
                            aria-label="월 선택"
                            className="h-9 w-[5.5rem] rounded-[0.95rem] border-[rgba(23,33,42,0.08)] bg-[#fbfaf7] text-left text-[#17212a] sm:w-[7rem]"
                          >
                            <SelectValue placeholder="월" />
                          </SelectTrigger>
                          <SelectContent>
                            {visibleYearMonths.map((yearMonth) => (
                              <SelectItem key={yearMonth} value={yearMonth}>
                                {formatYearMonthLabel(yearMonth)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="학생 메뉴"
                  className="rounded-full border border-[rgba(23,33,42,0.08)] bg-[#f8f6f1]"
                >
                  <Avatar className="h-9 w-9 border border-[rgba(23,33,42,0.08)]">
                    <AvatarFallback className="bg-[#eef3ff] text-xs text-[#4d72c1]">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">{userName}</p>
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
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
        <div className="flex h-[4.4rem] items-center gap-1 rounded-[1.7rem] border border-[rgba(23,33,42,0.08)] bg-white/94 px-2 pb-safe pt-2 shadow-[0_18px_44px_rgba(19,26,34,0.1)] backdrop-blur">
          <Link
            href="/student"
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-2 text-[11px] font-semibold leading-none transition-all',
              pathname === '/student'
                ? 'bg-[#eef8f4] text-[#1d4e46]'
                : 'text-[#76808c] hover:bg-[#f6f4ef] hover:text-[#17212a]'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                pathname === '/student' ? 'bg-white text-[#1d4e46]' : 'bg-[#f6f4ef] text-[#76808c]'
              )}
            >
              <BookOpen className="h-[18px] w-[18px]" />
            </div>
            <span className="whitespace-nowrap">수업</span>
          </Link>
          <Link
            href="/student/profile"
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-2 text-[11px] font-semibold leading-none transition-all',
              pathname === '/student/profile'
                ? 'bg-[#eef3ff] text-[#4368b8]'
                : 'text-[#76808c] hover:bg-[#f6f4ef] hover:text-[#17212a]'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                pathname === '/student/profile'
                  ? 'bg-white text-[#4368b8]'
                  : 'bg-[#f6f4ef] text-[#76808c]'
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
