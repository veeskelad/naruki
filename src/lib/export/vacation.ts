import { addDays, isOffDay, parseIso } from '@/lib/calendar'
import { MONTH_NAMES_RU_GENITIVE } from '@/lib/calendar/types'
import { downloadText } from './download'

const CRLF = '\r\n'

function compactDate(iso: string): string {
  return iso.replaceAll('-', '')
}

function uniqueSortedDates(dates: Iterable<string>): string[] {
  return [...new Set(dates)].sort()
}

function compactUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

function csvValue(value: string): string {
  return /[;"\r\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value
}

export function buildVacationIcs(
  dates: Iterable<string>,
  generatedAt = new Date(),
): string {
  const stamp = compactUtc(generatedAt)
  const events = uniqueSortedDates(dates)
    .map((date) => {
      const next = addDays(date, 1)
      return [
        'BEGIN:VEVENT',
        `UID:${date}-vacation@naruki.space`,
        `DTSTAMP:${stamp}`,
        'SUMMARY:Отпуск',
        `DTSTART;VALUE=DATE:${compactDate(date)}`,
        `DTEND;VALUE=DATE:${compactDate(next)}`,
        'END:VEVENT',
      ].join(CRLF)
    })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Naruki//Vacation//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
    '',
  ].join(CRLF)
}

export function buildVacationCsv(dates: Iterable<string>): string {
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
  })
  const rows = [
    ['Дата', 'День недели'],
    ...uniqueSortedDates(dates).map((iso) => {
      const date = parseIso(iso)
      return [
        dateFormatter.format(date),
        weekdayFormatter.format(date),
      ]
    }),
  ]

  return `\uFEFF${rows
    .map((row) => row.map(csvValue).join(';'))
    .join(CRLF)}${CRLF}`
}

export function buildVacationClipboardText(dates: Iterable<string>): string {
  return groupVacationPeriods(dates)
    .map(({ start, end }) => formatPeriod(start, end))
    .join('; ')
}

function groupVacationPeriods(
  dates: Iterable<string>,
): Array<{ start: string; end: string }> {
  const sorted = uniqueSortedDates(dates)
  if (sorted.length === 0) return []

  const periods: Array<{ start: string; end: string }> = []
  let current = { start: sorted[0], end: sorted[0] }

  for (const date of sorted.slice(1)) {
    let cursor = addDays(current.end, 1)
    while (cursor < date && isOff(cursor)) cursor = addDays(cursor, 1)
    if (cursor === date) {
      current.end = date
    } else {
      periods.push(current)
      current = { start: date, end: date }
    }
  }
  periods.push(current)
  return periods
}

function isOff(iso: string): boolean {
  const date = parseIso(iso)
  return isOffDay(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatPeriod(startIso: string, endIso: string): string {
  const start = parseIso(startIso)
  const end = parseIso(endIso)
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = MONTH_NAMES_RU_GENITIVE[start.getMonth()]
  const endMonth = MONTH_NAMES_RU_GENITIVE[end.getMonth()]
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()

  if (startIso === endIso) {
    return `${startDay} ${startMonth} ${startYear} г.`
  }
  if (startYear === endYear && start.getMonth() === end.getMonth()) {
    return `${startDay}–${endDay} ${endMonth} ${endYear} г.`
  }
  if (startYear === endYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear} г.`
  }
  return `${startDay} ${startMonth} ${startYear} г. – ${endDay} ${endMonth} ${endYear} г.`
}

export function exportVacationIcs(year: number, dates: Set<string>): void {
  downloadText(
    buildVacationIcs(dates),
    `naruki-vacation-${year}.ics`,
    'text/calendar;charset=utf-8',
  )
}

export function exportVacationCsv(year: number, dates: Set<string>): void {
  downloadText(
    buildVacationCsv(dates),
    `naruki-vacation-${year}.csv`,
    'text/csv;charset=utf-8',
  )
}
