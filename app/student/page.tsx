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
const summaryValueSeparator = '::'

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
    return '아직 시작 전인 수업입니다. 콘텐츠가 공개되면 이 자리에서 바로 이어서 볼 수 있어요.'
  }

  if (summary.nextWeekNumber) {
    return `${summary.nextWeekNumber}주차부터 바로 이어서 볼 수 있어요. 위에서 수업을 바꾸면 같은 화면에서 계속 볼 수 있습니다.`
  }

  if (summary.availableWeekCount > 0) {
    return '현재 공개된 주차를 확인할 수 있어요. 같은 화면에서 주차와 콘텐츠를 바로 이어서 볼 수 있습니다.'
  }

  return '현재 공개된 콘텐츠는 없지만, 등록 상태와 진행 상황은 이 화면에서 계속 확인할 수 있어요.'
}

function buildSummaryValue(summary: StudentClassSummary) {
  return `${summary.classId}${summaryValueSeparator}${summary.yearMonth}`
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

  const selectedSummary =
    summaries && summaries.length > 0
      ? readSelectedSummary(summaries, searchParams.get('classId'), searchParams.get('yearMonth'))
      : null
  const selectedValue = selectedSummary ? buildSummaryValue(selectedSummary) : ''
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

  const activeCount = summaries.filter((item) => item.enrollmentStatus === 'ACTIVE').length
  const pendingCount = summaries.filter((item) => item.enrollmentStatus === 'PENDING').length
  const totalFeedbackCount = summaries.reduce((sum, item) => sum + item.feedbackCount, 0)

  function handleSummaryChange(value: string) {
    const [classId, yearMonth] = value.split(summaryValueSeparator)
    if (!classId || !yearMonth) {
      return
    }

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set('classId', classId)
    nextParams.set('yearMonth', yearMonth)
    router.replace(`/student?${nextParams.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-6 px-4 pb-28 pt-4">
      <section className="overflow-hidden rounded-[2.35rem] bg-[#18212a] px-5 py-5 text-white shadow-[0_30px_80px_rgba(13,18,24,0.22)]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7dd2c2]/16">
              <SpmMascot size="sm" className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
              Student Home
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="spm-display max-w-[9ch] text-[2.5rem] leading-[0.94] text-white">
              수업은 여기서 바로 이어서 보면 돼요
            </h1>
            <p className="max-w-md text-sm leading-6 text-white/72">
              위에서 수업을 바꾸고, 같은 화면 안에서 주차와 콘텐츠를 바로 이어서 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-white/86">
              수강 중 {activeCount}
            </span>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-white/86">
              등록 예정 {pendingCount}
            </span>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-white/86">
              피드백 {totalFeedbackCount}
            </span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[rgba(23,33,42,0.08)] bg-white shadow-[0_22px_60px_rgba(21,28,38,0.1)]">
        <div className="space-y-5 px-5 py-5">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8390]">
              Lesson Space
            </p>
            <h2 className="spm-display text-2xl text-[#17212a]">지금 볼 수업</h2>
            <p className="text-sm leading-6 text-[#66707b]">
              월별 수업을 상단에서 바꾸면, 선택된 수업의 상태와 주차 콘텐츠가 같은 화면에서 바로 전환됩니다.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#7a8390]">수업 선택</p>
              <Select value={selectedValue} onValueChange={handleSummaryChange}>
                <SelectTrigger className="h-12 rounded-[1rem] border-[rgba(23,33,42,0.08)] bg-[#fbfaf7] text-left text-[#17212a]">
                  <SelectValue placeholder="수업을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {summaries.map((summary) => (
                    <SelectItem key={buildSummaryValue(summary)} value={buildSummaryValue(summary)}>
                      {summary.className} · {formatYearMonthLabel(summary.yearMonth)} · {getEnrollmentLabel(summary.enrollmentStatus)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-[#7a8390]">
                현재 등록된 월별 수업을 바로 바꿔 볼 수 있습니다.
              </p>
            </div>

            <div className="rounded-[1.6rem] bg-[#f7f4ee] px-4 py-4">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[#7a8390]">현재 선택</p>
              <p className="mt-3 text-sm font-semibold text-[#17212a]">{formatYearMonthLabel(selectedSummary.yearMonth)}</p>
              <p className="mt-1 text-sm leading-6 text-[#66707b]">
                {selectedSummary.nextWeekNumber
                  ? `${selectedSummary.nextWeekNumber}주차부터 바로 볼 수 있어요.`
                  : selectedSummary.availableWeekCount > 0
                    ? '공개된 주차를 바로 확인할 수 있어요.'
                    : '아직 공개된 콘텐츠는 없지만 상태는 여기서 확인할 수 있어요.'}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-[#18212a] px-5 py-5 text-white shadow-[0_24px_64px_rgba(13,18,24,0.18)]">
            <div className="space-y-4">
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
                <Badge className="border border-white/10 bg-white/8 text-white">
                  {formatYearMonthLabel(selectedSummary.yearMonth)}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="spm-display max-w-[10ch] text-[2.2rem] leading-[0.96] text-white">
                  {selectedSummary.className}
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-white/72">
                  {getSummaryDescription(selectedSummary)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.35rem] bg-white/8 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/68">결제</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {selectedSummary.paymentStatus ? '완료' : '미완료'}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-white/8 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/68">공개 주차</p>
                  <p className="mt-2 text-base font-semibold text-white">{selectedSummary.availableWeekCount}개</p>
                </div>
                <div className="rounded-[1.35rem] bg-white/8 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/68">피드백</p>
                  <p className="mt-2 text-base font-semibold text-white">{selectedSummary.feedbackCount}건</p>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold text-white/72">
                  <span>출석 진행</span>
                  <span>
                    {selectedSummary.attendanceChecked}/{selectedSummary.attendanceTotal}
                  </span>
                </div>
                <Progress
                  value={selectedProgressPercent}
                  className="h-3.5 border border-white/10 bg-white/10"
                />
              </div>
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
