'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { BookOpen, Home, LogOut, Sparkles, User } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel } from '@/lib/weekly-media'
import {
  buildStudentSelectionHref,
  fetchStudentSummaries,
  resolveStudentSelection,
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
  const isHomePage = pathname === '/student'
  const isLessonsPage = pathname === '/student/lessons'
  const isProfilePage = pathname === '/student/profile'
  const supabase = createClient()

  const { data: summaries } = useSWR('student-class-summaries', () => fetchStudentSummaries(supabase), {
    refreshInterval: STUDENT_NAV_REFRESH_INTERVAL_MS,
  })

  const { selectedSummary, monthSummaries, visibleYearMonths } = summaries
    ? resolveStudentSelection(summaries, searchParams.get('classId'), searchParams.get('yearMonth'))
    : {
        selectedSummary: null,
        monthSummaries: [],
        visibleYearMonths: [],
      }

  const homeHref = buildStudentSelectionHref('/student', selectedSummary?.classId, selectedSummary?.yearMonth)
  const lessonsHref = buildStudentSelectionHref('/student/lessons', selectedSummary?.classId, selectedSummary?.yearMonth)
  const profileHref = buildStudentSelectionHref('/student/profile', selectedSummary?.classId, selectedSummary?.yearMonth)

  const eyebrowLabel = isProfilePage ? '내 보관함' : isLessonsPage ? '수업 이어보기' : '오늘의 대시보드'
  const titleLabel = isProfilePage ? '차곡차곡 내상태' : isLessonsPage ? '수업 탭' : 'SPM 숲'
  const homeSummaryLabel = selectedSummary
    ? `${selectedSummary.className} · ${formatYearMonthLabel(selectedSummary.yearMonth)}`
    : `${userName}님의 기록을 차곡차곡 모아봐요`
  const nonLessonsLabel = isHomePage ? homeSummaryLabel : `${userName}님의 기록을 차곡차곡 모아봐요`

  const handleSignOut = async () => {
    await supabase.auth.signOut()

    if (typeof window !== 'undefined') {
      window.location.assign('/auth/login')
      return
    }

    router.push('/auth/login')
  }

  function replaceSelection(classId: string, yearMonth: string) {
    router.replace(buildStudentSelectionHref('/student/lessons', classId, yearMonth), { scroll: false })
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
      nextMonthSummaries.find((item) => item.classId === selectedSummary?.classId) ?? nextMonthSummaries[0]

    replaceSelection(nextSummary.classId, nextSummary.yearMonth)
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3">
        <div
          className={cn(
            'relative overflow-hidden rounded-[2.2rem] border px-3 py-3 shadow-[0_14px_26px_rgba(106,138,64,0.1)] backdrop-blur',
            isProfilePage
              ? 'border-[#e6e8d6] bg-[linear-gradient(180deg,rgba(243,248,255,0.96)_0%,rgba(255,253,247,0.98)_46%,rgba(244,248,235,0.98)_100%)]'
              : 'border-[#dde9cf] bg-[linear-gradient(180deg,rgba(241,248,255,0.96)_0%,rgba(255,254,248,0.98)_42%,rgba(243,249,234,0.98)_100%)]',
          )}
        >
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 h-14',
              isProfilePage ? 'bg-[rgba(203,222,163,0.34)]' : 'bg-[rgba(176,210,124,0.28)]',
            )}
          />
          <div
            className={cn(
              'absolute -left-5 bottom-3 h-16 w-24 rounded-full',
              isProfilePage ? 'bg-[rgba(188,209,141,0.28)]' : 'bg-[rgba(142,191,92,0.22)]',
            )}
          />
          <div
            className={cn(
              'absolute left-8 top-4 h-8 w-8 rounded-full',
              isProfilePage ? 'bg-white/62' : 'bg-white/66',
            )}
          />
          <div
            className={cn(
              'absolute right-3 top-3 h-12 w-12 rounded-full',
              isProfilePage ? 'bg-[rgba(255,243,205,0.52)]' : 'bg-[rgba(255,246,216,0.42)]',
            )}
          />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-white/88 shadow-[0_10px_16px_rgba(116,146,78,0.12)]">
                  <SpmMascot size="sm" className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(89,114,70,0.72)]">
                    {eyebrowLabel}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="spm-display text-[1.1rem] text-[#314127] sm:text-[1.25rem]">
                      {titleLabel}
                    </span>
                    {!isProfilePage && selectedSummary ? (
                      <span className="inline-flex max-w-[9.8rem] items-center truncate rounded-full bg-[#fff7d6] px-2.5 py-1 text-[11px] font-semibold text-[#8c6d26] shadow-[0_6px_12px_rgba(182,157,88,0.08)]">
                        {selectedSummary.className}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {isLessonsPage && selectedSummary ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select value={selectedSummary.classId} onValueChange={handleClassChange}>
                    <SelectTrigger
                      aria-label="수업 선택"
                      className="h-10 min-w-0 flex-1 rounded-[1.25rem] border-[#dbe8cc] bg-white/94 text-left text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)]"
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
                      className="h-10 w-[7.5rem] rounded-[1.25rem] border-[#dbe8cc] bg-white/94 text-left text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)]"
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
                <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/78 px-3 py-1.5 text-[11px] font-semibold text-[#647554] shadow-[0_8px_14px_rgba(121,148,84,0.08)]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#efbc47]" />
                  <span className="truncate">{nonLessonsLabel}</span>
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="학생 메뉴"
                  className="h-11 w-11 rounded-[1.15rem] border border-white/72 bg-white/82 shadow-[0_8px_14px_rgba(121,148,84,0.1)]"
                >
                  <Avatar className="h-9 w-9 border border-white/70">
                    <AvatarFallback className="bg-[#fff6db] text-xs font-semibold text-[#866a2d]">
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
                  <Link href={profileHref} className="gap-2">
                    <User className="h-4 w-4" />
                    내상태
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={homeHref} className="gap-2">
                    <Home className="h-4 w-4" />
                    학생 홈
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="mx-auto flex h-[5.1rem] max-w-[27rem] items-center gap-2 rounded-[2.2rem] border border-white/75 bg-white/94 px-2.5 py-2.5 shadow-[0_22px_42px_rgba(107,129,70,0.16)] backdrop-blur">
          <Link
            href={homeHref}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.5rem] border px-2 py-2.5 text-[11px] font-semibold leading-none transition-all duration-200',
              isHomePage
                ? 'border-[#f0dfaa] bg-[linear-gradient(180deg,rgba(255,250,236,0.98)_0%,rgba(255,235,192,0.98)_100%)] text-[#6e5622] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_12px_24px_rgba(197,168,95,0.24)]'
                : 'border-transparent text-[#7a8470] hover:border-[#ece8d9] hover:bg-[#faf8ee] hover:text-[#324223]',
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200',
                isHomePage
                  ? 'border-[#f2cf82] bg-[#ffe1ad] text-[#bb8033] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(201,156,74,0.24)]'
                  : 'border-transparent bg-[#f6f3ea] text-[#98a08d]',
              )}
            >
              <Home className="h-[18px] w-[18px]" />
            </div>
            <span className="whitespace-nowrap">홈</span>
          </Link>

          <Link
            href={lessonsHref}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.5rem] border px-2 py-2.5 text-[11px] font-semibold leading-none transition-all duration-200',
              isLessonsPage
                ? 'border-[#d8e9b7] bg-[linear-gradient(180deg,rgba(246,252,227,0.98)_0%,rgba(229,244,193,0.98)_100%)] text-[#34501f] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_24px_rgba(143,182,98,0.24)]'
                : 'border-transparent text-[#7a8470] hover:border-[#ece8d9] hover:bg-[#faf8ee] hover:text-[#324223]',
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200',
                isLessonsPage
                  ? 'border-[#f5d985] bg-[#fff1b4] text-[#d79d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_8px_18px_rgba(220,177,70,0.24)]'
                  : 'border-transparent bg-[#f6f3ea] text-[#98a08d]',
              )}
            >
              <BookOpen className="h-[18px] w-[18px]" />
            </div>
            <span className="whitespace-nowrap">수업</span>
          </Link>

          <Link
            href={profileHref}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.5rem] border px-2 py-2.5 text-[11px] font-semibold leading-none transition-all duration-200',
              isProfilePage
                ? 'border-[#d7e7f6] bg-[linear-gradient(180deg,rgba(244,249,255,0.98)_0%,rgba(229,240,255,0.98)_100%)] text-[#35506d] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_12px_24px_rgba(133,162,205,0.2)]'
                : 'border-transparent text-[#7a8470] hover:border-[#ece8d9] hover:bg-[#faf8ee] hover:text-[#324223]',
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200',
                isProfilePage
                  ? 'border-[#cfe0f6] bg-[#eaf3ff] text-[#5d79ab] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(133,162,205,0.2)]'
                  : 'border-transparent bg-[#f6f3ea] text-[#98a08d]',
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
