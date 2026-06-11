import { addDays, parseIso } from '@/lib/calendar'
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

export function buildVacationClipboardText(
  year: number,
  dates: Iterable<string>,
  vacationDays: number,
  totalRestDays: number,
): string {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const localizedDates = uniqueSortedDates(dates).map((iso) =>
    formatter.format(parseIso(iso)),
  )
  const datesText = localizedDates.join(', ').replace(/\.$/, '')
  return `Отпуск ${year}: ${datesText}. ${vacationDays} ${pluralDays(vacationDays)} отпуска → ${totalRestDays} ${pluralDays(totalRestDays)} отдыха.`
}

function pluralDays(value: number): string {
  const mod100 = value % 100
  const mod10 = value % 10
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
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
