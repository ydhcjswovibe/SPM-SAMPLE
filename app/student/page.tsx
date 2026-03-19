'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { AlertCircle, ArrowRight, BookHeart, Gift, Loader2, MessageCircleMore, Sparkles } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel, readStudentClassDetail, type StudentClassDetail, type StudentClassSummary } from '@/lib/weekly-media'
import {
  fetchStudentSummaries,
  getFeaturedSummary,
  getVisibleYearMonths,
  readSelectedSummary,
  studentAuthRequiredMessage,
} from '@/lib/student-lessons'
import { SpmMascot } from '@/components/spm-mascot'
import { StudentClassDetailView } from '@/components/student-class-detail-view'
import { StudentEnrollmentRequestDialog } from '@/components/student-enrollment-request-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const supabase = createClient()
const STUDENT_REFRESH_INTERVAL_MS = 5000

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
    return '승인 대기'
  }

  if (summary.nextWeekNumber) {
    return `${summary.nextWeekNumber}주차 열기 전`
  }

  if (summary.enrollmentStatus === 'ACTIVE') {
    return '새 콘텐츠 기다리는 중'
  }

  return '대기 중'
}

function getEnrollmentStatusLabel(summary: StudentClassSummary) {
  return summary.enrollmentStatus === 'PENDING' ? '등록 예정' : '수강 중'
}

