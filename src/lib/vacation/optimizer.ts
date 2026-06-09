import {
  addDays,
  diffDays,
  isOffDay,
  isSameMonth,
  isWorkDay,
  isoDate,
  parseIso,
} from '@/lib/calendar'

export interface VacationOption {
  startDate: string
  endDate: string
  vacationDates: string[]
  vacationDays: number
  restStart: string
  restEnd: string
  restDays: number
  leverage: number
  financialScore: number
  explanation: string
  isTopChoice?: boolean
}

export type AnalysisMode = 'max_rest' | 'balanced' | 'max_financial'

export interface OptimizerOptions {
  mode?: AnalysisMode
  preferLong?: boolean
  withinMonth: boolean
  topN?: number
}

function isOff(iso: string): boolean {
  const d = parseIso(iso)
  return isOffDay(d.getFullYear(), d.getMonth(), d.getDate())
}

function isWork(iso: string): boolean {
  const d = parseIso(iso)
  return isWorkDay(d.getFullYear(), d.getMonth(), d.getDate())
}

function expandRest(firstVac: string, lastVac: string): { restStart: string; restEnd: string } {
  let restStart = firstVac
  while (true) {
    const prev = addDays(restStart, -1)
    if (!prev.startsWith(firstVac.slice(0, 4))) break
    if (isOff(prev)) restStart = prev
    else break
  }
  let restEnd = lastVac
  while (true) {
    const next = addDays(restEnd, 1)
    if (!next.startsWith(lastVac.slice(0, 4))) break
    if (isOff(next)) restEnd = next
    else break
  }
  return { restStart, restEnd }
}

function buildOption(
  year: number,
  startWorkIso: string,
  daysOff: number,
  financialScores: number[],
): VacationOption | null {
  const vacationDates: string[] = []
  let cursor = startWorkIso
  while (vacationDates.length < daysOff) {
    if (!cursor.startsWith(String(year))) return null
    if (isWork(cursor)) {
      vacationDates.push(cursor)
    }
    cursor = addDays(cursor, 1)
  }
  const firstVac = vacationDates[0]
  const lastVac = vacationDates[vacationDates.length - 1]
  const { restStart, restEnd } = expandRest(firstVac, lastVac)
  const restDays = diffDays(restStart, restEnd) + 1
  const monthCounts = new Map<number, number>()
  vacationDates.forEach((date) => {
    const month = parseIso(date).getMonth()
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1)
  })
  const primaryMonth = [...monthCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] ?? 0
  const financialScore = financialScores[primaryMonth] ?? 0
  return {
    startDate: firstVac,
    endDate: lastVac,
    vacationDates,
    vacationDays: daysOff,
    restStart,
    restEnd,
    restDays,
    leverage: restDays / daysOff,
    financialScore,
    explanation: `Используете ${daysOff} ${vacationDaysWord(daysOff)}, а отдых длится ${restDays} ${calendarDaysWord(restDays)} благодаря соседним выходным и праздникам.`,
  }
}

function overlaps(a: VacationOption, b: VacationOption): boolean {
  const aStart = parseIso(a.restStart).getTime()
  const aEnd = parseIso(a.restEnd).getTime()
  const bStart = parseIso(b.restStart).getTime()
  const bEnd = parseIso(b.restEnd).getTime()
  return !(aEnd < bStart || bEnd < aStart)
}

export function findBestVacations(
  year: number,
  daysOff: number,
  options: OptimizerOptions,
): VacationOption[] {
  if (daysOff <= 0) return []
  const {
    mode = options.preferLong === false ? 'balanced' : 'max_rest',
    withinMonth,
    topN = 5,
  } = options
  const candidates: VacationOption[] = []
  const workdays = Array.from({ length: 12 }, (_, month) => {
    let count = 0
    const total = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= total; day++) {
      if (isWorkDay(year, month, day)) count++
    }
    return count
  })
  const maxWorkdays = Math.max(...workdays)
  const financialScores = workdays.map((count) =>
    Math.round((count / maxWorkdays) * 10),
  )
  const yearStart = isoDate(year, 0, 1)
  const yearEnd = isoDate(year, 11, 31)
  let cursor = yearStart
  while (cursor <= yearEnd) {
    if (isWork(cursor)) {
      const opt = buildOption(year, cursor, daysOff, financialScores)
      if (opt) {
        if (!withinMonth || isSameMonth(opt.startDate, opt.endDate)) {
          candidates.push(opt)
        }
      }
    }
    cursor = addDays(cursor, 1)
  }
  const maxLeverage = Math.max(...candidates.map((candidate) => candidate.leverage), 1)
  candidates.sort((a, b) => {
    if (mode === 'max_rest') {
      if (b.restDays !== a.restDays) return b.restDays - a.restDays
      return b.leverage - a.leverage
    }
    if (mode === 'max_financial') {
      if (b.financialScore !== a.financialScore) {
        return b.financialScore - a.financialScore
      }
      return b.leverage - a.leverage
    }
    const score = (candidate: VacationOption) =>
      0.6 * (candidate.leverage / maxLeverage) +
      0.4 * (candidate.financialScore / 10)
    return score(b) - score(a)
  })

  const picked: VacationOption[] = []
  for (const c of candidates) {
    if (picked.length >= topN) break
    if (picked.some((p) => overlaps(p, c))) continue
    picked.push(c)
  }
  if (picked[0]) picked[0].isTopChoice = true
  return picked
}

function vacationDaysWord(n: number): string {
  return pluralRu(n, ['день отпуска', 'дня отпуска', 'дней отпуска'])
}

function calendarDaysWord(n: number): string {
  return pluralRu(n, ['календарный день', 'календарных дня', 'календарных дней'])
}

export function pluralRu(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

export function vacationDaysLabel(n: number): string {
  return `${n} ${pluralRu(n, ['день', 'дня', 'дней'])}`
}

export function restDaysLabel(n: number): string {
  return `${n} ${pluralRu(n, ['день', 'дня', 'дней'])} отдыха`
}
