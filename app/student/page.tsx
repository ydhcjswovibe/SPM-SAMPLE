'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { AlertCircle, BookHeart, Loader2, MessageCircleMore, Sparkles } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import {
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

  const selectedProgressPercent =
    selectedSummary && selectedSummary.attendanceTotal > 0
      ? Math.round((selectedSummary.attendanceChecked / selectedSummary.attendanceTotal) * 100)
      : 0

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

  const summaryCards = [
    {
      key: 'attendance',
      icon: BookHeart,
      label: '출석',
      description: '이번 달 확인한 주차',
      valueMain: `${selectedSummary.attendanceChecked}/${selectedSummary.attendanceTotal}`,
      valueUnit: '',
      surfaceClass: 'border-[#f0dfaa] bg-accent',
      iconClass: 'bg-white text-[#bc8b20] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_18px_rgba(218,180,76,0.18)]',
      glowClass: 'bg-white/88',
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
      iconClass: 'bg-white text-[#5a7ecb] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(128,164,220,0.18)]',
      glowClass: 'bg-white/88',
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
      iconClass: 'bg-white text-[#cb718a] shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_10px_18px_rgba(214,128,157,0.16)]',
      glowClass: 'bg-white/88',
      labelClass: 'text-[#b85f79]',
      done: selectedSummary.feedbackCount > 0,
    },
  ]

  const remainingRoutineCount = summaryCards.filter((item) => !item.done).length

  return (
    <div className="space-y-4 px-3 pb-28 pt-3">
      <section className="relative overflow-hidden rounded-2xl border border-[#dfe8d1] bg-card px-4 pb-5 pt-3 shadow-[0_16px_30px_rgba(111,145,72,0.1)]">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-[rgba(172,207,116,0.3)]" />
        <div className="absolute -left-6 bottom-4 h-16 w-28 rounded-full bg-[rgba(146,193,98,0.24)]" />
        <div className="absolute left-1/2 bottom-1 h-20 w-32 -translate-x-1/2 rounded-full bg-[rgba(129,179,83,0.18)]" />
        <div className="absolute right-0 bottom-7 h-16 w-28 rounded-full bg-[rgba(194,222,144,0.22)]" />
        <div className="absolute left-8 top-6 h-8 w-8 rounded-full bg-white/68" />
        <div className="absolute right-6 top-5 h-12 w-12 rounded-full bg-[rgba(255,244,207,0.5)]" />

        <div className="relative z-10 flex flex-col items-center pt-1">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/48 blur-md" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white">
              <SpmMascot variant="welcome" size="lg" className="h-20 w-20" />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-2.5 overflow-hidden rounded-2xl border border-[#e4ddb2] bg-accent px-3.5 py-3 text-[#355024] shadow-[0_14px_24px_rgba(111,145,72,0.12),inset_0_1px_0_rgba(255,255,255,0.92)]">
          <div className="pointer-events-none absolute inset-x-3 top-0 h-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.44)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="pointer-events-none absolute -right-3 top-2 h-16 w-16 rounded-full bg-[rgba(255,218,117,0.28)] blur-2xl" />
          <div className="pointer-events-none absolute -left-3 bottom-1 h-12 w-16 rounded-full bg-[rgba(183,224,126,0.22)] blur-2xl" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#f0eddc] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f8752] shadow-[0_6px_12px_rgba(126,153,86,0.08)]">
                  진척
                </span>
                <p className="text-[11px] font-semibold text-[#60724e]">
                  {selectedSummary.attendanceChecked}주 확인
                </p>
              </div>

              <div className="mt-1.5 flex items-end gap-1.5 text-[#2a3a1f]">
                <span className="text-[2rem] font-black leading-none tracking-[-0.08em]">{selectedProgressPercent}</span>
                <span className="pb-0.5 text-[1rem] font-black tracking-[-0.03em]">%</span>
                <span className="pb-0.5 text-[11px] font-semibold text-[#61754c]">진행 중</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="rounded-2xl border border-[#ece6d3] bg-white px-2.5 py-1.5 text-center shadow-[0_8px_14px_rgba(132,160,91,0.12)]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#83936d]">남은</p>
                <p className="mt-0.5 text-[1.15rem] font-black leading-none tracking-[-0.05em] text-[#314127]">
                  {remainingRoutineCount}
                </p>
              </div>
              <div className="rounded-2xl border border-[#ece6d3] bg-card px-2.5 py-1.5 text-center shadow-[0_8px_14px_rgba(196,175,102,0.12)]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8c7b4f]">확인</p>
                <p className="mt-0.5 text-[0.95rem] font-black leading-none tracking-[-0.05em] text-[#314127]">
                  {selectedSummary.attendanceChecked}/{selectedSummary.attendanceTotal}
                </p>
              </div>
            </div>
          </div>

          <Progress
            value={selectedProgressPercent}
            className={studentProgressRailClass}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2ecd3] bg-card p-3 shadow-[0_14px_26px_rgba(111,145,72,0.08)]">
        <div className="rounded-2xl border border-[#edf2e5] bg-white px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
          <div className="space-y-2.5">
            {summaryCards.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.key}
                  className={cn(
                    'relative w-full overflow-hidden rounded-2xl border px-3 py-3 shadow-[0_12px_22px_rgba(111,145,72,0.08),inset_0_1px_0_rgba(255,255,255,0.86)]',
                    item.surfaceClass,
                  )}
                >
                  <div className="pointer-events-none absolute inset-x-3 top-0 h-7 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_100%)]" />
                  <div className={cn('pointer-events-none absolute -right-2 top-2 h-14 w-14 rounded-full blur-2xl', item.glowClass)} />

                  <div className="relative z-10 flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                        item.iconClass,
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'pt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]',
                              item.labelClass,
                            )}
                          >
                            {item.label}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] font-medium text-[#6b7d5b]">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]',
                              item.done
                                ? 'border-[#ece6d3] bg-white text-[#5c8e36]'
                                : 'border-[#ece6d3] bg-card text-[#907d58]',
                            )}
                          >
                            {item.done ? '완료' : '대기'}
                          </span>

                          <div className="flex items-end gap-1 text-[#26371d]">
                            <p className="text-[1.8rem] font-black leading-none tracking-[-0.06em]">{item.valueMain}</p>
                            {item.valueUnit ? (
                              <p className="pb-0.5 text-[0.95rem] font-bold text-[#516642]">{item.valueUnit}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
