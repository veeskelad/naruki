export interface ProgressiveTaxBand {
  upTo: number
  rate: number
}

export const TAX_RULES_2026 = {
  year: 2026,
  ndfl: {
    bands: [
      { upTo: 2_400_000, rate: 0.13 },
      { upTo: 5_000_000, rate: 0.15 },
      { upTo: 20_000_000, rate: 0.18 },
      { upTo: 50_000_000, rate: 0.2 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.22 },
    ] satisfies ProgressiveTaxBand[],
    childDeductionIncomeLimit: 450_000,
    childDeductions: [1_400, 2_800, 6_000],
  },
  npd: {
    individualRate: 0.04,
    businessRate: 0.06,
    bonus: 10_000,
    individualBonusRate: 0.01,
    businessBonusRate: 0.02,
  },
  usn: {
    incomeRate: 0.06,
    fixedContributions: 57_390,
    additionalThreshold: 300_000,
    additionalRate: 0.01,
    additionalContributionLimit: 321_818,
  },
} as const

