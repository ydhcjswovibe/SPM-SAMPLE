'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { AlertCircle, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import {
  formatYearMonthLabel,
  readStudentClassDetail,
  readStudentClassSummaries,
  type StudentClassDetail,
  type StudentClassSummary,
} from '@/lib/weekly-media'
import { SpmMascot } from '@/components/spm-mascot'
import { StudentClassDetailView } from '@/components/student-class-detail-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const supabase = createClient()
const authRequiredMessage = '로그인이 필요합니다.'

async function fetchStudentSummaries(): Promise<StudentClassSummary[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(authRequiredMessage)
  }

  return readStudentClassSummaries(supabase, user.id)
}

async function fetchStudentClassDetail(
  classId: string,
  yearMonth: string,
): Promise<StudentClassDetail | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(authRequiredMessage)
  }

  return readStudentClassDetail(supabase, user.id, classId, yearMonth)
}

function getFriendlyStudentMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '수업 목록을 다시 불러오지 못했습니다.'
  }

  if (error.message === authRequiredMessage) {
    return authRequiredMessage
  }

  return '수업 목록을 다시 불러오지 못했습니다.'
}

function getFriendlyStudentDetailMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '선택한 수업 상세를 다시 불러오지 못했습니다.'
  }

  if (error.message === authRequiredMessage) {
    return authRequiredMessage
  }

  return '선택한 수업 상세를 다시 불러오지 못했습니다.'
}

function getEnrollmentLabel(status: StudentClassSummary['enrollmentStatus']) {
  return status === 'PENDING' ? '등록 예정' : '수강 중'
}

function getFeaturedSummary(summaries: StudentClassSummary[]) {
  return (
    summaries.find((item) => item.enrollmentStatus === 'ACTIVE' && item.nextWeekNumber !== null) ??
    summaries.find((item) => item.enrollmentStatus === 'ACTIVE') ??
    summaries[0]
  )
}

function getSummaryDescription(summary: StudentClassSummary) {
  if (summary.enrollmentStatus === 'PENDING' && summary.availableWeekCount === 0) {
    return '아직 시작 전인 수업입니다. 공개되면 아래에서 바로 볼 수 있어요.'
  }

  if (summary.nextWeekNumber) {
    return `${summary.nextWeekNumber}주차부터 바로 이어서 볼 수 있어요.`
  }

  if (summary.availableWeekCount > 0) {
    return '공개된 주차를 아래에서 바로 확인할 수 있어요.'
  }

  return '현재 공개된 콘텐츠는 없지만, 등록 상태와 진행 상황은 이 화면에서 계속 확인할 수 있어요.'
}

function getVisibleYearMonths(summaries: StudentClassSummary[]) {
  return Array.from(new Set(summaries.map((item) => item.yearMonth))).sort((left, right) =>
    right.localeCompare(left),
  )
}

function readSelectedSummary(
  summaries: StudentClassSummary[],
  classId: string | null,
  yearMonth: string | null,
) {
  return (
    summaries.find((item) => item.classId === classId && item.yearMonth === yearMonth) ??
    getFeaturedSummary(summaries)
  )
}

