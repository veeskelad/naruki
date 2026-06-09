import { addDays, isOffDay, isWorkDay, parseIso } from '@/lib/calendar'

export function restBreakdown(selectedDates: Set<string>): {
  vacation: number
  adjacentOff: number
  total: number
} {
  if (selectedDates.size === 0) {
    return { vacation: 0, adjacentOff: 0, total: 0 }
  }

  const sorted = [...selectedDates].sort()
  const segments: Array<{ start: string; end: string; vacation: number }> = []
  let current = {
    start: sorted[0],
    end: sorted[0],
    vacation: 1,
  }

  for (const date of sorted.slice(1)) {
    const cursor = addDays(current.end, 1)
    let connected = cursor
    while (connected < date && off(connected)) connected = addDays(connected, 1)
    if (connected === date) {
      current.end = date
      current.vacation++
    } else {
      segments.push(current)
      current = { start: date, end: date, vacation: 1 }
    }
  }
  segments.push(current)

  let vacation = 0
  let adjacentOff = 0
  for (const segment of segments) {
    let start = segment.start
    let end = segment.end
    while (off(addDays(start, -1))) start = addDays(start, -1)
    while (off(addDays(end, 1))) end = addDays(end, 1)

    let cursor = start
    while (cursor <= end) {
      if (!selectedDates.has(cursor)) adjacentOff++
      cursor = addDays(cursor, 1)
    }
    vacation += segment.vacation
  }
  return { vacation, adjacentOff, total: vacation + adjacentOff }
}

export function canSelectVacationDate(iso: string): boolean {
  const date = parseIso(iso)
  return isWorkDay(date.getFullYear(), date.getMonth(), date.getDate())
}

function off(iso: string): boolean {
  const date = parseIso(iso)
  return isOffDay(date.getFullYear(), date.getMonth(), date.getDate())
}

