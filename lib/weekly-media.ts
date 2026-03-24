import type { SupabaseClient } from '@supabase/supabase-js'

import type { Class } from '@/lib/types'

export const DEFAULT_CLASS_WEEKS = 4
export const MAX_CLASS_WEEKS = 5
export const MEDIA_BUCKET = 'spm-media'

export type MediaType = 'VIDEO' | 'IMAGE'

export interface MediaRow {
  id: string
  type: MediaType
  url: string
  upload_method: string | null
}

export interface ReadyVideoItem {
  status: 'ready'
  mediaId: string
  url: string
  youtubeId: string
}

export interface ReadyImageItem {
  status: 'ready'
  mediaId: string
  url: string
  objectPath: string | null
}

export interface InvalidMediaItem {
  status: 'invalid'
  mediaId: string
  url: string
  message: string
}

export interface WeeklyMediaBucket<TReady> {
  items: TReady[]
  invalidItems: InvalidMediaItem[]
}

export interface WeeklyMediaWeek {
  weekNumber: number
  logId: string | null
  progressText: string | null
  reflectionText: string | null
  sharedFeedbackText: string | null
  privateFeedbackText: string | null
  attendanceStatus: 'present' | 'absent' | 'pending'
  attendanceChecked: boolean
  video: WeeklyMediaBucket<ReadyVideoItem>
  image: WeeklyMediaBucket<ReadyImageItem>
}

type DbClassRow = {
  id: string
  name: string | null
  is_active?: boolean | null
}

type MediaRelation = MediaRow | MediaRow[] | null

type ClassLogRow = {
  id: string
  class_id: string
  year_month: string
  week_number: number | null
  progress: string | null
  reflection: string | null
  attendance_data: Record<string, boolean> | null
  member_feedback: Record<string, string> | null
  media: MediaRelation
}

type EnrollmentRow = {
  class_id: string
  year_month: string
  payment_status: boolean | null
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | null
  classes:
    | { name: string | null; is_active?: boolean | null }
    | { name: string | null; is_active?: boolean | null }[]
    | null
}

export interface StudentClassSummary {
  classId: string
  className: string
  yearMonth: string
  enrollmentStatus: 'ACTIVE' | 'PENDING'
  paymentStatus: boolean
  attendanceChecked: number
  attendanceTotal: number
  feedbackCount: number
  availableWeekCount: number
  nextWeekNumber: number | null
}

export interface StudentClassDetail {
  classId: string
  className: string
  yearMonth: string
  enrollmentStatus: 'ACTIVE' | 'PENDING'
  paymentStatus: boolean
  weeks: WeeklyMediaWeek[]
}

export function normalizeClassRow(row: DbClassRow): Class {
  const now = new Date().toISOString()

  return {
    id: row.id,
    name: row.name ?? '이름 없는 클래스',
    description: null,
    total_weeks: DEFAULT_CLASS_WEEKS,
    is_active: row.is_active ?? true,
    created_at: now,
    updated_at: now,
  }
}

export function getVisibleWeekCount(maxWeekNumber: number, minimum = DEFAULT_CLASS_WEEKS) {
  return Math.min(MAX_CLASS_WEEKS, Math.max(minimum, maxWeekNumber))
}

export function buildVisibleWeekNumbers(maxWeekNumber: number, minimum = DEFAULT_CLASS_WEEKS) {
  return Array.from({ length: getVisibleWeekCount(maxWeekNumber, minimum) }, (_, index) => index + 1)
}

export function isValidYearMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value)
}

export function isValidWeekNumber(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_CLASS_WEEKS
}

export function formatYearMonthLabel(value: string) {
  const [year, month] = value.split('-')
  if (!year || !month) return value
  return `${year}.${month}`
}

export function formatCompactYearMonthLabel(value: string) {
  const [year, month] = value.split('-')
  if (!year || !month) return value
  return `${year.slice(-2)}.${month}`
}

