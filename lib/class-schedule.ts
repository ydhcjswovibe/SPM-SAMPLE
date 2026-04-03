import type { SupabaseClient } from '@supabase/supabase-js'

export const WEEKDAY_OPTIONS = [
  { value: 0, label: '일' },
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
] as const

export const SCHEDULE_HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
export const SCHEDULE_MINUTE_OPTIONS = ['00', '30'] as const

export type WeekdayValue = (typeof WEEKDAY_OPTIONS)[number]['value']
export type ClassSessionSource = 'RULE' | 'MANUAL' | 'LEGACY'

export interface ClassScheduleRule {
  id: string
  classId: string
  weekday: number
  startTime: string
  endTime: string | null
  sortOrder: number
  isActive: boolean
}

export interface ClassSessionRow {
  id: string
  classId: string
  yearMonth: string
  weekNumber: number
  sessionDate: string
  startTime: string
  endTime: string | null
  source: ClassSessionSource
}

export interface GeneratedClassSessionInput {
  class_id: string
  year_month: string
  week_number: number
  session_date: string
  start_time: string
  end_time: string | null
  source: Exclude<ClassSessionSource, 'LEGACY'>
}

export interface SessionWeekGroup<TSession extends Pick<ClassSessionRow, 'weekNumber' | 'sessionDate'>> {
  weekNumber: number
  sessions: TSession[]
}

type DbScheduleRuleRow = {
  id: string
  class_id: string
  weekday: number
  start_time: string
  end_time: string | null
  sort_order: number | null
  is_active: boolean | null
}

type DbSessionRow = {
  id: string
  class_id: string
  year_month: string
  week_number: number
  session_date: string
  start_time: string
  end_time: string | null
  source: ClassSessionSource | null
}

function padNumber(value: number) {
  return String(value).padStart(2, '0')
}

function buildLocalDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function isValidDateInstance(value: Date) {
  return Number.isFinite(value.getTime())
}

