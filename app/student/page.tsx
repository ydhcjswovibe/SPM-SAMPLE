'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { AlertCircle, ChevronRight, Loader2, Sparkles } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel, readStudentClassSummaries, type StudentClassSummary } from '@/lib/weekly-media'
import { SpmMascot } from '@/components/spm-mascot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

function getFriendlyStudentMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return '수업 목록을 다시 불러오지 못했습니다.'
  }

  if (error.message === authRequiredMessage) {
    return authRequiredMessage
  }

  return '수업 목록을 다시 불러오지 못했습니다.'
}

function getEnrollmentLabel(status: StudentClassSummary['enrollmentStatus']) {
  return status === 'PENDING' ? '등록 예정' : '수강 중'
}

export default function StudentDashboard() {
  const {
    data: summaries,
    error,
    isLoading,
  } = useSWR('student-class-summaries', fetchStudentSummaries)

  if (isLoading) {
    return (
      <div className="flex min-h-[65dvh] flex-col items-center justify-center gap-4 px-4 text-center">
        <SpmMascot size="lg" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
        <Card className="overflow-hidden border-destructive/40 bg-[#fff0ef]">
          <CardContent className="flex flex-col items-start gap-4 p-5 text-sm text-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">학생 수업 화면을 다시 불러오지 못했습니다.</p>
                <p className="text-destructive/80">{getFriendlyStudentMessage(error)}</p>
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
        <Card className="spm-hero-panel overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <SpmMascot variant="welcome" size="lg" />
            <div className="space-y-2">
              <p className="spm-kicker">Ready To Start</p>
              <h2 className="spm-display text-3xl">아직 열어볼 수 있는 수업이 없어요.</h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                등록이 완료되면 이 화면에서 월별 수업과 주차 콘텐츠를 바로 이어서 확인할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeCount = summaries.filter((item) => item.enrollmentStatus === 'ACTIVE').length
  const pendingCount = summaries.filter((item) => item.enrollmentStatus === 'PENDING').length
  const totalFeedbackCount = summaries.reduce((sum, item) => sum + item.feedbackCount, 0)

  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      <section className="spm-hero-panel overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="spm-kicker">Dance Through Class</p>
            <div className="space-y-2">
              <h1 className="spm-display max-w-[10ch] text-4xl leading-none text-foreground">
                이번 달 수업 흐름을 한눈에 볼 수 있어요.
              </h1>
              <p className="max-w-md text-sm text-muted-foreground">
                월별 등록 상태와 열려 있는 주차 콘텐츠를 귀엽고 빠르게 확인하는 학생 메인 화면입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>수강 중 {activeCount}</Badge>
              <Badge variant="secondary">등록 예정 {pendingCount}</Badge>
              <Badge variant="outline">피드백 {totalFeedbackCount}</Badge>
            </div>
          </div>
          <SpmMascot variant="welcome" size="lg" className="-mr-3 hidden sm:block" />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Card className="spm-mint-panel gap-0 py-0">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-xs text-muted-foreground">수강 중</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <p className="spm-display text-3xl text-foreground">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="spm-blue-panel gap-0 py-0">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-xs text-muted-foreground">등록 예정</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <p className="spm-display text-3xl text-secondary-foreground">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="spm-yellow-panel gap-0 py-0">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-xs text-muted-foreground">피드백</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <p className="spm-display text-3xl text-accent-foreground">{totalFeedbackCount}</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="spm-kicker">Class List</p>
            <h2 className="spm-display text-2xl text-foreground">이번에 볼 수 있는 수업</h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full border-2 border-[var(--line-strong)] bg-white px-3 py-1 text-xs font-bold text-muted-foreground sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-blue)]" />
            진행률과 공개 상태를 같이 확인
          </div>
        </div>

        {summaries.map((summary, index) => {
          const progressPercent =
            summary.attendanceTotal > 0
              ? Math.round((summary.attendanceChecked / summary.attendanceTotal) * 100)
              : 0

          const toneClass =
            summary.enrollmentStatus === 'PENDING'
              ? 'spm-blue-panel'
              : index % 2 === 0
                ? 'spm-mint-panel'
                : 'bg-white'

          return (
            <Link
              key={`${summary.classId}:${summary.yearMonth}`}
              href={`/student/class/${summary.classId}?yearMonth=${encodeURIComponent(summary.yearMonth)}`}
              className="block"
            >
              <Card className={cn('overflow-hidden transition-transform hover:-translate-y-1', toneClass)}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={summary.enrollmentStatus === 'PENDING' ? 'secondary' : 'default'}>
                          {getEnrollmentLabel(summary.enrollmentStatus)}
                        </Badge>
                        <Badge variant="outline">{formatYearMonthLabel(summary.yearMonth)}</Badge>
                      </div>
                      <div className="space-y-1">
                        <h3 className="spm-display text-2xl text-foreground">{summary.className}</h3>
                        <p className="text-sm text-muted-foreground">
                          {summary.enrollmentStatus === 'PENDING' && summary.availableWeekCount === 0
                            ? '곧 시작 예정이에요. 콘텐츠가 열리면 이 카드에서 바로 이어서 볼 수 있어요.'
                            : summary.nextWeekNumber
                              ? `${summary.nextWeekNumber}주차부터 바로 볼 수 있어요.`
                              : '아직 공개된 콘텐츠가 없어요.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--line-strong)] bg-white shadow-[0_4px_0_var(--line-strong)]">
                      <ChevronRight className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-[1.2rem] border-2 border-white/90 bg-white/75 px-3 py-3 shadow-[0_4px_0_rgba(255,255,255,0.72)]">
                      <p className="text-[11px] font-bold text-muted-foreground">결제</p>
                      <p className="mt-1 font-black text-foreground">
                        {summary.paymentStatus ? '완료' : '미완료'}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-white/90 bg-white/75 px-3 py-3 shadow-[0_4px_0_rgba(255,255,255,0.72)]">
                      <p className="text-[11px] font-bold text-muted-foreground">공개 주차</p>
                      <p className="mt-1 font-black text-foreground">{summary.availableWeekCount}개</p>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-white/90 bg-white/75 px-3 py-3 shadow-[0_4px_0_rgba(255,255,255,0.72)]">
                      <p className="text-[11px] font-bold text-muted-foreground">피드백</p>
                      <p className="mt-1 font-black text-foreground">{summary.feedbackCount}건</p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-[1.2rem] border-2 border-white/90 bg-white/75 px-4 py-3 shadow-[0_4px_0_rgba(255,255,255,0.72)]">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>출석 진행</span>
                      <span>
                        {summary.attendanceChecked}/{summary.attendanceTotal}
                      </span>
                    </div>
                    <Progress value={progressPercent} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
