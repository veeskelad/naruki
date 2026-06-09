import { TAX_RULES_2026 } from '@/data/tax-rates-2026'
import { buildPaymentEvents } from './schedule'
import {
  childDeduction,
  incrementalProgressiveTax,
  marginalRateForAnnualBase,
} from './tax'
import type {
  MonthSummary,
  SalaryInput,
  SalaryInsight,
  TaxMode,
  YearSalaryResult,
} from './types'

const RUB = new Intl.NumberFormat('ru-RU')

function money(value: number): string {
  return `${RUB.format(Math.round(value))} ₽`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function calculateTk(input: SalaryInput, grossMonthly: number): MonthSummary[] {
  const months: MonthSummary[] = []
  let cumulativeGross = 0
  let cumulativeTaxable = 0
  let cumulativeTax = 0

  for (let month = 0; month < 12; month++) {
    const nextCumulativeGross = cumulativeGross + grossMonthly
    const canUseDeduction =
      input.useChildDeduction !== false &&
      (input.children ?? 0) > 0 &&
      nextCumulativeGross <=
        TAX_RULES_2026.ndfl.childDeductionIncomeLimit
    const deduction = canUseDeduction
      ? childDeduction(input.children ?? 0)
      : 0
    const taxable = Math.max(0, grossMonthly - deduction)
    const tax =
      input.useProgressiveTax === false
        ? Math.round(taxable * 0.13)
        : incrementalProgressiveTax(cumulativeTaxable, taxable)
    const net = grossMonthly - tax

    cumulativeGross = nextCumulativeGross
    cumulativeTaxable += taxable
    cumulativeTax += tax
    months.push({
      month,
      gross: grossMonthly,
      tax,
      contributions: 0,
      net,
      cumulativeGross,
      cumulativeTax,
      marginalRate:
        input.useProgressiveTax === false
          ? 0.13
          : marginalRateForAnnualBase(cumulativeTaxable),
      events: [],
    })
  }
  return months
}

function calculateNpd(input: SalaryInput, grossMonthly: number): MonthSummary[] {
  const rules = TAX_RULES_2026.npd
  const businessShare = clamp(input.npdBusinessShare ?? 60, 0, 100) / 100
  let bonus = input.useNpdBonus === false ? 0 : rules.bonus
  let cumulativeGross = 0
  let cumulativeTax = 0

  return Array.from({ length: 12 }, (_, month) => {
    const businessIncome = grossMonthly * businessShare
    const individualIncome = grossMonthly - businessIncome
    const regularTax =
      businessIncome * rules.businessRate +
      individualIncome * rules.individualRate
    const availableReduction =
      businessIncome * rules.businessBonusRate +
      individualIncome * rules.individualBonusRate
    const reduction = Math.min(bonus, availableReduction)
    const tax = Math.round(regularTax - reduction)
    bonus -= reduction
    cumulativeGross += grossMonthly
    cumulativeTax += tax

    return {
      month,
      gross: grossMonthly,
      tax,
      contributions: 0,
      net: grossMonthly - tax,
      cumulativeGross,
      cumulativeTax,
      marginalRate:
        businessShare * rules.businessRate +
        (1 - businessShare) * rules.individualRate,
      events: [],
    }
  })
}

function calculateUsn(input: SalaryInput, grossMonthly: number): MonthSummary[] {
  const rules = TAX_RULES_2026.usn
  const annualGross = grossMonthly * 12
  const fixed = Math.max(
    0,
    input.usnFixedContributions ?? rules.fixedContributions,
  )
  const additional = Math.min(
    rules.additionalContributionLimit,
    Math.max(0, annualGross - rules.additionalThreshold) *
      rules.additionalRate,
  )
  const annualContributions = Math.round(fixed + additional)
  const annualTaxBeforeReduction = Math.round(annualGross * rules.incomeRate)
  const annualTax = Math.max(
    0,
    annualTaxBeforeReduction - annualContributions,
  )
  const monthlyTaxBase = Math.floor(annualTax / 12)
  const monthlyContributionBase = Math.floor(annualContributions / 12)
  let cumulativeGross = 0
  let cumulativeTax = 0

  return Array.from({ length: 12 }, (_, month) => {
    const tax =
      month === 11
        ? annualTax - monthlyTaxBase * 11
        : monthlyTaxBase
    const contributions =
      month === 11
        ? annualContributions - monthlyContributionBase * 11
        : monthlyContributionBase
    cumulativeGross += grossMonthly
    cumulativeTax += tax
    return {
      month,
      gross: grossMonthly,
      tax,
      contributions,
      net: grossMonthly - tax - contributions,
      cumulativeGross,
      cumulativeTax,
      marginalRate: rules.incomeRate,
      events: [],
    }
  })
}

function calculateCustom(
  input: SalaryInput,
  grossMonthly: number,
): MonthSummary[] {
  const rate = clamp(input.customRate ?? 13, 0, 100) / 100
  let cumulativeGross = 0
  let cumulativeTax = 0
  return Array.from({ length: 12 }, (_, month) => {
    const tax = Math.round(grossMonthly * rate)
    cumulativeGross += grossMonthly
    cumulativeTax += tax
    return {
      month,
      gross: grossMonthly,
      tax,
      contributions: 0,
      net: grossMonthly - tax,
      cumulativeGross,
      cumulativeTax,
      marginalRate: rate,
      events: [],
    }
  })
}

function calculateGrossMonths(
  input: SalaryInput,
  grossMonthly: number,
): MonthSummary[] {
  const calculators: Record<
    TaxMode,
    (value: SalaryInput, gross: number) => MonthSummary[]
  > = {
    tk_rf: calculateTk,
    npd: calculateNpd,
    usn_6: calculateUsn,
    custom: calculateCustom,
  }
  return calculators[input.mode](input, grossMonthly)
}

function netAverage(input: SalaryInput, grossMonthly: number): number {
  const months = calculateGrossMonths(
    { ...input, amountMode: 'gross' },
    grossMonthly,
  )
  return months.reduce((sum, month) => sum + month.net, 0) / 12
}

export function grossFromNet(input: SalaryInput, targetNet: number): number {
  if (targetNet <= 0) return 0
  let low = targetNet
  let high = Math.max(targetNet * 2, 1_000)

  while (netAverage(input, high) < targetNet && high < 1_000_000_000) {
    high *= 2
  }
  for (let index = 0; index < 80; index++) {
    const middle = (low + high) / 2
    const actual = netAverage(input, middle)
    if (Math.abs(actual - targetNet) <= 0.5) return Math.round(middle)
    if (actual < targetNet) low = middle
    else high = middle
  }
  return Math.round((low + high) / 2)
}

function buildInsights(
  input: SalaryInput,
  months: MonthSummary[],
  totals: YearSalaryResult['totals'],
): SalaryInsight[] {
  const insights: SalaryInsight[] = [
    {
      title: 'На руки за год',
      value: money(totals.net),
      body: `Средняя сумма после обязательных платежей — ${money(totals.net / 12)} в месяц.`,
    },
    {
      title: 'Обязательные платежи',
      value: money(totals.tax + totals.contributions),
      body: `Эффективная нагрузка — ${(totals.effectiveRate * 100).toFixed(1).replace('.', ',')}% от дохода.`,
    },
  ]

  if (input.mode === 'tk_rf') {
    const firstHigherRate = months.find((month) => month.marginalRate > 0.13)
    insights.push(
      firstHigherRate
        ? {
            title: 'Прогрессивный НДФЛ',
            value: `${Math.round(firstHigherRate.marginalRate * 100)}%`,
            body: `Повышенная ставка впервые затрагивает ${firstHigherRate.month + 1}-й месяц. Она применяется только к части дохода сверх порога.`,
          }
        : {
            title: 'Ставка НДФЛ',
            value: '13%',
            body: 'Годовой доход остаётся внутри первого порога прогрессивной шкалы.',
          },
    )
  }

  if (input.mode === 'usn_6') {
    insights.push({
      title: 'Страховые взносы',
      value: money(totals.contributions),
      body: 'Включены фиксированный платёж и 1% с дохода свыше 300 000 ₽.',
    })
  }
  return insights
}

export function calculateSalary(input: SalaryInput): YearSalaryResult {
  const normalizedAmount = Math.max(0, Math.round(input.amount))
  const grossMonthly =
    input.amountMode === 'net'
      ? grossFromNet(input, normalizedAmount)
      : normalizedAmount
  const months = calculateGrossMonths(input, grossMonthly)
  const events = buildPaymentEvents(
    input.year,
    input.mode,
    months,
    input.paymentSchedule,
  )

  for (const month of months) {
    month.events = events.filter((event) => event.forMonth === month.month)
  }

  const gross = months.reduce((sum, month) => sum + month.gross, 0)
  const tax = months.reduce((sum, month) => sum + month.tax, 0)
  const contributions = months.reduce(
    (sum, month) => sum + month.contributions,
    0,
  )
  const net = months.reduce((sum, month) => sum + month.net, 0)
  const totals = {
    gross,
    tax,
    contributions,
    net,
    effectiveRate: gross > 0 ? (tax + contributions) / gross : 0,
  }

  return {
    inputGrossMonthly: grossMonthly,
    months,
    events,
    totals,
    averageMonthlyNet: Math.round(net / 12),
    insights: buildInsights(input, months, totals),
  }
}