export function isValidTimeValue(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function normalizeTimeValue(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return isValidTimeValue(trimmed) ? trimmed : null
}

export function splitTimeValue(value: string | null | undefined) {
  const normalized = normalizeTimeValue(value)

  if (!normalized) {
    return {
      hour: '',
      minute: SCHEDULE_MINUTE_OPTIONS[0],
    }
  }

  const [hour, minute] = normalized.split(':')
  return {
    hour: hour ?? '',
    minute: minute ?? SCHEDULE_MINUTE_OPTIONS[0],
  }
}

export function buildTimeValue(hour: string | null | undefined, minute: string | null | undefined) {
  if (!hour) {
    return ''
  }

  const normalizedHour = SCHEDULE_HOUR_OPTIONS.includes(hour) ? hour : null
  const normalizedMinute = SCHEDULE_MINUTE_OPTIONS.includes((minute ?? '') as (typeof SCHEDULE_MINUTE_OPTIONS)[number])
    ? minute
    : SCHEDULE_MINUTE_OPTIONS[0]

  if (!normalizedHour || !normalizedMinute) {
    return ''
  }

  return `${normalizedHour}:${normalizedMinute}`
}

export function getDefaultEndTimeFromStart(startTime: string | null | undefined, durationHours = 2) {
  const normalized = normalizeTimeValue(startTime)

  if (!normalized || !Number.isFinite(durationHours)) {
    return null
  }

  const [hourText, minuteText] = normalized.split(':')
  const startMinutes = Number(hourText) * 60 + Number(minuteText)

  if (!Number.isFinite(startMinutes)) {
    return null
  }

  const nextMinutes = Math.min(startMinutes + durationHours * 60, 23 * 60 + 30)
  const nextHour = Math.floor(nextMinutes / 60)
  const nextMinute = nextMinutes % 60

  return buildTimeValue(String(nextHour).padStart(2, '0'), String(nextMinute).padStart(2, '0'))
}

export function applyAutoEndTime(startTime: string | null | undefined, currentEndTime: string | null | undefined) {
  if (typeof currentEndTime === 'string' && currentEndTime.trim()) {
    return currentEndTime
  }

  return getDefaultEndTimeFromStart(startTime) ?? ''
}

export function shouldAutoAdjustEndTime(startTime: string | null | undefined, endTime: string | null | undefined) {
  const normalizedEnd = normalizeTimeValue(endTime)

  if (!normalizedEnd) {
    return true
  }

  return normalizedEnd === getDefaultEndTimeFromStart(startTime)
}

export function normalizeWeekdayValue(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 6 ? value : null
}

export function isValidSessionDateForYearMonth(sessionDate: string, yearMonth: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(sessionDate) && sessionDate.startsWith(`${yearMonth}-`)
}

export function getWeekdayLabel(weekday: number) {
  return WEEKDAY_OPTIONS.find((option) => option.value === weekday)?.label ?? '?'
}

export function getWeekdayFromDate(sessionDate: string) {
  const date = buildLocalDate(sessionDate)
  return isValidDateInstance(date) ? date.getDay() : null
}

export function getWeekNumberFromSessionDate(sessionDate: string) {
  const date = buildLocalDate(sessionDate)
  if (!isValidDateInstance(date)) {
    return 1
  }

  return Math.min(5, Math.max(1, Math.ceil(date.getDate() / 7)))
}

export function formatSessionDateLabel(sessionDate: string) {
  const date = buildLocalDate(sessionDate)
  if (!isValidDateInstance(date)) {
    return sessionDate
  }

  const weekday = getWeekdayLabel(date.getDay())
  return `${date.getMonth() + 1}/${date.getDate()} ${weekday}`
}

export function formatSessionShortDateLabel(sessionDate: string) {
  const date = buildLocalDate(sessionDate)
  if (!isValidDateInstance(date)) {
    return sessionDate
  }

  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function formatSessionTimeRangeLabel(startTime: string | null | undefined, endTime: string | null | undefined) {
  const normalizedStart = normalizeTimeValue(startTime)
  const normalizedEnd = normalizeTimeValue(endTime)

  if (!normalizedStart && !normalizedEnd) {
    return null
  }

  if (normalizedStart && normalizedEnd) {
    return `${normalizedStart} - ${normalizedEnd}`
  }

  return normalizedStart ?? normalizedEnd
}

export function formatSessionSurfaceLabel(sessionDate: string, startTime: string | null | undefined) {
  const dateLabel = formatSessionDateLabel(sessionDate)
  const timeLabel = formatSessionTimeRangeLabel(startTime, null)
  return timeLabel ? `${dateLabel} ${timeLabel}` : dateLabel
}

export function sortSessions<TSession extends Pick<ClassSessionRow, 'sessionDate' | 'startTime'>>(sessions: TSession[]) {
  return [...sessions].sort((left, right) => {
    if (left.sessionDate !== right.sessionDate) {
      return left.sessionDate.localeCompare(right.sessionDate)
    }

    return (left.startTime ?? '').localeCompare(right.startTime ?? '')
  })
}

export function buildSessionWeekGroups<TSession extends Pick<ClassSessionRow, 'weekNumber' | 'sessionDate' | 'startTime'>>(
  sessions: TSession[],
) {
  const grouped = new Map<number, TSession[]>()

  for (const session of sortSessions(sessions)) {
    const current = grouped.get(session.weekNumber) ?? []
    current.push(session)
    grouped.set(session.weekNumber, current)
  }

  return Array.from(grouped.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([weekNumber, weekSessions]) => ({
      weekNumber,
      sessions: weekSessions,
    })) satisfies SessionWeekGroup<TSession>[]
}

export function formatWeekSessionRangeLabel<TSession extends Pick<ClassSessionRow, 'sessionDate'>>(
  sessions: TSession[],
) {
  if (sessions.length === 0) {
    return null
  }

  const sorted = sortSessions(sessions.map((session) => ({
    ...session,
    startTime: '',
  })))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  if (!first || !last) {
    return null
  }

  if (first.sessionDate === last.sessionDate) {
    return formatSessionShortDateLabel(first.sessionDate)
  }

  return `${formatSessionShortDateLabel(first.sessionDate)} · ${formatSessionShortDateLabel(last.sessionDate)}`
}

export function resolveDefaultWeekNumberFromSessions<TWeek extends {
  weekNumber: number
  sessions?: Array<{ sessionDate: string }>
}>(weeks: TWeek[], targetYearMonth: string, date = new Date()) {
  if (weeks.length === 0) {
    return null
  }

  const normalizedToday = `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
  const currentYearMonth = `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`

  if (targetYearMonth === currentYearMonth) {
    const containingWeek = weeks.find((week) => week.sessions?.some((session) => session.sessionDate === normalizedToday))
    if (containingWeek) {
      return containingWeek.weekNumber
    }

    const upcomingWeek = weeks.find((week) => {
      const nextDate = week.sessions?.[0]?.sessionDate
      return Boolean(nextDate && nextDate >= normalizedToday)
    })

    if (upcomingWeek) {
      return upcomingWeek.weekNumber
    }
  }

  return weeks[0]?.weekNumber ?? null
}

export function normalizeScheduleRuleRows(rows: DbScheduleRuleRow[]) {
  return rows
    .map((row) => ({
      id: row.id,
      classId: row.class_id,
      weekday: row.weekday,
      startTime: row.start_time,
      endTime: row.end_time,
      sortOrder: row.sort_order ?? 0,
      isActive: row.is_active !== false,
    }))
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder
      }

      if (left.weekday !== right.weekday) {
        return left.weekday - right.weekday
      }

      return left.startTime.localeCompare(right.startTime)
    }) satisfies ClassScheduleRule[]
}

export function normalizeSessionRows(rows: DbSessionRow[]) {
  return rows
    .map((row) => ({
      id: row.id,
      classId: row.class_id,
      yearMonth: row.year_month,
      weekNumber: row.week_number,
      sessionDate: row.session_date,
      startTime: row.start_time,
      endTime: row.end_time,
      source: row.source ?? 'MANUAL',
    }))
    .sort((left, right) => {
      if (left.sessionDate !== right.sessionDate) {
        return left.sessionDate.localeCompare(right.sessionDate)
      }

      return left.startTime.localeCompare(right.startTime)
    }) satisfies ClassSessionRow[]
}

export function buildGeneratedSessionsFromRules(args: {
  classId: string
  yearMonth: string
  rules: Array<Pick<ClassScheduleRule, 'weekday' | 'startTime' | 'endTime' | 'isActive'>>
}) {
  const [yearString, monthString] = args.yearMonth.split('-')
  const year = Number(yearString)
  const monthIndex = Number(monthString) - 1

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return [] as GeneratedClassSessionInput[]
  }

  const monthStart = new Date(year, monthIndex, 1)
  const monthEnd = new Date(year, monthIndex + 1, 0)
  const sessions: GeneratedClassSessionInput[] = []

  for (const rule of args.rules) {
    if (!rule.isActive) {
      continue
    }

    const weekday = normalizeWeekdayValue(rule.weekday)
    const startTime = normalizeTimeValue(rule.startTime)

    if (weekday === null || !startTime) {
      continue
    }

    for (let day = monthStart.getDate(); day <= monthEnd.getDate(); day += 1) {
      const candidate = new Date(year, monthIndex, day)
      if (candidate.getDay() !== weekday) {
        continue
      }

      const sessionDate = `${year}-${padNumber(monthIndex + 1)}-${padNumber(day)}`
      sessions.push({
        class_id: args.classId,
        year_month: args.yearMonth,
        week_number: getWeekNumberFromSessionDate(sessionDate),
        session_date: sessionDate,
        start_time: startTime,
        end_time: normalizeTimeValue(rule.endTime),
        source: 'RULE',
      })
    }
  }

  return sessions.sort((left, right) => {
    if (left.session_date !== right.session_date) {
      return left.session_date.localeCompare(right.session_date)
    }

    return left.start_time.localeCompare(right.start_time)
  })
}

export function isMissingRelationMessage(message: string) {
  return (
    message.includes('does not exist') ||
    message.includes('could not find') ||
    message.includes('relation') ||
    message.includes('schema cache')
  )
}

export async function readClassScheduleRules(
  supabase: SupabaseClient,
  classId: string,
) {
  const { data, error } = await supabase
    .from('class_schedule_rules')
    .select('id, class_id, weekday, start_time, end_time, sort_order, is_active')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true })
    .order('weekday', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    if (isMissingRelationMessage(error.message)) {
      return null
    }

    throw error
  }

  return normalizeScheduleRuleRows((data ?? []) as DbScheduleRuleRow[])
}

export async function readClassSessionsForMonth(
  supabase: SupabaseClient,
  classId: string,
  yearMonth: string,
) {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('id, class_id, year_month, week_number, session_date, start_time, end_time, source')
    .eq('class_id', classId)
    .eq('year_month', yearMonth)
    .order('session_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    if (isMissingRelationMessage(error.message)) {
      return null
    }

    throw error
  }

  return normalizeSessionRows((data ?? []) as DbSessionRow[])
}

export async function ensureClassSessionsForMonth(
  supabase: SupabaseClient,
  classId: string,
  yearMonth: string,
) {
  const existing = await readClassSessionsForMonth(supabase, classId, yearMonth)
  if (existing === null) {
    return null
  }

  if (existing.length > 0) {
    return existing
  }

  const rules = await readClassScheduleRules(supabase, classId)
  if (rules === null || rules.length === 0) {
    return []
  }

  const generated = buildGeneratedSessionsFromRules({
    classId,
    yearMonth,
    rules,
  })

  if (generated.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('class_sessions')
    .insert(generated)
    .select('id, class_id, year_month, week_number, session_date, start_time, end_time, source')

  if (error) {
    if (error.message.includes('duplicate key value')) {
      const duplicated = await readClassSessionsForMonth(supabase, classId, yearMonth)
      return duplicated ?? []
    }

    if (isMissingRelationMessage(error.message)) {
      return null
    }

    throw error
  }

  return normalizeSessionRows((data ?? []) as DbSessionRow[])
}