export function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const directIdMatch = trimmed.match(/^([a-zA-Z0-9_-]{11})$/)
  if (directIdMatch?.[1]) return directIdMatch[1]

  const normalizedInput = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(normalizedInput)
    const hostname = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '')
    const pathSegments = parsed.pathname.split('/').filter(Boolean)

    const candidate =
      hostname === 'youtu.be'
        ? pathSegments[0]
        : hostname.endsWith('youtube.com') || hostname === 'youtube-nocookie.com'
          ? parsed.searchParams.get('v') ??
            (pathSegments[0] === 'shorts' ? pathSegments[1] : null) ??
            (pathSegments[0] === 'embed' ? pathSegments[1] : null) ??
            (pathSegments[0] === 'live' ? pathSegments[1] : null) ??
            (pathSegments[0] === 'v' ? pathSegments[1] : null)
          : null

    if (candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
      return candidate
    }
  } catch {
    // URL parsing failed. Fall through to conservative pattern matching.
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^&\n?#/]+)/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export function normalizeYoutubeInput(value: string): string | null {
  const youtubeId = extractYoutubeId(value)
  if (!youtubeId) return null
  return `https://www.youtube.com/watch?v=${youtubeId}`
}

function trimNullableText(value: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function getClassName(classes: EnrollmentRow['classes']) {
  if (!classes) return '이름 없는 클래스'
  if (Array.isArray(classes)) {
    return classes[0]?.name ?? '이름 없는 클래스'
  }
  return classes.name ?? '이름 없는 클래스'
}

function isActiveEnrollmentClass(classes: EnrollmentRow['classes']) {
  if (!classes) return false
  const relation = Array.isArray(classes) ? classes[0] ?? null : classes
  if (!relation) return false
  return relation.is_active !== false
}

function toMediaRows(media: MediaRelation) {
  if (!media) return [] as MediaRow[]
  return Array.isArray(media) ? media : [media]
}

export function resolveWeeklyVideoItems(rows: MediaRow[]) {
  const ready: ReadyVideoItem[] = []
  const invalid: InvalidMediaItem[] = []

  for (const row of rows) {
    if (row.type !== 'VIDEO') continue

    const youtubeId = extractYoutubeId(row.url)

    if (!youtubeId) {
      invalid.push({
        status: 'invalid',
        mediaId: row.id,
        url: row.url,
        message: '유효한 YouTube 주소가 아닙니다.',
      })
      continue
    }

    ready.push({
      status: 'ready',
      mediaId: row.id,
      url: row.url,
      youtubeId,
    })
  }

  return {
    items: ready,
    invalidItems: invalid,
  }
}

export function getPublicStorageObjectPath(url: string, bucketId = MEDIA_BUCKET) {
  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${bucketId}/`
    const markerIndex = parsed.pathname.indexOf(marker)

    if (markerIndex === -1) return null

    const objectPath = parsed.pathname.slice(markerIndex + marker.length)
    return objectPath ? decodeURIComponent(objectPath) : null
  } catch {
    return null
  }
}

export function resolveWeeklyImageItems(rows: MediaRow[]) {
  const ready: ReadyImageItem[] = []
  const invalid: InvalidMediaItem[] = []

  for (const row of rows) {
    if (row.type !== 'IMAGE') continue

    const objectPath = getPublicStorageObjectPath(row.url)
    if (!objectPath) {
      invalid.push({
        status: 'invalid',
        mediaId: row.id,
        url: row.url,
        message: '현재 바로 열 수 없는 이미지입니다. 다시 업로드해 주세요.',
      })
      continue
    }

    ready.push({
      status: 'ready',
      mediaId: row.id,
      url: row.url,
      objectPath,
    })
  }

  return {
    items: ready,
    invalidItems: invalid,
  }
}

function buildWeeklyMediaWeek(
  log: ClassLogRow | null,
  weekNumber: number,
  userId: string | null,
): WeeklyMediaWeek {
  const rows = toMediaRows(log?.media ?? null)
  const video = resolveWeeklyVideoItems(rows)
  const image = resolveWeeklyImageItems(rows)

  const attendanceValue = userId ? log?.attendance_data?.[userId] : undefined

  return {
    weekNumber,
    logId: log?.id ?? null,
    progressText: trimNullableText(log?.progress ?? null),
    reflectionText: trimNullableText(log?.reflection ?? null),
    sharedFeedbackText: trimNullableText(log?.reflection ?? null),
    privateFeedbackText: userId ? trimNullableText(log?.member_feedback?.[userId] ?? null) : null,
    attendanceStatus:
      attendanceValue === true ? 'present' : attendanceValue === false ? 'absent' : 'pending',
    attendanceChecked: attendanceValue === true,
    video,
    image,
  }
}

function hasReadyStudentLessonMedia(week: WeeklyMediaWeek) {
  return week.video.items.length > 0 || week.image.items.length > 0
}

function buildStudentLessonWeeks(logs: ClassLogRow[], userId: string) {
  const logByWeek = new Map(
    logs
      .filter((log) => typeof log.week_number === 'number')
      .map((log) => [log.week_number as number, log]),
  )

  const allWeeks = buildVisibleWeekNumbers(MAX_CLASS_WEEKS, DEFAULT_CLASS_WEEKS).map((weekNumber) =>
    buildWeeklyMediaWeek(logByWeek.get(weekNumber) ?? null, weekNumber, userId),
  )

  const weekFive = allWeeks.find((week) => week.weekNumber === MAX_CLASS_WEEKS) ?? null

  return weekFive && hasReadyStudentLessonMedia(weekFive)
    ? allWeeks
    : allWeeks.slice(0, DEFAULT_CLASS_WEEKS)
}

export async function readAdminWeeklyMediaState(
  supabase: SupabaseClient,
  classId: string,
  yearMonth: string,
) {
  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('id, name, is_active')
    .eq('id', classId)
    .maybeSingle()

  if (classError) throw classError
  if (!classRow) return null

  const { data: classLogRows, error: classLogError } = await supabase
    .from('class_logs')
    .select(
      'id, class_id, year_month, week_number, progress, reflection, attendance_data, member_feedback, media(id, type, url, upload_method)',
    )
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .order('week_number', { ascending: true })

  if (classLogError) throw classLogError

  const logs = (classLogRows ?? []) as ClassLogRow[]
  const logByWeek = new Map(
    logs
      .filter((log) => typeof log.week_number === 'number')
      .map((log) => [log.week_number as number, log]),
  )

  return {
    classInfo: normalizeClassRow(classRow as DbClassRow),
    yearMonth,
    weeks: buildVisibleWeekNumbers(MAX_CLASS_WEEKS, MAX_CLASS_WEEKS).map((weekNumber) =>
      buildWeeklyMediaWeek(logByWeek.get(weekNumber) ?? null, weekNumber, null),
    ),
  }
}

export async function ensureWeeklyClassLog(
  supabase: SupabaseClient,
  classId: string,
  yearMonth: string,
  weekNumber: number,
) {
  const { data: existing, error: existingError } = await supabase
    .from('class_logs')
    .select('id, class_id, year_month, week_number')
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .eq('week_number', weekNumber)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing) return existing

  const { data: created, error: insertError } = await supabase
    .from('class_logs')
    .insert({
      class_id: classId,
      year_month: yearMonth,
      week_number: weekNumber,
    })
    .select('id, class_id, year_month, week_number')
    .single()

  if (!insertError) return created

  if (insertError.message.includes('duplicate key value')) {
    const { data: duplicated, error: duplicatedError } = await supabase
      .from('class_logs')
      .select('id, class_id, year_month, week_number')
      .eq('class_id', classId)
      .eq('year_month', yearMonth)
      .eq('week_number', weekNumber)
      .single()

    if (duplicatedError) throw duplicatedError
    return duplicated
  }

  throw insertError
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

export function buildWeeklyImageObjectPath(args: {
  classId: string
  yearMonth: string
  weekNumber: number
  fileName: string
  timestamp?: number
}) {
  const timestamp = args.timestamp ?? Date.now()
  return `weekly-images/${args.classId}/${args.yearMonth}/week-${args.weekNumber}/${timestamp}-${sanitizeFileName(args.fileName)}`
}

export async function readStudentClassSummaries(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('class_id, year_month, payment_status, status, classes(name, is_active)')
    .eq('student_id', userId)
    .in('status', ['ACTIVE', 'PENDING'])
    .order('year_month', { ascending: false })

  if (enrollmentError) throw enrollmentError

  const enrollments = ((enrollmentRows ?? []) as EnrollmentRow[]).filter((row) =>
    isActiveEnrollmentClass(row.classes),
  )
  if (enrollments.length === 0) return [] as StudentClassSummary[]

  const classIds = Array.from(new Set(enrollments.map((row) => row.class_id)))
  const yearMonths = Array.from(new Set(enrollments.map((row) => row.year_month)))

  const { data: classLogRows, error: classLogError } = await supabase
    .from('class_logs')
    .select(
      'id, class_id, year_month, week_number, progress, reflection, attendance_data, member_feedback, media(id, type, url, upload_method)',
    )
    .in('class_id', classIds)
    .in('year_month', yearMonths)
    .order('year_month', { ascending: false })
    .order('week_number', { ascending: true })

  if (classLogError) throw classLogError

  const logs = (classLogRows ?? []) as ClassLogRow[]

  return enrollments
    .map((row) => {
      const logsForEnrollment = logs.filter(
        (log) => log.class_id === row.class_id && log.year_month === row.year_month,
      )
      const availableWeeks = logsForEnrollment
        .map((log) => buildWeeklyMediaWeek(log, log.week_number ?? 0, userId))
        .filter((week) => isValidWeekNumber(week.weekNumber))
        .filter(hasReadyStudentLessonMedia)
        .sort((left, right) => left.weekNumber - right.weekNumber)

      const feedbackCount = logsForEnrollment.reduce((count, log) => {
        const privateFeedback = trimNullableText(log.member_feedback?.[userId] ?? null)
        const sharedFeedback = trimNullableText(log.reflection)
        return count + (privateFeedback || sharedFeedback ? 1 : 0)
      }, 0)

      return {
        classId: row.class_id,
        className: getClassName(row.classes),
        yearMonth: row.year_month,
        enrollmentStatus: (row.status === 'PENDING' ? 'PENDING' : 'ACTIVE') as 'ACTIVE' | 'PENDING',
        paymentStatus: Boolean(row.payment_status),
        attendanceChecked: logsForEnrollment.reduce(
          (count, log) => count + (log.attendance_data?.[userId] ? 1 : 0),
          0,
        ),
        attendanceTotal: logsForEnrollment.length,
        feedbackCount,
        availableWeekCount: availableWeeks.length,
        nextWeekNumber: availableWeeks[0]?.weekNumber ?? null,
      }
    })
    .sort((left, right) => {
      if (left.yearMonth !== right.yearMonth) {
        return right.yearMonth.localeCompare(left.yearMonth)
      }

      if (left.enrollmentStatus !== right.enrollmentStatus) {
        return left.enrollmentStatus === 'ACTIVE' ? -1 : 1
      }

      return left.className.localeCompare(right.className, 'ko')
    })
}

export async function readStudentClassDetail(
  supabase: SupabaseClient,
  userId: string,
  classId: string,
  yearMonth: string,
) {
  const { data: enrollmentRow, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('class_id, year_month, payment_status, status, classes(name, is_active)')
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .eq('student_id', userId)
    .in('status', ['ACTIVE', 'PENDING'])
    .maybeSingle()

  if (enrollmentError) throw enrollmentError
  if (!enrollmentRow) return null

  const enrollment = enrollmentRow as EnrollmentRow
  if (!isActiveEnrollmentClass(enrollment.classes)) return null

  const { data: classLogRows, error: classLogError } = await supabase
    .from('class_logs')
    .select(
      'id, class_id, year_month, week_number, progress, reflection, attendance_data, member_feedback, media(id, type, url, upload_method)',
    )
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .order('week_number', { ascending: true })

  if (classLogError) throw classLogError

  const logs = (classLogRows ?? []) as ClassLogRow[]
  const weeks = buildStudentLessonWeeks(logs, userId)

  return {
    classId,
    className: getClassName(enrollment.classes),
    yearMonth,
    enrollmentStatus: (enrollment.status === 'PENDING' ? 'PENDING' : 'ACTIVE') as 'ACTIVE' | 'PENDING',
    paymentStatus: Boolean(enrollment.payment_status),
    weeks,
  } satisfies StudentClassDetail
}
