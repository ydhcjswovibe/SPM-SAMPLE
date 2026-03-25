export const MAX_CALENDAR_WEEKS_IN_MONTH = 5

export function getCurrentYearMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getCurrentWeekOfMonth(date = new Date()) {
  return Math.min(MAX_CALENDAR_WEEKS_IN_MONTH, Math.max(1, Math.ceil(date.getDate() / 7)))
}

export function clampWeekNumber(weekNumber: number, maxWeekNumber = MAX_CALENDAR_WEEKS_IN_MONTH) {
  if (!Number.isInteger(weekNumber)) {
    return 1
  }

  return Math.min(maxWeekNumber, Math.max(1, weekNumber))
}

export function resolveDefaultWeekNumber(maxWeekNumber = MAX_CALENDAR_WEEKS_IN_MONTH, date = new Date()) {
  return clampWeekNumber(getCurrentWeekOfMonth(date), maxWeekNumber)
}
