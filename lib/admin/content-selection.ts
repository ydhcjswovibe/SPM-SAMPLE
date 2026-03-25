export function buildAdminContentHref(args: {
  classId?: string | null
  yearMonth?: string | null
  week?: number | string | null
  studentId?: string | null
}) {
  const params = new URLSearchParams()

  if (args.classId) {
    params.set('classId', args.classId)
  }

  if (args.yearMonth) {
    params.set('yearMonth', args.yearMonth)
  }

  if (args.week !== null && args.week !== undefined && String(args.week).trim()) {
    params.set('week', String(args.week))
  }

  if (args.studentId) {
    params.set('studentId', args.studentId)
  }

  const query = params.toString()
  return query ? `/admin/content?${query}` : '/admin/content'
}
