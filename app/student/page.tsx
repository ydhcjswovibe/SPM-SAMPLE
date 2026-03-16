'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { AlertCircle, BookOpen, ChevronRight, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel, readStudentClassSummaries, type StudentClassSummary } from '@/lib/weekly-media'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

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
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">수업 목록을 불러오는 중입니다.</p>
      </div>
    )
  }

  if (error) {
    const needsLogin = error instanceof Error && error.message === authRequiredMessage

    return (
      <div className="p-4">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-start gap-3 py-4 text-sm text-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{getFriendlyStudentMessage(error)}</p>
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
      <div className="p-4">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-medium text-lg">아직 열어볼 수 있는 수업이 없습니다.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              등록이 완료되면 이 화면에서 월별 수업과 주차 콘텐츠를 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeCount = summaries.filter((item) => item.enrollmentStatus === 'ACTIVE').length
  const pendingCount = summaries.filter((item) => item.enrollmentStatus === 'PENDING').length
  const totalFeedbackCount = summaries.reduce((sum, item) => sum + item.feedbackCount, 0)

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">수업</h1>
        <p className="text-sm text-muted-foreground">
          월별 등록 상태와 이번에 볼 수 있는 주차 콘텐츠를 확인합니다.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">수강 중</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">등록 예정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">피드백</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalFeedbackCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {summaries.map((summary) => {
          const progressPercent =
            summary.attendanceTotal > 0
              ? Math.round((summary.attendanceChecked / summary.attendanceTotal) * 100)
              : 0

          return (
            <Link
              key={`${summary.classId}:${summary.yearMonth}`}
              href={`/student/class/${summary.classId}?yearMonth=${encodeURIComponent(summary.yearMonth)}`}
            >
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium">{summary.className}</h2>
                        <Badge variant={summary.enrollmentStatus === 'PENDING' ? 'secondary' : 'default'}>
                          {getEnrollmentLabel(summary.enrollmentStatus)}
                        </Badge>
                        <Badge variant="outline">{formatYearMonthLabel(summary.yearMonth)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {summary.enrollmentStatus === 'PENDING' && summary.availableWeekCount === 0
                          ? '곧 시작 예정입니다. 콘텐츠가 열리면 이 카드에서 바로 확인할 수 있습니다.'
                          : summary.nextWeekNumber
                            ? `${summary.nextWeekNumber}주차부터 확인할 수 있습니다.`
                            : '아직 공개된 콘텐츠가 없습니다.'}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg bg-muted/60 px-3 py-2">
                      <p className="text-xs text-muted-foreground">결제</p>
                      <p className="font-medium">{summary.paymentStatus ? '완료' : '미완료'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 px-3 py-2">
                      <p className="text-xs text-muted-foreground">공개 주차</p>
                      <p className="font-medium">{summary.availableWeekCount}개</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 px-3 py-2">
                      <p className="text-xs text-muted-foreground">피드백</p>
                      <p className="font-medium">{summary.feedbackCount}건</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>출석 진행</span>
                      <span>
                        {summary.attendanceChecked}/{summary.attendanceTotal}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
