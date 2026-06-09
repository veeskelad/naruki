import { describe, expect, it } from 'vitest'
import { findBestVacations } from '@/lib/vacation/optimizer'
import { restBreakdown } from '@/lib/vacation/selection'

describe('vacation optimizer', () => {
  it('returns non-overlapping high-leverage options', () => {
    const options = findBestVacations(2026, 7, {
      mode: 'max_rest',
      withinMonth: false,
      topN: 5,
    })
    expect(options).toHaveLength(5)
    expect(options[0].restDays).toBeGreaterThanOrEqual(13)
    expect(options[0].leverage).toBeGreaterThan(1.8)
  })

  it('finds a May bridge around public holidays', () => {
    const options = findBestVacations(2026, 5, {
      mode: 'max_rest',
      withinMonth: false,
      topN: 12,
    })
    const may = options.find((option) => option.startDate.startsWith('2026-05'))
    expect(may?.restDays).toBeGreaterThanOrEqual(9)
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

