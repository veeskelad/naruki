import { CALENDAR_2026 } from '@/data/calendar-2026'
import type { CalendarDay, DayKind, YearCalendar } from './types'

const REGISTRY: Record<number, YearCalendar> = {
  2026: CALENDAR_2026,
}

export function getYearCalendar(year: number): YearCalendar | null {
  return REGISTRY[year] ?? null
}

export function isoDate(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dowMon(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function getDayInfo(year: number, monthIndex: number, day: number): CalendarDay {
  const iso = isoDate(year, monthIndex, day)
  const cal = getYearCalendar(year)
  const special = cal?.days[iso]
  if (special) return special
  const date = new Date(year, monthIndex, day)
  const dow = dowMon(date)
  if (dow >= 5) {
    return { date: iso, kind: 'weekend' }
  }
  return { date: iso, kind: 'workday' }
}

export function getDayKind(year: number, monthIndex: number, day: number): DayKind {
  return getDayInfo(year, monthIndex, day).kind
}

export function isWorkDay(year: number, monthIndex: number, day: number): boolean {
  const k = getDayKind(year, monthIndex, day)
  return k === 'workday' || k === 'pre-holiday'
}

export function isOffDay(year: number, monthIndex: number, day: number): boolean {
  const k = getDayKind(year, monthIndex, day)
  return k === 'weekend' || k === 'holiday' || k === 'transfer-off'
}

export function isHoliday(year: number, monthIndex: number, day: number): boolean {
  return getDayKind(year, monthIndex, day) === 'holiday'
}

export function isTransfer(year: number, monthIndex: number, day: number): boolean {
  return getDayKind(year, monthIndex, day) === 'transfer-off'
}

export function isPreHoliday(year: number, monthIndex: number, day: number): boolean {
  return getDayKind(year, monthIndex, day) === 'pre-holiday'
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function workdaysInMonth(year: number, monthIndex: number): number {
  let count = 0
  const total = daysInMonth(year, monthIndex)
  for (let day = 1; day <= total; day++) {
    if (isWorkDay(year, monthIndex, day)) count++
  }
  return count
}

export function workdaysInYear(year: number): number {
  let count = 0
  for (let m = 0; m < 12; m++) count += workdaysInMonth(year, m)
  return count
}

export interface MonthDay {
  day: number
  date: string
  kind: DayKind
  name?: string
  note?: string
  dow: number
}

export function iterMonth(year: number, monthIndex: number): MonthDay[] {
  const total = daysInMonth(year, monthIndex)
  const out: MonthDay[] = []
  for (let day = 1; day <= total; day++) {
    const info = getDayInfo(year, monthIndex, day)
    const dow = dowMon(new Date(year, monthIndex, day))
    out.push({
      day,
      date: info.date,
      kind: info.kind,
      name: info.name,
      note: info.note,
      dow,
    })
  }
  return out
}

export function* iterYear(year: number): Generator<MonthDay & { monthIndex: number }> {
  for (let m = 0; m < 12; m++) {
    for (const d of iterMonth(year, m)) {
      yield { ...d, monthIndex: m }
    }
  }
}

export function addDays(iso: string, n: number): string {
  const d = parseIso(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d.getFullYear(), d.getMonth(), d.getDate())
}

export function diffDays(a: string, b: string): number {
  const da = parseIso(a).getTime()
  const db = parseIso(b).getTime()
  return Math.round((db - da) / (1000 * 60 * 60 * 24))
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}
