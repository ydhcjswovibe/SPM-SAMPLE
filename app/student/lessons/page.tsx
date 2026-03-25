'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'
import { AlertCircle, BookOpen, Gift, Loader2 } from 'lucide-react'

import { StudentClassDetailView } from '@/components/student-class-detail-view'
import { StudentEnrollmentRequestDialog } from '@/components/student-enrollment-request-card'
import { SpmMascot } from '@/components/spm-mascot'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentWeekOfMonth } from '@/lib/date-selection'
import { createClient } from '@/lib/supabase/client'
import {
  fetchStudentSummaries,
  resolveStudentSelection,
  studentAuthRequiredMessage,
} from '@/lib/student-lessons'
import { readStudentClassDetail, type StudentClassDetail } from '@/lib/weekly-media'

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

export default function StudentLessonsPage() {
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
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.7rem] bg-white shadow-[0_16px_24px_rgba(111,145,72,0.12)]">
          <SpmMascot size="sm" className="h-10 w-10" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#5a7440]">
          <Loader2 className="h-4 w-4 animate-spin" />
          수업 탭을 준비하는 중입니다.
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
                <p className="font-bold">수업 탭을 다시 불러오지 못했습니다.</p>
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
        <Card className="overflow-hidden rounded-[2.1rem] border border-[#e4ead8] bg-white py-0 shadow-[0_14px_28px_rgba(111,145,72,0.08)]">
          <CardContent className="space-y-4 px-4 py-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#f2f8e8] text-[#6b9444]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7e8f69]">수업 탭</p>
                <h1 className="text-[1.4rem] font-black tracking-[-0.03em] text-[#314127]">이어볼 수업이 없어요</h1>
              </div>
            </div>
            <p className="mx-auto max-w-sm text-sm leading-6 text-[#6a7b5f]">
              보고 싶은 수업과 월을 먼저 요청해 두면 운영 확인 뒤 이 탭에서 바로 이어서 볼 수 있어요.
            </p>
            <Button
              onClick={() => setIsRequestDialogOpen(true)}
              className="mx-auto h-12 min-w-[12rem] gap-2 rounded-[1.4rem] bg-[#8fcf62] px-5 font-bold text-white hover:bg-[#9ad670]"
            >
              <Gift className="h-4 w-4" />
              새 수업 요청
            </Button>
          </CardContent>
        </Card>

        <StudentEnrollmentRequestDialog
          open={isRequestDialogOpen}
          onOpenChange={setIsRequestDialogOpen}
          title="새 수업 요청"
          description="원하는 수업과 월을 먼저 고르면 운영 쪽에서 확인 후 이 탭에서 바로 이어볼 수 있게 준비합니다."
        />
      </div>
    )
  }

  if (!selectedSummary) {
    return (
      <div className="px-3 pb-28 pt-3">
        <Card className="overflow-hidden rounded-[2rem] border border-[#e3ead7] bg-white py-0 shadow-[0_16px_28px_rgba(111,145,72,0.08)]">
          <CardContent className="space-y-2 px-4 py-5 text-sm text-[#68785c]">
            <p className="font-semibold text-[#314127]">선택된 수업을 찾지 못했습니다.</p>
            <p>상단 선택기에서 수업과 월을 다시 골라 주세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-3 pb-28 pt-3">
      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[1.3rem] border border-[#e4ead8] bg-white px-2 py-2.5 shadow-[0_10px_20px_rgba(111,145,72,0.06)]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#82906f]">출석</p>
          <p className="mt-0.5 text-base font-black text-[#314127]">
            {selectedSummary.attendanceChecked}/{selectedSummary.attendanceTotal}
          </p>
        </div>
        <div className="rounded-[1.3rem] border border-[#e4ead8] bg-white px-2 py-2.5 shadow-[0_10px_20px_rgba(111,145,72,0.06)]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#82906f]">공개</p>
          <p className="mt-0.5 text-base font-black text-[#314127]">{selectedSummary.availableWeekCount}개</p>
        </div>
        <div className="rounded-[1.3rem] border border-[#e4ead8] bg-white px-2 py-2.5 shadow-[0_10px_20px_rgba(111,145,72,0.06)]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#82906f]">피드백</p>
          <p className="mt-0.5 text-base font-black text-[#314127]">{selectedSummary.feedbackCount}건</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6ecda] bg-[#fffefb] p-3 shadow-[0_12px_22px_rgba(111,145,72,0.08)]">
        <div className="mb-3 px-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f9069]">콘텐츠</p>
        </div>

        {isDetailLoading ? (
          <Card className="overflow-hidden rounded-[1.8rem] border border-[#e1ead5] bg-white py-0 shadow-[0_12px_24px_rgba(111,145,72,0.08)]">
            <CardContent className="flex items-center gap-3 px-4 py-5 text-sm text-[#6a7b5f]">
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
                  <p className="text-[rgba(182,80,70,0.8)]">{getFriendlyStudentDetailMessage(detailError)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : selectedDetail ? (
          <StudentClassDetailView
            key={`${selectedDetail.classId}:${selectedDetail.yearMonth}:${selectedDetail.enrollmentStatus}`}
            detail={selectedDetail}
            initialWeekNumber={getCurrentWeekOfMonth()}
          />
        ) : (
          <Card className="overflow-hidden rounded-[1.8rem] border border-[#e1ead5] bg-white py-0 shadow-[0_12px_24px_rgba(111,145,72,0.08)]">
            <CardContent className="px-4 py-10 text-center">
              <p className="text-base font-semibold text-[#314127]">선택한 수업 정보를 찾지 못했습니다.</p>
              <p className="mt-2 text-sm leading-6 text-[#6a7b5f]">
                다른 수업을 선택하거나, 등록 상태를 확인한 뒤 다시 시도해 주세요.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