function scrollToStudentDetail() {
  if (typeof window === 'undefined') {
    return
  }

  document.getElementById('student-detail')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

export default function StudentDashboard() {
  const searchParams = useSearchParams()
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const {
    data: summaries,
    error,
    isLoading,
  } = useSWR('student-class-summaries', () => fetchStudentSummaries(supabase), {
    refreshInterval: STUDENT_REFRESH_INTERVAL_MS,
  })

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
      ? ['student-class-detail', selectedSummary.classId, selectedSummary.yearMonth, selectedSummary.enrollmentStatus]
      : null,
    ([, classId, yearMonth]) => fetchStudentClassDetail(classId, yearMonth),
    {
      refreshInterval: STUDENT_REFRESH_INTERVAL_MS,
    },
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[65dvh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.7rem] bg-white/88 shadow-[0_16px_24px_rgba(90,118,58,0.16)]">
          <SpmMascot size="sm" className="h-10 w-10" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#4d6434]">
          <Loader2 className="h-4 w-4 animate-spin" />
          수업 숲을 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (error) {
    const needsLogin = error instanceof Error && error.message === studentAuthRequiredMessage

    return (
      <div className="px-3 pb-28 pt-3">
        <Card className="overflow-hidden rounded-[2rem] border border-[rgba(214,104,96,0.26)] bg-[#fff6f2] py-0 shadow-[0_18px_36px_rgba(184,86,70,0.1)]">
          <CardContent className="flex flex-col items-start gap-3 p-4 text-sm text-[#b65046]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">학생 수업 화면을 다시 불러오지 못했습니다.</p>
                <p className="text-[#b65046]/80">{getFriendlyStudentMessage(error)}</p>
              </div>
            </div>
            {needsLogin ? (
              <Button asChild variant="outline" size="sm" className="rounded-full bg-white">
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
      <div className="space-y-4 px-3 pb-28 pt-3">
        <section className="relative overflow-hidden rounded-[2.35rem] border border-[#9ec96e] bg-[linear-gradient(180deg,#cde8fb_0%,#dbeec9_38%,#89bf58_100%)] px-4 pb-5 pt-4 shadow-[0_20px_48px_rgba(90,118,58,0.2)]">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[#76b14d]" />
          <div className="absolute -left-6 bottom-5 h-16 w-24 rounded-full bg-[#679a42]" />
          <div className="absolute right-0 bottom-6 h-20 w-28 rounded-full bg-[#84bd58]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold text-[#4d6434]">
              첫 수업을 기다리고 있어요
            </div>
            <div className="mt-5 flex h-28 w-28 items-center justify-center rounded-full bg-white/30">
              <SpmMascot variant="welcome" size="lg" className="h-24 w-24" />
            </div>
            <h2 className="mt-4 text-[1.85rem] font-black tracking-[-0.03em] text-white drop-shadow-[0_4px_10px_rgba(58,78,34,0.24)]">
              아직 볼 수 있는 수업이 없어요
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/88">
              원하는 수업과 월을 골라 두면 운영 쪽에서 확인하고 바로 등록 예정 상태로 올려 둘 수 있어요.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#dce7c1] bg-[#f8fbe9] p-4 shadow-[0_16px_32px_rgba(90,118,58,0.12)]">
          <Button
            onClick={() => setIsRequestDialogOpen(true)}
            className="h-12 w-full gap-2 rounded-[1.4rem] border-[#75bf4e] bg-[#7ac454] text-base font-bold text-white shadow-[0_10px_18px_rgba(113,182,73,0.26)] hover:bg-[#84cc5d]"
          >
            <Gift className="h-4 w-4" />
            첫 수업 신청
          </Button>
        </section>

        <StudentEnrollmentRequestDialog
          open={isRequestDialogOpen}
          onOpenChange={setIsRequestDialogOpen}
          title="첫 수업 신청"
          description="원하는 수업과 월을 먼저 고르면 운영 쪽에서 확인 후 등록 예정 상태로 바로 올려 둡니다."
        />
      </div>
    )
  }

  if (!selectedSummary) {
    return null
  }

  const routineCards = [
    {
      key: 'attendance',
      icon: BookHeart,
      title: '출석 흔적 챙기기',
      description: `${selectedSummary.attendanceChecked}/${selectedSummary.attendanceTotal}주차를 확인했어요`,
      tone: 'bg-[#fff5bf] text-[#ce8f15]',
      done: selectedSummary.attendanceTotal > 0 && selectedSummary.attendanceChecked >= selectedSummary.attendanceTotal,
      actionLabel: '주차 열기',
      onClick: scrollToStudentDetail,
    },
    {
      key: 'content',
      icon: Sparkles,
      title: '열린 콘텐츠 둘러보기',
      description:
        selectedSummary.availableWeekCount > 0
          ? `${selectedSummary.availableWeekCount}개 주차가 열려 있어요`
          : '아직 열린 콘텐츠가 없어요',
      tone: 'bg-[#e6f5ff] text-[#4c82c8]',
      done: selectedSummary.availableWeekCount > 0,
      actionLabel: '열기',
      onClick: scrollToStudentDetail,
    },
    {
      key: 'feedback',
      icon: MessageCircleMore,
      title: '피드백 확인하기',
      description:
        selectedSummary.feedbackCount > 0
          ? `${selectedSummary.feedbackCount}건이 도착했어요`
          : '새 피드백을 기다리고 있어요',
      tone: 'bg-[#ffe8f0] text-[#d86f8c]',
      done: selectedSummary.feedbackCount > 0,
      actionLabel: '보기',
      onClick: scrollToStudentDetail,
    },
    {
      key: 'request',
      icon: Gift,
      title: '새 수업 미리 담아두기',
      description: '추가로 듣고 싶은 수업이 있으면 바로 요청할 수 있어요',
      tone: 'bg-[#eef8dc] text-[#65a03b]',
      done: false,
      actionLabel: '요청',
      onClick: () => setIsRequestDialogOpen(true),
    },
  ]

  const remainingRoutineCount = routineCards
    .filter((item) => item.key !== 'request' && !item.done)
    .length

  return (
    <div className="space-y-4 px-3 pb-28 pt-3">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-[#9cc96d] bg-[linear-gradient(180deg,#cfe9fb_0%,#dfeec8_36%,#88bf58_100%)] px-4 pb-5 pt-4 shadow-[0_20px_48px_rgba(90,118,58,0.2)]">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[#77b24e]" />
        <div className="absolute -left-6 bottom-4 h-16 w-28 rounded-full bg-[#6ba146]" />
        <div className="absolute left-1/2 bottom-1 h-24 w-36 -translate-x-1/2 rounded-full bg-[#5f953c]" />
        <div className="absolute right-0 bottom-7 h-20 w-32 rounded-full bg-[#8bc35b]" />
        <div className="absolute right-6 top-5 h-10 w-10 rounded-full bg-white/28" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/76 px-3 py-1 text-[11px] font-semibold text-[#4d6434] shadow-[0_6px_12px_rgba(90,118,58,0.08)]">
              {formatYearMonthLabel(selectedSummary.yearMonth)}
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/82">이번 수업 모험</p>
            <h1 className="mt-1 text-[1.95rem] font-black tracking-[-0.04em] text-white drop-shadow-[0_4px_12px_rgba(58,78,34,0.24)]">
              {selectedSummary.className}
            </h1>
            <p className="mt-1 text-sm font-medium text-white/85">{getNextWeekLabel(selectedSummary)}</p>
          </div>

          <div className="rounded-[1.3rem] bg-white/82 px-3 py-2 text-right shadow-[0_8px_14px_rgba(90,118,58,0.08)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8f7b]">상태</p>
            <p className="mt-1 text-sm font-bold text-[#45522f]">{getEnrollmentStatusLabel(selectedSummary)}</p>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/25 blur-md" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/30">
              <SpmMascot variant="welcome" size="lg" className="h-24 w-24" />
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold text-white/88">오늘도 한 칸씩 수업 숲을 걸어가요</p>
        </div>

        <div className="relative z-10 mt-5 rounded-[1.9rem] bg-[#87bf56] px-4 py-4 text-white shadow-[0_16px_28px_rgba(90,118,58,0.16)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0a9] text-[#e89f1d]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">이번 달 진척</p>
                <p className="text-sm font-bold">{selectedProgressPercent}% 채웠어요</p>
              </div>
            </div>
            <div className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-semibold">
              남은 체크 {remainingRoutineCount}개
            </div>
          </div>

          <Progress
            value={selectedProgressPercent}
            className="mt-3 h-3 border border-white/15 bg-white/30 [&>div]:bg-[#ffd44f]"
          />

          <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-[1.25rem] bg-white/14 px-2 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">출석</p>
              <p className="mt-1 text-base font-black">
                {selectedSummary.attendanceChecked}/{selectedSummary.attendanceTotal}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/14 px-2 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">공개</p>
              <p className="mt-1 text-base font-black">{selectedSummary.availableWeekCount}개</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/14 px-2 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">피드백</p>
              <p className="mt-1 text-base font-black">{selectedSummary.feedbackCount}건</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2.1rem] border border-[#d7e6bd] bg-[#eff8d9] p-3 shadow-[0_16px_32px_rgba(90,118,58,0.12)]">
        <div className="rounded-[1.8rem] bg-white/76 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8d61]">오늘의 체크리스트</p>
              <h2 className="mt-1 text-[1.45rem] font-black tracking-[-0.03em] text-[#334223]">
                천천히 한 칸씩 채워봐요
              </h2>
            </div>
            <div className="rounded-full bg-[#fff3b5] px-3 py-1.5 text-sm font-bold text-[#a77a1f]">
              {remainingRoutineCount}개 남음
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {routineCards.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full items-center gap-3 rounded-[1.6rem] border border-[#edf2de] bg-white px-3 py-3 text-left shadow-[0_10px_18px_rgba(90,118,58,0.08)] transition hover:-translate-y-0.5"
                >
                  <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.3rem]', item.tone)}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-[#304023]">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-[#738264]">{item.description}</p>
                  </div>
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.1rem] border text-sm font-bold',
                      item.done
                        ? 'border-[#d6efc5] bg-[#eef8dc] text-[#69a13d]'
                        : 'border-[#ecebe3] bg-[#f5f4ef] text-[#8e9686]',
                    )}
                  >
                    {item.done ? '✓' : <ArrowRight className="h-4 w-4" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section
        id="student-detail"
        className="rounded-[2.1rem] border border-[#d9e5c1] bg-[#f8faef] p-3 shadow-[0_16px_32px_rgba(90,118,58,0.12)]"
      >
        <div className="rounded-[1.8rem] bg-white/84 px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#82926c]">이번 달 수업 카드</p>
              <h2 className="mt-1 text-[1.45rem] font-black tracking-[-0.03em] text-[#334223]">
                {selectedSummary.className}
              </h2>
            </div>
            <div className="rounded-full bg-[#eef7dc] px-3 py-1.5 text-sm font-semibold text-[#5f7b38]">
              {formatYearMonthLabel(selectedSummary.yearMonth)}
            </div>
          </div>

          {isDetailLoading ? (
            <Card className="overflow-hidden rounded-[1.8rem] border border-[#dce8c4] bg-white py-0 shadow-[0_12px_24px_rgba(90,118,58,0.08)]">
              <CardContent className="flex items-center gap-3 px-4 py-5 text-sm text-[#66775b]">
                <Loader2 className="h-4 w-4 animate-spin" />
                선택한 수업의 주차 콘텐츠를 불러오는 중입니다.
              </CardContent>
            </Card>
          ) : detailError ? (
            <Card className="overflow-hidden rounded-[1.8rem] border border-[rgba(214,104,96,0.26)] bg-[#fff6f2] py-0 shadow-[0_18px_36px_rgba(184,86,70,0.08)]">
              <CardContent className="flex flex-col items-start gap-3 p-4 text-sm text-[#b65046]">
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
              key={`${selectedDetail.classId}:${selectedDetail.yearMonth}:${selectedDetail.enrollmentStatus}`}
              detail={selectedDetail}
            />
          ) : (
            <Card className="overflow-hidden rounded-[1.8rem] border border-[#dce8c4] bg-white py-0 shadow-[0_12px_24px_rgba(90,118,58,0.08)]">
              <CardContent className="px-4 py-10 text-center">
                <p className="text-base font-semibold text-[#334223]">선택한 수업 정보를 찾지 못했습니다.</p>
                <p className="mt-2 text-sm leading-6 text-[#66775b]">
                  다른 수업을 선택하거나, 등록 상태를 확인한 뒤 다시 시도해 주세요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <StudentEnrollmentRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        title="새 수업 요청"
        description="추가로 듣고 싶은 수업이 있다면 여기서 바로 승인 요청을 보낼 수 있습니다."
      />
    </div>
  )
}
