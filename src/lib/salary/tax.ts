import { TAX_RULES_2026 } from '@/data/tax-rates-2026'

export function progressiveTax(base: number): number {
  if (base <= 0) return 0

  let tax = 0
  let lower = 0
  for (const band of TAX_RULES_2026.ndfl.bands) {
    const taxableInBand = Math.max(0, Math.min(base, band.upTo) - lower)
    tax += taxableInBand * band.rate
    if (base <= band.upTo) break
    lower = band.upTo
  }
  return Math.round(tax)
}

export function incrementalProgressiveTax(
  previousBase: number,
  currentBase: number,
): number {
  return Math.max(
    0,
    progressiveTax(previousBase + currentBase) - progressiveTax(previousBase),
  )
}

export function marginalRateForAnnualBase(base: number): number {
  return (
    TAX_RULES_2026.ndfl.bands.find((band) => base <= band.upTo)?.rate ?? 0.22
  )
}

export function childDeduction(children: number): number {
  if (children <= 0) return 0
  let total = 0
  for (let index = 0; index < children; index++) {
    total +=
      TAX_RULES_2026.ndfl.childDeductions[
        Math.min(index, TAX_RULES_2026.ndfl.childDeductions.length - 1)
      ]
  }
  return total
}

