export type TaxMode = 'tk_rf' | 'npd' | 'usn_6' | 'custom'
export type AmountMode = 'gross' | 'net'

export interface PaymentSchedule {
  advanceDay: number
  salaryDay: number
  advanceShare: number
}

export interface SalaryInput {
  year: number
  mode: TaxMode
  amount: number
  amountMode: AmountMode
  children?: number
  useChildDeduction?: boolean
  useProgressiveTax?: boolean
  npdBusinessShare?: number
  useNpdBonus?: boolean
  customRate?: number
  usnFixedContributions?: number
  paymentSchedule?: PaymentSchedule
}

export interface PaymentEvent {
  date: string
  originalDate: string
  shifted: boolean
  kind: 'advance' | 'salary' | 'income' | 'tax' | 'contribution'
  forMonth: number
  gross: number
  tax: number
  net: number
  note?: string
}

export interface MonthSummary {
  month: number
  gross: number
  tax: number
  contributions: number
  net: number
  cumulativeGross: number
  cumulativeTax: number
  marginalRate: number
  events: PaymentEvent[]
}

export interface MoneyTotals {
  gross: number
  tax: number
  contributions: number
  net: number
  effectiveRate: number
}

export interface SalaryInsight {
  title: string
  value: string
  body: string
}

export interface YearSalaryResult {
  inputGrossMonthly: number
  months: MonthSummary[]
  events: PaymentEvent[]
  totals: MoneyTotals
  averageMonthlyNet: number
  insights: SalaryInsight[]
}

