'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { BookOpen, Home, LogOut, Sparkles, User } from 'lucide-react'

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

const STUDENT_NAV_REFRESH_INTERVAL_MS = 5000

export function StudentNav({ userName }: StudentNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLessonHome = pathname === '/student'
  const isProfilePage = pathname === '/student/profile'
  const supabase = createClient()

  const { data: summaries } = useSWR(
    isLessonHome ? 'student-class-summaries' : null,
    () => fetchStudentSummaries(supabase),
    {
      refreshInterval: STUDENT_NAV_REFRESH_INTERVAL_MS,
    },
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
      <header className="sticky top-0 z-50 px-3 pt-3">
        <div
          className={cn(
            'relative overflow-hidden rounded-[2rem] border px-3 py-3 shadow-[0_16px_34px_rgba(74,97,44,0.18)] backdrop-blur',
            isProfilePage
              ? 'border-[#e0c88f] bg-[#f6e5b8]/92'
              : 'border-[#86bc5f] bg-[#b8dd7b]/92',
          )}
        >
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 h-12',
              isProfilePage ? 'bg-[#f0dca8]' : 'bg-[#87bf58]',
            )}
          />
          <div
            className={cn(
              'absolute -left-4 bottom-3 h-14 w-20 rounded-full',
              isProfilePage ? 'bg-[#ead086]' : 'bg-[#72ab4a]',
            )}
          />
          <div
            className={cn(
              'absolute right-2 top-2 h-10 w-10 rounded-full',
              isProfilePage ? 'bg-white/45' : 'bg-white/28',
            )}
          />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-white/85 shadow-[0_8px_14px_rgba(70,96,46,0.16)]">
                  <SpmMascot size="sm" className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#425438]/70">
                    {isProfilePage ? '내 보관함' : '오늘의 수업'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="spm-display text-[1.05rem] text-[#324223] sm:text-[1.2rem]">
                      {isProfilePage ? '차곡차곡 내상태' : 'SPM 숲'}
                    </span>
                    {!isProfilePage && selectedSummary ? (
                      <span className="inline-flex items-center rounded-full bg-white/78 px-2.5 py-1 text-[11px] font-semibold text-[#5c6d43] shadow-[0_6px_12px_rgba(70,96,46,0.08)]">
                        {selectedSummary.className}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {isLessonHome && selectedSummary ? (
                <div className="mt-3 flex items-center gap-2">
                  <Select value={selectedSummary.classId} onValueChange={handleClassChange}>
                    <SelectTrigger
                      aria-label="수업 선택"
                      className="h-10 flex-1 rounded-[1.15rem] border-[#dbe7c2] bg-white/92 text-left text-[#314124] shadow-[0_8px_14px_rgba(70,96,46,0.1)]"
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
                      className="h-10 w-[7.2rem] rounded-[1.15rem] border-[#dbe7c2] bg-white/92 text-left text-[#314124] shadow-[0_8px_14px_rgba(70,96,46,0.1)]"
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
              ) : (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/76 px-3 py-1.5 text-[11px] font-semibold text-[#5c6d43] shadow-[0_8px_14px_rgba(70,96,46,0.08)]">
                  <Sparkles className="h-3.5 w-3.5 text-[#f2ad37]" />
                  {userName}님의 기록을 차곡차곡 모아봐요
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="학생 메뉴"
                  className="h-11 w-11 rounded-[1.1rem] border border-white/70 bg-white/80 shadow-[0_8px_14px_rgba(70,96,46,0.12)]"
                >
                  <Avatar className="h-9 w-9 border border-white/70">
                    <AvatarFallback className="bg-[#f6f1df] text-xs font-semibold text-[#7c6b3e]">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-[1.2rem]">
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
        <div className="mx-auto flex h-[4.9rem] max-w-[27rem] items-center gap-2 rounded-[2rem] border border-white/70 bg-white/92 px-2 py-2 shadow-[0_20px_44px_rgba(77,90,54,0.18)] backdrop-blur">
          <Link
            href="/student"
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-2 text-[11px] font-semibold leading-none transition-all',
              pathname === '/student'
                ? 'bg-[#eef7dc] text-[#426128] shadow-[0_8px_18px_rgba(123,160,71,0.18)]'
                : 'text-[#7d8573] hover:bg-[#f8f5ea] hover:text-[#324223]',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                pathname === '/student' ? 'bg-[#ffefb1] text-[#f2a935]' : 'bg-[#f4f1e8] text-[#98a08d]',
              )}
            >
              <BookOpen className="h-[18px] w-[18px]" />
            </div>
            <span className="whitespace-nowrap">수업</span>
          </Link>
          <Link
            href="/student/profile"
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-2 text-[11px] font-semibold leading-none transition-all',
              pathname === '/student/profile'
                ? 'bg-[#f9eed4] text-[#7a653a] shadow-[0_8px_18px_rgba(178,144,82,0.18)]'
                : 'text-[#7d8573] hover:bg-[#f8f5ea] hover:text-[#324223]',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                pathname === '/student/profile' ? 'bg-[#ffd89f] text-[#b5792d]' : 'bg-[#f4f1e8] text-[#98a08d]',
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
