import type { SupabaseClient } from '@supabase/supabase-js'

import { getCurrentYearMonth } from '@/lib/date-selection'
import { readStudentClassSummaries, type StudentClassSummary } from '@/lib/weekly-media'

export const studentAuthRequiredMessage = '로그인이 필요합니다.'

export async function fetchStudentSummaries(
  supabase: SupabaseClient,
): Promise<StudentClassSummary[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(studentAuthRequiredMessage)
  }

  return readStudentClassSummaries(supabase, user.id)
}

export function getFeaturedSummary(summaries: StudentClassSummary[]) {
  return (
    summaries.find((item) => item.enrollmentStatus === 'ACTIVE' && item.nextWeekNumber !== null) ??
    summaries.find((item) => item.enrollmentStatus === 'ACTIVE') ??
    summaries[0]
  )
}

export function getVisibleYearMonths(summaries: StudentClassSummary[]) {
  return Array.from(new Set(summaries.map((item) => item.yearMonth))).sort((left, right) =>
    right.localeCompare(left),
  )
}

export function getStudentNextWeekLabel(summary: StudentClassSummary) {
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

export function getStudentEnrollmentStatusLabel(summary: StudentClassSummary) {
  return summary.enrollmentStatus === 'PENDING' ? '등록 예정' : '수강 중'
}

export function readSelectedSummary(
  summaries: StudentClassSummary[],
  classId: string | null,
  yearMonth: string | null,
) {
  return (
    summaries.find((item) => item.classId === classId && item.yearMonth === yearMonth) ??
    getFeaturedSummary(summaries)
  )
}

export function resolveStudentSelection(
  summaries: StudentClassSummary[],
  classId: string | null,
  yearMonth: string | null,
) {
  const featuredSummary = summaries.length > 0 ? getFeaturedSummary(summaries) : null
  const visibleYearMonths = summaries.length > 0 ? getVisibleYearMonths(summaries) : []
  const currentYearMonth = getCurrentYearMonth()
  const defaultYearMonth =
    visibleYearMonths.includes(currentYearMonth)
      ? currentYearMonth
      : featuredSummary?.yearMonth ?? visibleYearMonths[0] ?? null
  const selectedYearMonth =
    yearMonth && visibleYearMonths.includes(yearMonth) ? yearMonth : defaultYearMonth
  const monthSummaries = selectedYearMonth
    ? summaries.filter((item) => item.yearMonth === selectedYearMonth)
    : []
  const selectedSummary =
    monthSummaries.length > 0 ? readSelectedSummary(monthSummaries, classId, selectedYearMonth) : null

  return {
    featuredSummary,
    visibleYearMonths,
    selectedYearMonth,
    monthSummaries,
    selectedSummary,
  }
}

export function buildStudentSelectionHref(
  pathname: string,
  classId?: string | null,
  yearMonth?: string | null,
) {
  const params = new URLSearchParams()

  if (classId) {
    params.set('classId', classId)
  }

  if (yearMonth) {
    params.set('yearMonth', yearMonth)
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
