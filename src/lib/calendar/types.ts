export type DayKind =
  | 'workday'
  | 'weekend'
  | 'holiday'
  | 'transfer-off'
  | 'pre-holiday'

export interface CalendarDay {
  date: string
  kind: DayKind
  name?: string
  note?: string
}

export interface YearCalendar {
  year: number
  days: Record<string, CalendarDay>
}

export const MONTH_NAMES_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const

export const MONTH_NAMES_RU_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const

export const WEEKDAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const
