'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'
import { BookOpen, Gift, Home, LogOut, User } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatCompactYearMonthLabel } from '@/lib/weekly-media'
import {
  buildStudentSelectionHref,
  fetchStudentSummaries,
  resolveStudentSelection,
} from '@/lib/student-lessons'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StudentEnrollmentRequestDialog } from '@/components/student-enrollment-request-card'
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
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
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
  const canRequestFromMenu = isLessonsPage && Boolean(summaries && summaries.length > 0)

  const handleSignOut = async () => {
    await supabase.auth.signOut()

    if (typeof window !== 'undefined') {
      window.location.assign('/auth/login')
      return
    }

    router.push('/auth/login')
  }

  function replaceSelection(classId: string, yearMonth: string) {
    router.replace(buildStudentSelectionHref(pathname || '/student', classId, yearMonth), { scroll: false })
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
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-2 bottom-[-0.2rem] top-[0.45rem] rounded-[1.8rem] border border-[#c9d7b8]/85 bg-[linear-gradient(180deg,rgba(223,236,198,0.92)_0%,rgba(204,221,172,0.86)_100%)] shadow-[0_16px_30px_rgba(91,121,47,0.16)]" />
          <div className="relative overflow-hidden rounded-[1.9rem] border border-[#cfdcbf] bg-[linear-gradient(180deg,rgba(252,254,247,0.98)_0%,rgba(255,253,247,0.99)_100%)] px-2.5 py-2.5 shadow-[0_18px_32px_rgba(96,129,51,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0)_100%)]" />
            <div className="relative z-10 flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-white/92 shadow-[0_8px_14px_rgba(116,146,78,0.1)]">
                <SpmMascot size="sm" className="h-7 w-7" />
              </div>

              {selectedSummary ? (
                <>
                  <Select value={selectedSummary.classId} onValueChange={handleClassChange}>
                    <SelectTrigger
                      aria-label="수업 선택"
                      className="h-10 min-w-0 flex-1 rounded-[1.1rem] border-[#dbe8cc] bg-white/96 px-3 text-left text-sm font-semibold text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)] [&>span]:truncate"
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
                      className="h-10 w-[5.6rem] shrink-0 rounded-[1.1rem] border-[#dbe8cc] bg-white/96 px-3 text-sm font-semibold text-[#314127] shadow-[0_8px_14px_rgba(121,148,84,0.08)]"
                    >
                      <SelectValue placeholder="월" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleYearMonths.map((yearMonth) => (
                        <SelectItem key={yearMonth} value={yearMonth}>
                          {formatCompactYearMonthLabel(yearMonth)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <div className="flex h-10 min-w-0 flex-1 items-center rounded-[1.1rem] border border-[#dbe8cc] bg-white/96 px-3 text-sm font-semibold text-[#7a8470] shadow-[0_8px_14px_rgba(121,148,84,0.08)]">
                    수업
                  </div>
                  <div className="flex h-10 w-[5.6rem] shrink-0 items-center justify-center rounded-[1.1rem] border border-[#dbe8cc] bg-white/96 px-3 text-sm font-semibold text-[#7a8470] shadow-[0_8px_14px_rgba(121,148,84,0.08)]">
                    월
                  </div>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="학생 메뉴"
                    className="h-10 w-10 shrink-0 rounded-[1rem] border border-white/72 bg-white/88 shadow-[0_8px_14px_rgba(121,148,84,0.1)]"
                  >
                    <Avatar className="h-8 w-8 border border-white/70">
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
                  {canRequestFromMenu ? (
                    <>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          setIsRequestDialogOpen(true)
                        }}
                        className="gap-2"
                      >
                        <Gift className="h-4 w-4" />
                        새 수업 요청
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : null}
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="mx-auto flex h-[4rem] max-w-[24rem] items-center gap-1.5 rounded-[1.7rem] border border-white/78 bg-white/95 px-1.5 py-1.5 shadow-[0_18px_34px_rgba(107,129,70,0.16)] backdrop-blur-md">
          <Link
            href={homeHref}
            aria-label="학생 홈"
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center rounded-[1.2rem] border px-1.5 py-1.5 transition-all duration-200',
              isHomePage
                ? 'border-[#f0dfaa] bg-[linear-gradient(180deg,rgba(255,250,236,0.99)_0%,rgba(255,238,204,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(197,168,95,0.22)]'
                : 'border-transparent hover:border-[#ece8d9] hover:bg-[#faf8ee]',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200',
                isHomePage
                  ? 'border-[#f2cf82] bg-[#ffe1ad] text-[#bb8033] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(201,156,74,0.24)]'
                  : 'border-transparent bg-[#f6f3ea] text-[#98a08d]',
              )}
            >
              <Home className="h-4.5 w-4.5" />
            </div>
          </Link>

          <Link
            href={lessonsHref}
            aria-label="학생 수업"
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center rounded-[1.2rem] border px-1.5 py-1.5 transition-all duration-200',
              isLessonsPage
                ? 'border-[#d8e9b7] bg-[linear-gradient(180deg,rgba(246,252,227,0.99)_0%,rgba(229,244,193,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_18px_rgba(143,182,98,0.22)]'
                : 'border-transparent hover:border-[#ece8d9] hover:bg-[#faf8ee]',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200',
                isLessonsPage
                  ? 'border-[#f5d985] bg-[#fff1b4] text-[#d79d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_8px_18px_rgba(220,177,70,0.24)]'
                  : 'border-transparent bg-[#f6f3ea] text-[#98a08d]',
              )}
            >
              <BookOpen className="h-4.5 w-4.5" />
            </div>
          </Link>

          <Link
            href={profileHref}
            aria-label="학생 내상태"
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center rounded-[1.2rem] border px-1.5 py-1.5 transition-all duration-200',
              isProfilePage
                ? 'border-[#d7e7f6] bg-[linear-gradient(180deg,rgba(244,249,255,0.99)_0%,rgba(229,240,255,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(133,162,205,0.18)]'
                : 'border-transparent hover:border-[#ece8d9] hover:bg-[#faf8ee]',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200',
                isProfilePage
                  ? 'border-[#cfe0f6] bg-[#eaf3ff] text-[#5d79ab] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(133,162,205,0.2)]'
                  : 'border-transparent bg-[#f6f3ea] text-[#98a08d]',
              )}
            >
              <User className="h-4.5 w-4.5" />
            </div>
          </Link>
        </div>
      </nav>

      <StudentEnrollmentRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        title="새 수업 요청"
        description="원하는 수업과 월을 고르면 운영 쪽에서 확인 후 수업 탭에서 바로 이어볼 수 있게 준비합니다."
      />
    </>
  )
}
