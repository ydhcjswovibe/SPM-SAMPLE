import { redirect } from 'next/navigation'

export default async function StudentClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ yearMonth?: string | string[] }>
}) {
  const { classId } = await params
  const resolvedSearchParams = await searchParams
  const yearMonth = Array.isArray(resolvedSearchParams.yearMonth)
    ? resolvedSearchParams.yearMonth[0]
    : resolvedSearchParams.yearMonth

  if (yearMonth) {
    redirect(
      `/student/lessons?classId=${encodeURIComponent(classId)}&yearMonth=${encodeURIComponent(yearMonth)}`,
    )
  }

  redirect('/student/lessons')
}
