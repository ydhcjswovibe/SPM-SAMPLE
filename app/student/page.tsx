'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { AlertCircle, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { readStudentClassDetail, type StudentClassDetail, type StudentClassSummary } from '@/lib/weekly-media'
import {
  fetchStudentSummaries,
  getFeaturedSummary,
  getVisibleYearMonths,
  readSelectedSummary,
  studentAuthRequiredMessage,
} from '@/lib/student-lessons'
import { SpmMascot } from '@/components/spm-mascot'
import { StudentClassDetailView } from '@/components/student-class-detail-view'
import { StudentEnrollmentRequestCard } from '@/components/student-enrollment-request-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const supabase = createClient()

async function fetchStudentClassDetail(
  classId: string,
  yearMonth: string,
): Promise<StudentClassDetail | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(studentAuthRequiredMessage)
  }

  return readStudentClassDetail(supabase, user.id, classId, yearMonth)
}

function getFriendlyStudentMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '수업 목록을 다시 불러오지 못했습니다.'
  }

  if (error.message === studentAuthRequiredMessage) {
    return studentAuthRequiredMessage
  }

  return '수업 목록을 다시 불러오지 못했습니다.'
}

function getFriendlyStudentDetailMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '선택한 수업 상세를 다시 불러오지 못했습니다.'
  }

  if (error.message === studentAuthRequiredMessage) {
    return studentAuthRequiredMessage
  }

  return '선택한 수업 상세를 다시 불러오지 못했습니다.'
}

function getNextWeekLabel(summary: StudentClassSummary) {
  if (summary.enrollmentStatus === 'PENDING' && summary.availableWeekCount === 0) {
    return '곧 시작'
  }

  if (summary.nextWeekNumber) {
    return `${summary.nextWeekNumber}주차`
  }

  return '대기'
}

export default function StudentDashboard() {
  const searchParams = useSearchParams()
  const {
    data: summaries,
    error,
    isLoading,
  } = useSWR('student-class-summaries', () => fetchStudentSummaries(supabase))

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
    const needsLogin = error instanceof Error && error.message === studentAuthRequiredMessage

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
      <div className="space-y-4 px-4 pb-28 pt-4">
        <Card className="overflow-hidden rounded-[2rem] border border-[rgba(23,33,42,0.08)] bg-white/96 py-0 shadow-[0_24px_64px_rgba(21,28,38,0.1)]">
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#eef8f4]">
              <SpmMascot variant="welcome" size="sm" className="h-9 w-9" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8390]">
                수업 준비
              </p>
              <h2 className="spm-display text-3xl text-[#17212a]">아직 볼 수 있는 수업이 없어요.</h2>
              <p className="mx-auto max-w-sm text-sm leading-6 text-[#66707b]">
                아직 배정된 수업이 없다면 아래에서 원하는 수업과 월을 골라 승인 요청을 보낼 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
        <StudentEnrollmentRequestCard
          title="첫 수업 신청"
          description="원하는 수업과 월을 먼저 고르면 운영 쪽에서 확인 후 등록 예정 상태로 바로 올려 둡니다."
        />
      </div>
    )
  }

  if (!selectedSummary) {
    return null
  }

  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      <section className="rounded-[1.9rem] border border-[rgba(23,33,42,0.08)] bg-white px-4 py-4 shadow-[0_18px_48px_rgba(21,28,38,0.1)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-3 py-2 text-sm text-[#17212a]">
            <span className="text-[11px] font-semibold text-[#7a8390]">다음</span>
            <span className="font-semibold">{getNextWeekLabel(selectedSummary)}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-3 py-2 text-sm text-[#17212a]">
            <span className="text-[11px] font-semibold text-[#7a8390]">결제</span>
            <span className="font-semibold">
              {selectedSummary.paymentStatus ? '완료' : '미완료'}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-3 py-2 text-sm text-[#17212a]">
            <span className="text-[11px] font-semibold text-[#7a8390]">공개</span>
            <span className="font-semibold">{selectedSummary.availableWeekCount}개</span>
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
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/student/profile#enrollment-request">수업 신청</Link>
          </Button>
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
