'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { AlertCircle, BookHeart, Loader2, MessageCircleMore, Sparkles } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import {
  buildStudentHomeProgressPreview,
  buildStudentSelectionHref,
  fetchStudentSummaries,
  resolveStudentSelection,
  studentAuthRequiredMessage,
} from '@/lib/student-lessons'
import { SpmMascot } from '@/components/spm-mascot'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { studentProgressRailClass } from '@/lib/student/surface'
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
  const lessonsHref = buildStudentSelectionHref(
    '/student/lessons',
    selectedSummary?.classId,
    selectedSummary?.yearMonth,
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[65dvh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_16px_24px_rgba(111,145,72,0.12)]">
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
        <Card className="overflow-hidden rounded-2xl border border-destructive/30 bg-card py-0 shadow-[0_18px_36px_rgba(184,86,70,0.1)]">
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
                <Link href="/">다시 로그인하기</Link>
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
        <section className="relative overflow-hidden rounded-2xl border border-[#dfe8d2] bg-card px-4 pb-5 pt-4 shadow-[0_16px_30px_rgba(111,145,72,0.1)]">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[rgba(174,209,118,0.3)]" />
          <div className="absolute -left-6 bottom-4 h-16 w-24 rounded-full bg-[rgba(148,194,98,0.24)]" />
          <div className="absolute left-1/2 bottom-1 h-20 w-32 -translate-x-1/2 rounded-full bg-[rgba(130,181,85,0.18)]" />
          <div className="absolute right-0 bottom-6 h-16 w-24 rounded-full bg-[rgba(197,223,147,0.22)]" />
          <div className="absolute left-8 top-7 h-8 w-8 rounded-full bg-white/68" />
          <div className="absolute right-5 top-5 h-12 w-12 rounded-full bg-[rgba(255,244,207,0.5)]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-[#edf1e3] bg-white px-3 py-1 text-[11px] font-semibold text-[#597246] shadow-[0_4px_10px_rgba(111,145,72,0.06)]">
              첫 수업을 기다리고 있어요
            </div>
            <div className="mt-5 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-[0_10px_20px_rgba(111,145,72,0.06)]">
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

        <section className="rounded-2xl border border-[#e3edd6] bg-card p-4 shadow-[0_16px_28px_rgba(111,145,72,0.1)]">
          <Button
            onClick={() => router.push(lessonsHref)}
            className="h-12 w-full rounded-2xl border-[#75b84f] bg-primary text-base font-bold text-white shadow-[0_10px_18px_rgba(111,174,71,0.22)]"
          >
            수업 탭에서 요청하기
          </Button>
        </section>
      </div>
    )
  }

  if (!selectedSummary) {
    return (
      <div className="px-3 pb-28 pt-3">
        <Card className="overflow-hidden rounded-2xl border border-[#e3ead7] bg-white py-0 shadow-[0_16px_28px_rgba(111,145,72,0.08)]">
          <CardContent className="space-y-2 px-4 py-5 text-sm text-[#68785c]">
            <p className="font-semibold text-[#314127]">대표 수업을 찾지 못했습니다.</p>
            <p>잠시 후 다시 불러오거나, 수업 탭에서 직접 선택해 주세요.</p>
            <Button
              onClick={() => router.push(lessonsHref)}
              className="mt-1 h-11 rounded-2xl bg-primary font-bold text-white"
            >
              수업 탭 열기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPreview = buildStudentHomeProgressPreview(selectedSummary)
  const summaryCards = [
    {
      key: 'attendance',
      icon: BookHeart,
      label: '출석',
      description: '이번 달 확인한 주차',
      valueMain: `${selectedSummary.attendanceChecked}/${selectedSummary.attendanceTotal}`,
      valueUnit: '',
      surfaceClass: 'border-[#f0dfaa] bg-accent',
      iconClass: 'border-[#f3e4b3] bg-white text-[#bc8b20] shadow-[0_8px_14px_rgba(218,180,76,0.16)]',
      iconGraphicClass: 'translate-y-px',
      labelClass: 'text-[#8d6f26]',
      done: selectedSummary.attendanceTotal > 0 && selectedSummary.attendanceChecked >= selectedSummary.attendanceTotal,
    },
    {
      key: 'content',
      icon: Sparkles,
      label: '공개',
      description: '지금 바로 볼 수 있어요',
      valueMain: `${selectedSummary.availableWeekCount}`,
      valueUnit: '개',
      surfaceClass: 'border-[#d9e8fb] bg-secondary',
      iconClass: 'border-[#dbe5f8] bg-white text-[#5a7ecb] shadow-[0_8px_14px_rgba(128,164,220,0.14)]',
      iconGraphicClass: 'translate-x-px',
      labelClass: 'text-[#5271b7]',
      done: selectedSummary.availableWeekCount > 0,
    },
    {
      key: 'feedback',
      icon: MessageCircleMore,
      label: '피드백',
      description: '도착한 답변',
      valueMain: `${selectedSummary.feedbackCount}`,
      valueUnit: '건',
      surfaceClass: 'border-[#dce8cf] bg-muted',
      iconClass: 'border-[#eadfdc] bg-white text-[#cb718a] shadow-[0_8px_14px_rgba(214,128,157,0.14)]',
      iconGraphicClass: 'translate-y-px',
      labelClass: 'text-[#b85f79]',
      done: selectedSummary.feedbackCount > 0,
    },
  ]

  return (
    <div className="space-y-3 px-3 pb-28 pt-3">
      <section className="relative overflow-hidden rounded-2xl border border-[#dfe8d1] bg-card px-3 pb-3 pt-4 shadow-[0_16px_30px_rgba(111,145,72,0.1)]">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[rgba(172,207,116,0.32)]" />
        <div className="absolute -left-6 bottom-3 h-16 w-28 rounded-full bg-[rgba(146,193,98,0.24)]" />
        <div className="absolute left-1/2 bottom-0 h-20 w-32 -translate-x-1/2 rounded-full bg-[rgba(129,179,83,0.18)]" />
        <div className="absolute right-0 bottom-5 h-16 w-28 rounded-full bg-[rgba(194,222,144,0.22)]" />

        <div className="relative z-10 flex min-h-[15.5rem] flex-col">
          <div className="flex items-start justify-start">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d8bf69] bg-accent px-1.5 py-1 text-[#6e5512] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(191,157,62,0.18)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#ebdca4] bg-white text-[#b8891f] shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="pr-1 text-[11px] font-black tracking-[-0.03em]">Lv.{progressPreview.level}</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center pb-3 pt-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/52 blur-lg" />
              <div className="absolute inset-x-5 bottom-2 h-4 rounded-full bg-[rgba(159,194,101,0.24)] blur-md" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-[#edf2e2] bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#fbfcf7_55%,#f2f5ea_100%)] shadow-[0_18px_34px_rgba(111,145,72,0.12)]">
                <SpmMascot variant="welcome" size="lg" className="h-28 w-28" />
              </div>
            </div>
          </div>

          <div
            data-slot="student-home-progress"
            aria-label="학생 홈 레벨 진행"
            className="rounded-2xl border border-[#dcc36f] bg-accent px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_16px_rgba(176,151,80,0.08)]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-[#ead38a] bg-white px-2.5 py-0.5 text-[9px] font-black tracking-[0.14em] text-[#8e6c14] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  EXP
                </div>

                <p className="shrink-0 text-[11px] font-bold tracking-[-0.02em] text-[#5b4915]">
                  <span className="font-black text-[#3e310d]">{progressPreview.xpCurrent}</span>/{progressPreview.xpTarget} XP
                </p>
              </div>

              <Progress
                value={progressPreview.xpPercent}
                className={cn(
                  studentProgressRailClass,
                  'mt-0 h-4 border-[#d6bf67] shadow-[inset_0_1px_0_rgba(255,255,255,0.84),inset_0_2px_4px_rgba(190,161,63,0.12)] [&>div]:shadow-[0_6px_12px_rgba(186,154,46,0.24)]',
                )}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2.5 rounded-2xl border border-[#e2ecd3] bg-card p-3 shadow-[0_14px_26px_rgba(111,145,72,0.08)]">
        {summaryCards.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.key}
              className={cn(
                'relative flex min-h-[5.1rem] w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 shadow-[0_12px_22px_rgba(111,145,72,0.08),inset_0_1px_0_rgba(255,255,255,0.86)]',
                item.surfaceClass,
              )}
            >
              <div className="pointer-events-none absolute inset-x-3 top-0 h-7 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_100%)]" />

              <span className={cn('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border', item.iconClass)}>
                <Icon className={cn('h-4.5 w-4.5', item.iconGraphicClass)} />
              </span>

              <div className="relative z-10 flex min-w-0 flex-1 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-[11px] font-semibold uppercase leading-none tracking-[0.14em]',
                      item.labelClass,
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-medium leading-[1.15] text-[#6b7d5b]">
                    {item.description}
                  </p>
                </div>

                <div className="flex w-20 shrink-0 flex-col items-end text-right">
                  <span
                    className={cn(
                      'mb-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-[0.12em]',
                      item.done
                        ? 'border-[#ece6d3] bg-white text-[#5c8e36]'
                        : 'border-[#ece6d3] bg-card text-[#907d58]',
                    )}
                  >
                    {item.done ? '완료' : '대기'}
                  </span>

                  <div className="flex items-end justify-end gap-1 text-[#26371d]">
                    <p className="text-[1.8rem] font-black leading-none tracking-[-0.06em]">{item.valueMain}</p>
                    {item.valueUnit ? (
                      <p className="pb-0.5 text-[0.95rem] font-bold leading-none text-[#516642]">{item.valueUnit}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
