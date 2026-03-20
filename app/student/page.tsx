'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'
import { AlertCircle, ArrowRight, BookHeart, Gift, Loader2, MessageCircleMore, Sparkles } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel, type StudentClassSummary } from '@/lib/weekly-media'
import {
  buildStudentSelectionHref,
  fetchStudentSummaries,
  getStudentEnrollmentStatusLabel,
  getStudentNextWeekLabel,
  resolveStudentSelection,
  studentAuthRequiredMessage,
} from '@/lib/student-lessons'
import { SpmMascot } from '@/components/spm-mascot'
import { StudentEnrollmentRequestDialog } from '@/components/student-enrollment-request-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const supabase = createClient()
const STUDENT_REFRESH_INTERVAL_MS = 5000

function getFriendlyStudentMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '수업 목록을 다시 불러오지 못했습니다.'
  }

  if (error.message === studentAuthRequiredMessage) {
    return studentAuthRequiredMessage
  }

  return '수업 목록을 다시 불러오지 못했습니다.'
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const {
    data: summaries,
    error,
    isLoading,
  } = useSWR('student-class-summaries', () => fetchStudentSummaries(supabase), {
    refreshInterval: STUDENT_REFRESH_INTERVAL_MS,
  })

  const { selectedSummary } = summaries
    ? resolveStudentSelection(summaries, searchParams.get('classId'), searchParams.get('yearMonth'))
    : { selectedSummary: null }

  const selectedProgressPercent =
    selectedSummary && selectedSummary.attendanceTotal > 0
      ? Math.round((selectedSummary.attendanceChecked / selectedSummary.attendanceTotal) * 100)
      : 0

  function openSelectedLessons(summary: StudentClassSummary | null) {
    if (!summary) {
      return
    }

    router.push(buildStudentSelectionHref('/student/lessons', summary.classId, summary.yearMonth))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[65dvh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.7rem] bg-white/92 shadow-[0_16px_24px_rgba(111,145,72,0.12)]">
          <SpmMascot size="sm" className="h-10 w-10" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#5a7440]">
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
                <p className="font-bold">학생 홈을 다시 불러오지 못했습니다.</p>
                <p className="text-[rgba(182,80,70,0.8)]">{getFriendlyStudentMessage(error)}</p>
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
        <section className="relative overflow-hidden rounded-[2.45rem] border border-[#dfe8d2] bg-[linear-gradient(180deg,rgba(242,248,255,0.96)_0%,rgba(255,254,248,0.98)_48%,rgba(244,249,235,0.98)_100%)] px-4 pb-5 pt-4 shadow-[0_16px_30px_rgba(111,145,72,0.1)]">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[rgba(174,209,118,0.3)]" />
          <div className="absolute -left-6 bottom-4 h-16 w-24 rounded-full bg-[rgba(148,194,98,0.24)]" />
          <div className="absolute left-1/2 bottom-1 h-20 w-32 -translate-x-1/2 rounded-full bg-[rgba(130,181,85,0.18)]" />
          <div className="absolute right-0 bottom-6 h-16 w-24 rounded-full bg-[rgba(197,223,147,0.22)]" />
          <div className="absolute left-8 top-7 h-8 w-8 rounded-full bg-white/68" />
          <div className="absolute right-5 top-5 h-12 w-12 rounded-full bg-[rgba(255,244,207,0.5)]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-[#edf1e3] bg-white/92 px-3 py-1 text-[11px] font-semibold text-[#597246] shadow-[0_4px_10px_rgba(111,145,72,0.06)]">
              첫 수업을 기다리고 있어요
            </div>
            <div className="mt-5 flex h-28 w-28 items-center justify-center rounded-full bg-white/72 shadow-[0_10px_20px_rgba(111,145,72,0.06)]">
              <SpmMascot variant="welcome" size="lg" className="h-24 w-24" />
            </div>
            <h2 className="mt-4 text-[1.9rem] font-black tracking-[-0.04em] text-[#314127]">
              아직 볼 수 있는 수업이 없어요
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#49613a]">
              원하는 수업과 월을 골라 두면 운영 쪽에서 확인하고 바로 등록 예정 상태로 올려 둘 수 있어요.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#e3edd6] bg-[#fffdf6] p-4 shadow-[0_16px_28px_rgba(111,145,72,0.1)]">
          <Button
            onClick={() => setIsRequestDialogOpen(true)}
            className="h-12 w-full gap-2 rounded-[1.45rem] border-[#75b84f] bg-[#8fcf62] text-base font-bold text-white shadow-[0_10px_18px_rgba(111,174,71,0.22)] hover:bg-[#9ad670]"
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
    return (
      <div className="px-3 pb-28 pt-3">
        <Card className="overflow-hidden rounded-[2rem] border border-[#e3ead7] bg-white py-0 shadow-[0_16px_28px_rgba(111,145,72,0.08)]">
          <CardContent className="space-y-2 px-4 py-5 text-sm text-[#68785c]">
            <p className="font-semibold text-[#314127]">대표 수업을 찾지 못했습니다.</p>
            <p>잠시 후 다시 불러오거나, 수업 탭에서 직접 선택해 주세요.</p>
            <Button
              onClick={() => router.push('/student/lessons')}
              className="mt-1 h-11 rounded-[1.35rem] bg-[#8fcf62] font-bold text-white hover:bg-[#9ad670]"
            >
              수업 탭 열기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const routineCards = [
    {
      key: 'attendance',
      icon: BookHeart,
      title: '출석 흔적 챙기기',
      description: `${selectedSummary.attendanceChecked}/${selectedSummary.attendanceTotal}주차를 확인했어요`,
      tone: 'bg-[#fff4c8] text-[#bc8b20]',
      done: selectedSummary.attendanceTotal > 0 && selectedSummary.attendanceChecked >= selectedSummary.attendanceTotal,
      onClick: () => openSelectedLessons(selectedSummary),
    },
    {
      key: 'content',
      icon: Sparkles,
      title: '열린 콘텐츠 둘러보기',
      description:
        selectedSummary.availableWeekCount > 0
          ? `${selectedSummary.availableWeekCount}개 주차가 열려 있어요`
          : '아직 열린 콘텐츠가 없어요',
      tone: 'bg-[#ebf5ff] text-[#5a7ecb]',
      done: selectedSummary.availableWeekCount > 0,
      onClick: () => openSelectedLessons(selectedSummary),
    },
    {
      key: 'feedback',
      icon: MessageCircleMore,
      title: '피드백 확인하기',
      description:
        selectedSummary.feedbackCount > 0
          ? `${selectedSummary.feedbackCount}건이 도착했어요`
          : '새 피드백을 기다리고 있어요',
      tone: 'bg-[#ffeaf1] text-[#cb718a]',
      done: selectedSummary.feedbackCount > 0,
      onClick: () => openSelectedLessons(selectedSummary),
    },
    {
      key: 'request',
      icon: Gift,
      title: '새 수업 미리 담아두기',
      description: '추가로 듣고 싶은 수업이 있으면 여기서 바로 요청할 수 있어요',
      tone: 'bg-[#eef8de] text-[#6d9b45]',
      done: false,
      onClick: () => setIsRequestDialogOpen(true),
    },
  ]

  const remainingRoutineCount = routineCards.filter((item) => item.key !== 'request' && !item.done).length

  return (
    <div className="space-y-4 px-3 pb-28 pt-3">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-[#dfe8d1] bg-[linear-gradient(180deg,rgba(242,248,255,0.96)_0%,rgba(255,254,248,0.98)_46%,rgba(244,249,235,0.98)_100%)] px-4 pb-5 pt-4 shadow-[0_16px_30px_rgba(111,145,72,0.1)]">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-[rgba(172,207,116,0.3)]" />
        <div className="absolute -left-6 bottom-4 h-16 w-28 rounded-full bg-[rgba(146,193,98,0.24)]" />
        <div className="absolute left-1/2 bottom-1 h-20 w-32 -translate-x-1/2 rounded-full bg-[rgba(129,179,83,0.18)]" />
        <div className="absolute right-0 bottom-7 h-16 w-28 rounded-full bg-[rgba(194,222,144,0.22)]" />
        <div className="absolute left-8 top-6 h-8 w-8 rounded-full bg-white/68" />
        <div className="absolute right-6 top-5 h-12 w-12 rounded-full bg-[rgba(255,244,207,0.5)]" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#edf1e3] bg-white/92 px-3 py-1 text-[11px] font-semibold text-[#5a7440] shadow-[0_4px_10px_rgba(111,145,72,0.06)]">
              {formatYearMonthLabel(selectedSummary.yearMonth)}
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(90,116,64,0.8)]">
              학생 홈
            </p>
            <h1 className="mt-1 text-[1.95rem] font-black tracking-[-0.04em] text-[#314127]">
              {selectedSummary.className}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#49613a]">{getStudentNextWeekLabel(selectedSummary)}</p>
          </div>

          <div className="rounded-[1.45rem] border border-[#ebf0e2] bg-white/94 px-3 py-2 text-right shadow-[0_6px_12px_rgba(111,145,72,0.06)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f957b]">상태</p>
            <p className="mt-1 text-sm font-bold text-[#486035]">
              {getStudentEnrollmentStatusLabel(selectedSummary)}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/48 blur-md" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/76">
              <SpmMascot variant="welcome" size="lg" className="h-24 w-24" />
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#49613a]">오늘도 한 칸씩 수업 숲을 걸어가요</p>
        </div>

        <div className="relative z-10 mt-5 rounded-[1.95rem] border border-[#e2ead7] bg-white/94 px-4 py-4 text-[#355024] shadow-[0_12px_22px_rgba(111,145,72,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0ad] text-[#dfad36]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#799065]">이번 달 진척</p>
                <p className="text-sm font-bold">{selectedProgressPercent}% 채웠어요</p>
              </div>
            </div>
            <div className="rounded-full bg-[#f3f8ea] px-3 py-1.5 text-sm font-semibold text-[#557439]">
              남은 체크 {remainingRoutineCount}개
            </div>
          </div>

          <Progress
            value={selectedProgressPercent}
            className="mt-3 h-3 border border-[#deebcf] bg-[#eef3e4] [&>div]:bg-[#ffd761]"
          />

          <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-[1.25rem] border border-[#edf1e4] bg-white px-2 py-3 shadow-[0_6px_12px_rgba(111,145,72,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#82906f]">출석</p>
              <p className="mt-1 text-base font-black">
                {selectedSummary.attendanceChecked}/{selectedSummary.attendanceTotal}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[#edf1e4] bg-white px-2 py-3 shadow-[0_6px_12px_rgba(111,145,72,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#82906f]">공개</p>
              <p className="mt-1 text-base font-black">{selectedSummary.availableWeekCount}개</p>
            </div>
            <div className="rounded-[1.25rem] border border-[#edf1e4] bg-white px-2 py-3 shadow-[0_6px_12px_rgba(111,145,72,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#82906f]">피드백</p>
              <p className="mt-1 text-base font-black">{selectedSummary.feedbackCount}건</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2.1rem] border border-[#e6ecda] bg-[#fffefb] p-3 shadow-[0_12px_22px_rgba(111,145,72,0.08)]">
        <div className="rounded-[1.8rem] border border-[#eef2e5] bg-white px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8f66]">오늘의 체크리스트</p>
              <h2 className="mt-1 text-[1.45rem] font-black tracking-[-0.03em] text-[#314127]">
                홈에서 우선순위만 가볍게 정리해요
              </h2>
            </div>
            <Button
              onClick={() => openSelectedLessons(selectedSummary)}
              className="h-11 rounded-[1.35rem] border-[#75b84f] bg-[#8fcf62] px-4 font-bold text-white shadow-[0_10px_18px_rgba(111,174,71,0.22)] hover:bg-[#9ad670]"
            >
              수업 탭 이어보기
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {routineCards.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full items-center gap-3 rounded-[1.6rem] border border-[#edf2e5] bg-white px-3 py-3 text-left shadow-[0_8px_14px_rgba(111,145,72,0.06)] transition hover:-translate-y-0.5"
                >
                  <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.3rem]', item.tone)}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-[#314127]">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-[#708060]">{item.description}</p>
                  </div>
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.1rem] border text-sm font-bold',
                      item.done
                        ? 'border-[#d6ecc1] bg-[#eef8de] text-[#679443]'
                        : 'border-[#ebe8dd] bg-[#f7f5ee] text-[#8e9686]',
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

      <StudentEnrollmentRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        title="새 수업 요청"
        description="추가로 듣고 싶은 수업이 있다면 여기서 바로 승인 요청을 보낼 수 있습니다."
      />
    </div>
  )
}
