import { addDays, parseIso } from '@/lib/calendar'
import { downloadText } from './download'

function compactDate(iso: string): string {
  return iso.replaceAll('-', '')
}

export function exportVacationIcs(year: number, dates: Set<string>): void {
  const events = [...dates]
    .sort()
    .map((date) => {
      const next = addDays(date, 1)
      return [
        'BEGIN:VEVENT',
        `UID:${date}-vacation@naruki.space`,
        'SUMMARY:Отпуск',
        `DTSTART;VALUE=DATE:${compactDate(date)}`,
        `DTEND;VALUE=DATE:${compactDate(next)}`,
        'END:VEVENT',
      ].join('\r\n')
    })

  downloadText(
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Naruki//Vacation//RU',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n'),
    `naruki-vacation-${year}.ics`,
    'text/calendar;charset=utf-8',
  )
}

export function exportVacationCsv(year: number, dates: Set<string>): void {
  const formatter = new Intl.DateTimeFormat('ru-RU')
  const rows = [
    ['Дата', 'День недели'],
    ...[...dates].sort().map((iso) => {
      const date = parseIso(iso)
      return [
        formatter.format(date),
        new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date),
      ]
    }),
  ]
  downloadText(
    `\uFEFF${rows.map((row) => row.join(';')).join('\r\n')}`,
    `naruki-vacation-${year}.csv`,
    'text/csv;charset=utf-8',
  )
}

