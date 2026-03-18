import type { SupabaseClient } from '@supabase/supabase-js'

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
