const MONEY = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

const SHORT_DATE = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Europe/Moscow',
})

export function formatMoney(value: number): string {
  return MONEY.format(Math.round(value))
}

export function formatRubles(value: number): string {
  return `${formatMoney(value)} ₽`
}

export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return SHORT_DATE.format(new Date(Date.UTC(year, month - 1, day)))
}

export function parseMoney(value: string): number {
  const normalized = value.replace(/[^\d]/g, '')
  return normalized ? Number.parseInt(normalized, 10) : 0
}

export function formatMoneyInput(value: string): string {
  return formatMoney(parseMoney(value))
}

