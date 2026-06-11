import { describe, expect, it } from 'vitest'
import { findBestVacations } from '@/lib/vacation/optimizer'
import { restBreakdown } from '@/lib/vacation/selection'
import { workdaysInYear } from '@/lib/calendar'

describe('vacation optimizer', () => {
  it('uses the registered 2026 production calendar', () => {
    expect(workdaysInYear(2026)).toBe(247)
  })

  it('returns short non-overlapping high-value periods', () => {
    const options = findBestVacations(2026, 7, {
      mode: 'max_rest',
      withinMonth: false,
      topN: 5,
    })
    expect(options).toHaveLength(5)
    expect(options[0]).toMatchObject({
      startDate: '2026-01-12',
      endDate: '2026-01-16',
      vacationDays: 5,
      restDays: 18,
    })
    expect(options.every((option) => option.vacationDays <= 7)).toBe(true)
  })

  it('does not use the whole annual budget for every recommendation', () => {
    const options = findBestVacations(2026, 18, {
      mode: 'max_rest',
      withinMonth: false,
      topN: 5,
    })
    expect(options.every((option) => option.vacationDays <= 14)).toBe(true)
    expect(options.some((option) => option.vacationDays < 18)).toBe(true)
    expect(options).toContainEqual(
      expect.objectContaining({
        startDate: '2026-05-04',
        endDate: '2026-05-08',
        vacationDays: 5,
        restDays: 11,
      }),
    )
  })

  it('calculates adjacent rest for the 4-8 May selection', () => {
    const selected = new Set([
      '2026-05-04',
      '2026-05-05',
      '2026-05-06',
      '2026-05-07',
      '2026-05-08',
    ])
    expect(restBreakdown(selected)).toEqual({
      vacation: 5,
      adjacentOff: 6,
      total: 11,
    })
  })

  it('prefers financially stronger months in money mode', () => {
    const options = findBestVacations(2026, 5, {
      mode: 'max_financial',
      withinMonth: true,
      topN: 5,
    })
    expect(options[0].financialScore).toBeGreaterThanOrEqual(9)
  })
})
