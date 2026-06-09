import { addDays, getDayInfo, isoDate, parseIso } from '@/lib/calendar'
import type {
  MonthSummary,
  PaymentEvent,
  PaymentSchedule,
  TaxMode,
} from './types'

const DEFAULT_SCHEDULE: PaymentSchedule = {
  advanceDay: 25,
  salaryDay: 10,
  advanceShare: 0.4,
}

function clampDay(year: number, month: number, day: number): number {
  const max = new Date(year, month + 1, 0).getDate()
  return Math.max(1, Math.min(max, day))
}

function previousWorkday(date: string): string {
  let cursor = date
  while (true) {
    const parsed = parseIso(cursor)
    const info = getDayInfo(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
    )
    if (info.kind === 'workday' || info.kind === 'pre-holiday') return cursor
    cursor = addDays(cursor, -1)
  }
}

function scheduledDate(
  year: number,
  month: number,
  day: number,
): { date: string; originalDate: string; shifted: boolean } {
  const normalizedYear = year + Math.floor(month / 12)
  const normalizedMonth = ((month % 12) + 12) % 12
  const originalDate = isoDate(
    normalizedYear,
    normalizedMonth,
    clampDay(normalizedYear, normalizedMonth, day),
  )
  const date = previousWorkday(originalDate)
  return { date, originalDate, shifted: date !== originalDate }
}

export function buildPaymentEvents(
  year: number,
  mode: TaxMode,
  months: MonthSummary[],
  schedule: PaymentSchedule = DEFAULT_SCHEDULE,
): PaymentEvent[] {
  const events: PaymentEvent[] = []

  for (const month of months) {
    if (mode !== 'tk_rf') {
      const timing = scheduledDate(year, month.month, 28)
      events.push({
        ...timing,
        kind: 'income',
        forMonth: month.month,
        gross: month.gross,
        tax: month.tax + month.contributions,
        net: month.net,
      })
      continue
    }

    const advanceGross = Math.round(month.gross * schedule.advanceShare)
    const advanceTax = Math.round(month.tax * schedule.advanceShare)
    const advanceNet = advanceGross - advanceTax
    const salaryGross = month.gross - advanceGross
    const salaryTax = month.tax - advanceTax
    const salaryNet = salaryGross - salaryTax
    const advanceTiming = scheduledDate(
      year,
      month.month,
      schedule.advanceDay,
    )
    const salaryTiming = scheduledDate(
      year,
      month.month + 1,
      schedule.salaryDay,
    )

    events.push({
      ...advanceTiming,
      kind: 'advance',
      forMonth: month.month,
      gross: advanceGross,
      tax: advanceTax,
      net: advanceNet,
      note: advanceTiming.shifted
        ? 'Дата перенесена на предыдущий рабочий день'
        : undefined,
    })
    events.push({
      ...salaryTiming,
      kind: 'salary',
      forMonth: month.month,
      gross: salaryGross,
      tax: salaryTax,
      net: salaryNet,
      note: salaryTiming.shifted
        ? 'Дата перенесена на предыдущий рабочий день'
        : undefined,
    })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