export default function StudentDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    data: summaries,
    error,
    isLoading,
  } = useSWR('student-class-summaries', fetchStudentSummaries)

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
  const selectedProgressPercent =
    selectedSummary && selectedSummary.attendanceTotal > 0
      ? Math.round((selectedSummary.attendanceChecked / selectedSummary.attendanceTotal) * 100)
      : 0

  const {
    data: selectedDetail,
    error: detailError,
    isLoading: isDetailLoading,
  } = useSWR(
    selectedSummary
      ? ['student-class-detail', selectedSummary.classId, selectedSummary.yearMonth]
      : null,
    ([, classId, yearMonth]) => fetchStudentClassDetail(classId, yearMonth),
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[65dvh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[rgba(23,33,42,0.08)] bg-white shadow-[0_14px_30px_rgba(21,28,38,0.08)]">
          <SpmMascot size="sm" className="h-8 w-8" />
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6f7883]">
          <Loader2 className="h-4 w-4 animate-spin" />
          수업 목록을 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (error) {
    const needsLogin = error instanceof Error && error.message === authRequiredMessage

    return (
      <div className="px-4 pb-28 pt-4">
        <Card className="overflow-hidden rounded-[1.8rem] border border-[rgba(214,104,96,0.26)] bg-[#fff3f1] py-0 shadow-[0_22px_50px_rgba(184,86,70,0.08)]">
          <CardContent className="flex flex-col items-start gap-4 p-5 text-sm text-[#b65046]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">학생 수업 화면을 다시 불러오지 못했습니다.</p>
                <p className="text-[#b65046]/80">{getFriendlyStudentMessage(error)}</p>
              </div>
            </div>
            {needsLogin ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">다시 로그인하기</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!summaries || summaries.length === 0) {
    return (
      <div className="px-4 pb-28 pt-4">
        <Card className="overflow-hidden rounded-[2rem] border border-[rgba(23,33,42,0.08)] bg-white/96 py-0 shadow-[0_24px_64px_rgba(21,28,38,0.1)]">
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#eef8f4]">
              <SpmMascot variant="welcome" size="sm" className="h-9 w-9" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8390]">
                Ready To Start
              </p>
              <h2 className="spm-display text-3xl text-[#17212a]">아직 열어볼 수 있는 수업이 없어요.</h2>
              <p className="mx-auto max-w-sm text-sm leading-6 text-[#66707b]">
                등록이 완료되면 이 화면에서 월별 수업과 주차 콘텐츠를 바로 이어서 확인할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedSummary) {
    return null
  }

  const resolvedSummaries = summaries
  const activeSummary = selectedSummary

  function replaceSelection(nextSummary: StudentClassSummary) {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('classId', nextSummary.classId)
    nextParams.set('yearMonth', nextSummary.yearMonth)
    router.replace(`/student?${nextParams.toString()}`, { scroll: false })
  }

  function handleClassChange(classId: string) {
    const nextSummary = monthSummaries.find((item) => item.classId === classId)
    if (!nextSummary) {
      return
    }

    replaceSelection(nextSummary)
  }

  function handleMonthChange(yearMonth: string) {
    const nextMonthSummaries = resolvedSummaries.filter((item) => item.yearMonth === yearMonth)
    if (nextMonthSummaries.length === 0) {
      return
    }

    const nextSummary =
      nextMonthSummaries.find((item) => item.classId === activeSummary.classId) ??
      getFeaturedSummary(nextMonthSummaries)

    replaceSelection(nextSummary)
  }

  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      <section className="sticky top-[5.2rem] z-20">
        <div className="rounded-[1.8rem] border border-[rgba(23,33,42,0.08)] bg-white/95 px-4 py-4 shadow-[0_18px_48px_rgba(21,28,38,0.1)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[#eef8f4]">
                <SpmMascot size="sm" className="h-7 w-7" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8390]">
                  Student Lessons
                </p>
                <h1 className="spm-display text-[2rem] leading-none text-[#17212a]">수업</h1>
              </div>
            </div>

            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:ml-auto lg:max-w-[26rem]">
              <div className="min-w-0">
                <Select value={selectedSummary.classId} onValueChange={handleClassChange}>
                  <SelectTrigger className="h-12 rounded-[1rem] border-[rgba(23,33,42,0.08)] bg-[#fbfaf7] text-left text-[#17212a]">
                    <SelectValue placeholder="수업 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthSummaries.map((summary) => (
                      <SelectItem key={summary.classId} value={summary.classId}>
                        {summary.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0">
                <Select value={selectedSummary.yearMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="h-12 rounded-[1rem] border-[rgba(23,33,42,0.08)] bg-[#fbfaf7] text-left text-[#17212a]">
                    <SelectValue placeholder="월 선택" />
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
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.9rem] border border-[rgba(23,33,42,0.08)] bg-white px-4 py-4 shadow-[0_18px_48px_rgba(21,28,38,0.1)]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                selectedSummary.enrollmentStatus === 'PENDING'
                  ? 'border-[#d9e4ff] bg-[#f1f5ff] text-[#4e73c5]'
                  : 'border-[#cbe8df] bg-[#eff9f5] text-[#1d4e46]'
              )}
            >
              {getEnrollmentLabel(selectedSummary.enrollmentStatus)}
            </Badge>
            <Badge className="border-[rgba(23,33,42,0.1)] bg-white text-[#4f5864]">
              {formatYearMonthLabel(selectedSummary.yearMonth)}
            </Badge>
            <h2 className="truncate text-base font-semibold text-[#17212a]">
              {selectedSummary.className}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-3 py-2 text-sm text-[#17212a]">
              <span className="text-[11px] font-semibold text-[#7a8390]">다음</span>
              <span className="font-semibold">
                {selectedSummary.nextWeekNumber ? `${selectedSummary.nextWeekNumber}주차` : '대기'}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-3 py-2 text-sm text-[#17212a]">
              <span className="text-[11px] font-semibold text-[#7a8390]">결제</span>
              <span className="font-semibold">
                {selectedSummary.paymentStatus ? '완료' : '미완료'}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-3 py-2 text-sm text-[#17212a]">
              <span className="text-[11px] font-semibold text-[#7a8390]">공개</span>
              <span className="font-semibold">
                {selectedSummary.availableWeekCount}개
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-3 py-2 text-sm text-[#17212a]">
              <span className="text-[11px] font-semibold text-[#7a8390]">피드백</span>
              <span className="font-semibold">{selectedSummary.feedbackCount}건</span>
            </div>
            <div className="flex min-w-[16rem] flex-1 items-center gap-3 rounded-full border border-[rgba(23,33,42,0.06)] bg-[#fbfaf7] px-3 py-2">
              <div className="shrink-0 text-sm">
                <span className="text-[11px] font-semibold text-[#7a8390]">출석</span>{' '}
                <span className="font-semibold text-[#17212a]">
                  {selectedSummary.attendanceChecked}/{selectedSummary.attendanceTotal}
                </span>
              </div>
              <Progress
                value={selectedProgressPercent}
                className="h-2.5 flex-1 border border-[rgba(23,33,42,0.08)] bg-[#ebece6]"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(23,33,42,0.06)] bg-white px-3 py-2 text-sm text-[#66707b]">
              <span className="text-[11px] font-semibold text-[#7a8390]">상태</span>
              <span>{getSummaryDescription(selectedSummary)}</span>
            </div>
          </div>
        </div>
      </section>

      {isDetailLoading ? (
        <Card className="overflow-hidden rounded-[1.9rem] border border-[rgba(23,33,42,0.08)] bg-white py-0 shadow-[0_18px_50px_rgba(21,28,38,0.1)]">
          <CardContent className="flex items-center gap-3 px-5 py-6 text-sm text-[#66707b]">
            <Loader2 className="h-4 w-4 animate-spin" />
            선택한 수업의 주차 콘텐츠를 불러오는 중입니다.
          </CardContent>
        </Card>
      ) : detailError ? (
        <Card className="overflow-hidden rounded-[1.8rem] border border-[rgba(214,104,96,0.26)] bg-[#fff3f1] py-0 shadow-[0_22px_50px_rgba(184,86,70,0.08)]">
          <CardContent className="flex flex-col items-start gap-4 p-5 text-sm text-[#b65046]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">선택한 수업 상세를 다시 불러오지 못했습니다.</p>
                <p className="text-[#b65046]/80">{getFriendlyStudentDetailMessage(detailError)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : selectedDetail ? (
        <StudentClassDetailView
          key={`${selectedDetail.classId}:${selectedDetail.yearMonth}`}
          detail={selectedDetail}
        />
      ) : (
        <Card className="overflow-hidden rounded-[1.9rem] border border-[rgba(23,33,42,0.08)] bg-white py-0 shadow-[0_18px_50px_rgba(21,28,38,0.1)]">
          <CardContent className="px-5 py-12 text-center">
            <p className="text-base font-semibold text-[#17212a]">선택한 수업 정보를 찾지 못했습니다.</p>
            <p className="mt-2 text-sm leading-6 text-[#66707b]">
              다른 수업을 선택하거나, 등록 상태를 확인한 뒤 다시 시도해 주세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
