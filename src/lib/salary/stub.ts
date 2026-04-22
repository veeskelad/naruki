// Упрощённая стаб-модель расчёта зарплаты.
// Заменит настоящий src/lib/salary/tk-rf.ts и др. после MVP.

export type TaxMode = 'tk' | 'npd' | 'ip_usn' | 'custom'

export interface CalcInput {
  mode: TaxMode
  grossMonthly: number // до налогов, ₽/мес
  // TK
  children?: number // 0..3+ (3 means «3 и больше»)
  useProgressive?: boolean
  useChildDeduction?: boolean
  // NPD
  npdLegalSharePct?: number // 0..100
  // IP USN 6%
  usnContributionsYear?: number // ₽ за год
  // Custom
  customRatePct?: number
}

export interface MonthRow {
  idx: number // 0..11
  advance: number
  salary: number
  tax: number
  take: number
  cumulative: number
}

export interface CalcResult {
  monthly: MonthRow[]
  totals: {
    gross: number
    tax: number
    take: number
    effectiveRatePct: number
  }
  avgMonthlyTake: number
}

const CHILD_DEDUCTION_CAP = 450_000 // YTD лимит для стандартных вычетов
const PROGRESSIVE_THRESHOLD = 2_400_000 // с 2025 — 15% после 2.4M YTD

function childDeductionMonthly(kids: number): number {
  // Упрощённая шкала: 1400 на 1-го, 1400 на 2-го, 3000 на 3-го и далее.
  const first = Math.min(kids, 2) * 1400
  const rest = Math.max(kids - 2, 0) * 3000
  return first + rest
}

function calcTK(input: CalcInput): CalcResult {
  const {
    grossMonthly,
    children = 0,
    useProgressive = true,
    useChildDeduction = true,
  } = input
  const kids = children
  const monthly: MonthRow[] = []
  let ytdGross = 0
  let ytdTax = 0
  let cumulative = 0

  for (let i = 0; i < 12; i++) {
    const monthGross = grossMonthly
    const ytdGrossAtStart = ytdGross

    // Стандартный вычет за месяц (пока YTD не превысил 450k).
    const deduction =
      useChildDeduction && kids > 0 && ytdGrossAtStart < CHILD_DEDUCTION_CAP
        ? childDeductionMonthly(kids)
        : 0

    const taxable = Math.max(0, monthGross - deduction)

    // Прогрессивная шкала, упрощённая (13% / 15% после 2.4M YTD).
    let tax = 0
    if (useProgressive) {
      const prevOver = Math.max(0, ytdGrossAtStart - PROGRESSIVE_THRESHOLD)
      const currOver = Math.max(
        0,
        ytdGrossAtStart + taxable - PROGRESSIVE_THRESHOLD,
      )
      const inHigh = Math.max(0, currOver - prevOver)
      const inLow = Math.max(0, taxable - inHigh)
      tax = Math.round(inLow * 0.13 + inHigh * 0.15)
    } else {
      tax = Math.round(taxable * 0.13)
    }

    const take = monthGross - tax
    // Условная разбивка на аванс 40% / зарплата 60% (после налога).
    const advance = Math.round(take * 0.4)
    const salary = take - advance

    ytdGross += monthGross
    ytdTax += tax
    cumulative += take
    monthly.push({ idx: i, advance, salary, tax, take, cumulative })
  }

  return finalise(monthly, ytdGross, ytdTax)
}

function calcNPD(input: CalcInput): CalcResult {
  const { grossMonthly, npdLegalSharePct = 60 } = input
  const legalShare = Math.min(100, Math.max(0, npdLegalSharePct)) / 100
  const monthly: MonthRow[] = []
  let ytdGross = 0
  let ytdTax = 0
  let cumulative = 0

  for (let i = 0; i < 12; i++) {
    const fromLegal = grossMonthly * legalShare
    const fromFL = grossMonthly - fromLegal
    const tax = Math.round(fromLegal * 0.06 + fromFL * 0.04)
    const take = grossMonthly - tax
    // НПД — одна выплата в месяц.
    const advance = 0
    const salary = take

    ytdGross += grossMonthly
    ytdTax += tax
    cumulative += take
    monthly.push({ idx: i, advance, salary, tax, take, cumulative })
  }

  return finalise(monthly, ytdGross, ytdTax)
}

function calcUSN(input: CalcInput): CalcResult {
  const { grossMonthly, usnContributionsYear = 55_500 } = input
  // 6% от дохода минус фикс-взносы (пропорционально, 1/12 в месяц).
  const contribPerMonth = usnContributionsYear / 12
  const monthly: MonthRow[] = []
  let ytdGross = 0
  let ytdTax = 0
  let cumulative = 0

  for (let i = 0; i < 12; i++) {
    const taxBeforeContrib = grossMonthly * 0.06
    const tax = Math.max(0, Math.round(taxBeforeContrib - contribPerMonth))
    const take = grossMonthly - tax
    const advance = 0
    const salary = take

    ytdGross += grossMonthly
    ytdTax += tax
    cumulative += take
    monthly.push({ idx: i, advance, salary, tax, take, cumulative })
  }

  return finalise(monthly, ytdGross, ytdTax)
}

function calcCustom(input: CalcInput): CalcResult {
  const { grossMonthly, customRatePct = 13 } = input
  const rate = Math.max(0, Math.min(100, customRatePct)) / 100
  const monthly: MonthRow[] = []
  let ytdGross = 0
  let ytdTax = 0
  let cumulative = 0

  for (let i = 0; i < 12; i++) {
    const tax = Math.round(grossMonthly * rate)
    const take = grossMonthly - tax
    const advance = 0
    const salary = take

    ytdGross += grossMonthly
    ytdTax += tax
    cumulative += take
    monthly.push({ idx: i, advance, salary, tax, take, cumulative })
  }

  return finalise(monthly, ytdGross, ytdTax)
}

function finalise(
  monthly: MonthRow[],
  gross: number,
  tax: number,
): CalcResult {
  const take = gross - tax
  const effective = gross > 0 ? (tax / gross) * 100 : 0
  return {
    monthly,
    totals: {
      gross,
      tax,
      take,
      effectiveRatePct: Math.round(effective * 10) / 10,
    },
    avgMonthlyTake: Math.round(take / 12),
  }
}

export function calcSalary(input: CalcInput): CalcResult {
  switch (input.mode) {
    case 'tk':
      return calcTK(input)
    case 'npd':
      return calcNPD(input)
    case 'ip_usn':
      return calcUSN(input)
    case 'custom':
      return calcCustom(input)
  }
}

const RUB = new Intl.NumberFormat('ru-RU')

export function fmt(n: number): string {
  return RUB.format(Math.round(n))
}
