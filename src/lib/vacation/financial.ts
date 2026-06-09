import { workdaysInMonth } from '@/lib/calendar'

export interface MonthRating {
  month: number
  workdays: number
  financialScore: number
  comment: string
}

export function buildMonthRatings(year: number): MonthRating[] {
  const workdays = Array.from({ length: 12 }, (_, month) =>
    workdaysInMonth(year, month),
  )
  const max = Math.max(...workdays)
  return workdays.map((count, month) => {
    const financialScore = Math.round((count / max) * 10)
    const comment =
      financialScore >= 9
        ? 'Много рабочих дней: отпуск обычно меньше снижает месячный доход.'
        : financialScore >= 7
          ? 'Сбалансированный месяц по количеству рабочих дней.'
          : 'Рабочих дней мало: каждый пропущенный день заметнее влияет на зарплату.'
    return { month, workdays: count, financialScore, comment }
  })
}

