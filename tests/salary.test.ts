import { describe, expect, it } from 'vitest'
import { calculateSalary, childDeduction, progressiveTax } from '@/lib/salary'

describe('salary rules for 2026', () => {
  it('applies every progressive NDFL band cumulatively', () => {
    expect(progressiveTax(2_400_000)).toBe(312_000)
    expect(progressiveTax(3_000_000)).toBe(402_000)
    expect(progressiveTax(6_000_000)).toBe(882_000)
  })

  it('uses increased child deductions', () => {
    expect(childDeduction(1)).toBe(1_400)
    expect(childDeduction(2)).toBe(4_200)
    expect(childDeduction(3)).toBe(10_200)
  })

  it('calculates a basic employment year', () => {
    const result = calculateSalary({
      year: 2026,
      mode: 'tk_rf',
      amount: 100_000,
      amountMode: 'gross',
      children: 0,
    })
    expect(result.totals.tax).toBe(156_000)
    expect(result.totals.net).toBe(1_044_000)
    expect(result.events).toHaveLength(24)
  })

  it('uses the NPD bonus until it is exhausted', () => {
    const result = calculateSalary({
      year: 2026,
      mode: 'npd',
      amount: 100_000,
      amountMode: 'gross',
      npdBusinessShare: 100,
      useNpdBonus: true,
    })
    expect(result.totals.tax).toBe(62_000)
    expect(result.totals.net).toBe(1_138_000)
  })

  it('combines USN tax and contributions without double counting', () => {
    const result = calculateSalary({
      year: 2026,
      mode: 'usn_6',
      amount: 100_000,
      amountMode: 'gross',
      usnFixedContributions: 57_390,
    })
    expect(result.totals.contributions).toBe(66_390)
    expect(result.totals.tax).toBe(5_610)
    expect(result.totals.net).toBe(1_128_000)
  })

  it('converts a requested net amount back to gross', () => {
    const result = calculateSalary({
      year: 2026,
      mode: 'custom',
      amount: 80_000,
      amountMode: 'net',
      customRate: 20,
    })
    expect(result.inputGrossMonthly).toBe(100_000)
    expect(result.averageMonthlyNet).toBe(80_000)
  })

  it('moves a weekend payment to the previous workday', () => {
    const result = calculateSalary({
      year: 2026,
      mode: 'tk_rf',
      amount: 100_000,
      amountMode: 'gross',
      paymentSchedule: {
        advanceDay: 25,
        salaryDay: 10,
        advanceShare: 0.4,
      },
    })
    const januaryAdvance = result.events.find(
      (event) => event.kind === 'advance' && event.forMonth === 0,
    )
    expect(januaryAdvance?.originalDate).toBe('2026-01-25')
    expect(januaryAdvance?.date).toBe('2026-01-23')
    expect(januaryAdvance?.shifted).toBe(true)
  })
})

