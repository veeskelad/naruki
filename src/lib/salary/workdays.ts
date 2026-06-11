import { daysInMonth, isWorkDay, isoDate } from '@/lib/calendar'
import type { MonthSummary } from './types'

export interface WorkdayAdjustment {
  firstHalf: number
  secondHalf: number
}

export type WorkdayAdjustments = Record<number, WorkdayAdjustment>

export interface AdjustedMonthSummary {
  defaultFirstHalf: number
  defaultSecondHalf: number
  firstHalf: number
  secondHalf: number
  totalDays: number
  ratio: number
  gross: number
  tax: number
  contributions: number
  net: number
  advanceNet: number
  salaryNet: number
}

export function countWorkdays(
  year: number,
  monthIndex: number,
  startDay: number,
  endDay: number,
): number {
  let count = 0
  for (let day = startDay; day <= endDay; day++) {
    if (isWorkDay(year, monthIndex, day)) count++
  }
  return count
}

export function previousWorkdayDate(
  year: number,
  monthIndex: number,
  day: number,
): string {
  const date = new Date(year, monthIndex, day)
  while (true) {
    const y = date.getFullYear()
    const m = date.getMonth()
    const d = date.getDate()
    if (isWorkDay(y, m, d)) return isoDate(y, m, d)
    date.setDate(date.getDate() - 1)
  }
}

export function adjustedMonthSummary(
  year: number,
  month: MonthSummary,
  adjustment?: WorkdayAdjustment,
): AdjustedMonthSummary {
  const defaultFirstHalf = countWorkdays(year, month.month, 1, 15)
  const defaultSecondHalf = countWorkdays(
    year,
    month.month,
    16,
    daysInMonth(year, month.month),
  )
  const firstHalf = clamp(
    adjustment?.firstHalf ?? defaultFirstHalf,
    0,
    defaultFirstHalf,
  )
  const secondHalf = clamp(
    adjustment?.secondHalf ?? defaultSecondHalf,
    0,
    defaultSecondHalf,
  )
  const totalDays = firstHalf + secondHalf
  const defaultTotal = defaultFirstHalf + defaultSecondHalf
  const ratio = defaultTotal > 0 ? totalDays / defaultTotal : 0
  const gross = Math.round(month.gross * ratio)
  const tax = Math.round(month.tax * ratio)
  const contributions = Math.round(month.contributions * ratio)
  const net = Math.round(month.net * ratio)
  const advanceNet =
    totalDays > 0 ? Math.round((net * firstHalf) / totalDays) : 0

  return {
    defaultFirstHalf,
    defaultSecondHalf,
    firstHalf,
    secondHalf,
    totalDays,
    ratio,
    gross,
    tax,
    contributions,
    net,
    advanceNet,
    salaryNet: net - advanceNet,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
