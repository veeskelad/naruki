import { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  HelpCircle,
  Minus,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// stub recommendations for preview
const RECOMMENDATIONS = [
  { id: 1, range: '4—8 мая', rest: 9, vacDays: 5, best: true },
  { id: 2, range: '9—11 июня', rest: 6, vacDays: 3, best: false },
  { id: 3, range: '2—6 ноября', rest: 8, vacDays: 5, best: false },
  { id: 4, range: '30 декабря — 8 января', rest: 12, vacDays: 5, best: false },
  { id: 5, range: '20—24 февраля', rest: 7, vacDays: 4, best: false },
]

export function VacationPage() {
  const [days, setDays] = useState(7)
  const [monthIndex, setMonthIndex] = useState(4) // Май
  const [activeRec, setActiveRec] = useState<number | null>(1)
  const [longRest, setLongRest] = useState(true)
  const [singleMonth, setSingleMonth] = useState(false)

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:pt-14 md:pb-28">
        <VacationHeader />
        <Toolbar
          days={days}
          onDaysChange={setDays}
          longRest={longRest}
          onLongRestChange={setLongRest}
          singleMonth={singleMonth}
          onSingleMonthChange={setSingleMonth}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <CalendarCard
            monthIndex={monthIndex}
            onPrev={() => setMonthIndex((m) => (m + 11) % 12)}
            onNext={() => setMonthIndex((m) => (m + 1) % 12)}
          />

          <RecommendationsCard
            days={days}
            active={activeRec}
            onSelect={setActiveRec}
          />
        </div>

        <div className="mt-6">
          <InsightsCard />
        </div>
      </div>
    </PageShell>
  )
}

function VacationHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight md:text-[40px]">
          Выгодный отпуск 2026
        </h1>
        <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-muted-foreground md:text-base">
          Берите меньше дней — отдыхайте дольше. Подберём даты, где отпуск склеится с&nbsp;выходными.
        </p>
      </div>
      <Button variant="outline" className="gap-2 rounded-xl">
        <Download className="size-4" />
        Экспорт в Excel
      </Button>
    </div>
  )
}

function Toolbar({
  days,
  onDaysChange,
  longRest,
  onLongRestChange,
  singleMonth,
  onSingleMonthChange,
}: {
  days: number
  onDaysChange: (n: number) => void
  longRest: boolean
  onLongRestChange: (v: boolean) => void
  singleMonth: boolean
  onSingleMonthChange: (v: boolean) => void
}) {
  const activeCount = [longRest, singleMonth].filter(Boolean).length
  return (
    <div className="mt-8 rounded-[20px] border border-border/60 bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Год</span>
          <Select defaultValue="2026">
            <SelectTrigger className="h-10 w-[120px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027" disabled>
                2027
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onDaysChange(Math.max(1, days - 1))}
            className="grid size-10 place-items-center rounded-xl border border-border/60 text-muted-foreground transition hover:text-foreground"
            aria-label="Убрать день"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-[120px] text-center text-sm font-medium">
            {days} {pluralDays(days)} отпуска
          </span>
          <button
            type="button"
            onClick={() => onDaysChange(Math.min(28, days + 1))}
            className="grid size-10 place-items-center rounded-xl border border-border/60 text-muted-foreground transition hover:text-foreground"
            aria-label="Добавить день"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="ml-auto flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <SlidersHorizontal className="size-4" />
                Настроить
                {activeCount > 0 && (
                  <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-[380px] sm:max-w-[420px]"
            >
              <SheetHeader>
                <SheetTitle className="text-[17px]">Параметры подбора</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-5 px-4 pb-6">
                <SettingCheckbox
                  id="long-rest"
                  label="Искать длинные периоды отдыха"
                  checked={longRest}
                  onCheckedChange={onLongRestChange}
                  tooltip="Ищем варианты, где отдых получится длиннее — за счёт склейки отпуска с праздниками и выходными. Короткие «компактные» варианты уходят ниже в списке."
                />
                <SettingCheckbox
                  id="single-month"
                  label="Показывать только даты внутри одного месяца"
                  checked={singleMonth}
                  onCheckedChange={onSingleMonthChange}
                  tooltip="Отсекаются варианты, которые переходят через границу месяца (например, «конец апреля — начало мая»). Остаются только периоды внутри одного календарного месяца."
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}

function SettingCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  tooltip,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  tooltip: string
}) {
  return (
    <div className="flex items-start gap-3 text-[14px]">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
      />
      <label
        htmlFor={id}
        className="flex select-none items-center gap-1.5 leading-snug text-foreground"
      >
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Подробнее"
              className="inline-flex text-muted-foreground transition hover:text-foreground"
            >
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px] text-[12px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </label>
    </div>
  )
}

function CalendarCard({
  monthIndex,
  onPrev,
  onNext,
}: {
  monthIndex: number
  onPrev: () => void
  onNext: () => void
}) {
  // Always render exactly 6 weeks (42 cells) so month height never changes
  const days = padTo42(buildMonthPreview(monthIndex))

  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2 text-[15px] font-medium">
          <CalendarIcon className="size-4 text-muted-foreground" />
          {MONTHS[monthIndex]} 2026
        </div>
        <button
          type="button"
          onClick={onNext}
          className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Следующий месяц"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <Legend className="mt-4" />

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <DayCell key={i} day={d} />
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Клик по дню — подробности. Зелёным подсвечен рекомендованный период.
      </p>
    </div>
  )
}

type DayState = {
  num: number | null
  kind: 'outside' | 'workday' | 'weekend' | 'holiday' | 'moved' | 'vacation' | 'top-vacation'
  label?: string
}

function DayCell({ day }: { day: DayState }) {
  if (day.kind === 'outside') {
    return <div aria-hidden className="aspect-square" />
  }
  const isVacation = day.kind === 'vacation' || day.kind === 'top-vacation'
  return (
    <div
      className={cn(
        'relative aspect-square rounded-xl border p-1.5 text-[13px] transition',
        'flex flex-col items-start',
        day.kind === 'workday' && 'border-transparent bg-white text-foreground',
        day.kind === 'weekend' && 'border-transparent bg-rose-50/40 text-rose-600/80',
        day.kind === 'holiday' && 'border-rose-100 bg-rose-50 text-rose-600',
        day.kind === 'moved' && 'border-transparent bg-sky-50/60 text-sky-700',
        day.kind === 'vacation' &&
          'border-emerald-100 bg-emerald-50 text-emerald-700',
        day.kind === 'top-vacation' &&
          'border-primary/50 bg-primary/15 text-emerald-800 ring-1 ring-primary/20',
      )}
    >
      <span className="font-medium">{day.num}</span>
      {day.label && (
        <span className="mt-auto text-[10px] leading-tight text-muted-foreground">
          {day.label}
        </span>
      )}
      {isVacation && (
        <span className="absolute right-1.5 top-1.5 text-[9px] font-medium uppercase tracking-wider text-primary">
          ОТП
        </span>
      )}
    </div>
  )
}

function buildMonthPreview(monthIndex: number): DayState[] {
  // Very simplified stub for May 2026 preview — good enough to review the design.
  // Replaced with real data in the next step.
  if (monthIndex === 4) {
    // Май 2026: 1 мая — пятница (праздник), 9 мая — суббота (праздник)
    return [
      ...pad(4),
      d(1, 'holiday', 'Праздник'),
      d(2, 'weekend'),
      d(3, 'weekend'),
      d(4, 'top-vacation'),
      d(5, 'top-vacation'),
      d(6, 'top-vacation'),
      d(7, 'top-vacation'),
      d(8, 'top-vacation'),
      d(9, 'holiday', 'Праздник'),
      d(10, 'weekend'),
      d(11, 'workday'),
      d(12, 'workday'),
      d(13, 'workday'),
      d(14, 'workday'),
      d(15, 'workday'),
      d(16, 'weekend'),
      d(17, 'weekend'),
      d(18, 'workday'),
      d(19, 'workday'),
      d(20, 'workday'),
      d(21, 'workday'),
      d(22, 'workday'),
      d(23, 'weekend'),
      d(24, 'weekend'),
      d(25, 'workday'),
      d(26, 'workday'),
      d(27, 'workday'),
      d(28, 'workday'),
      d(29, 'workday'),
      d(30, 'weekend'),
      d(31, 'weekend'),
    ]
  }
  // Дефолтная заглушка для других месяцев
  return [
    ...pad(2),
    ...Array.from({ length: 30 }).map((_, i) => {
      const dow = (i + 2) % 7
      const kind: DayState['kind'] = dow >= 5 ? 'weekend' : 'workday'
      return d(i + 1, kind)
    }),
  ]
}

function d(
  num: number,
  kind: DayState['kind'],
  label?: string,
): DayState {
  return { num, kind, label }
}
function pad(n: number): DayState[] {
  return Array.from({ length: n }).map(() => ({ num: null, kind: 'outside' }))
}

function padTo42(days: DayState[]): DayState[] {
  if (days.length >= 42) return days.slice(0, 42)
  return [...days, ...pad(42 - days.length)]
}

function pluralDays(n: number) {
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

function RecommendationsCard({
  days,
  active,
  onSelect,
}: {
  days: number
  active: number | null
  onSelect: (id: number | null) => void
}) {
  return (
    <div className="flex flex-col rounded-[24px] border border-border/60 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-[17px] font-semibold tracking-tight">
          Лучшие варианты для {days} {pluralDays(days)}
        </h2>
      </div>

      <ul className="mt-4 space-y-2">
        {RECOMMENDATIONS.map((rec) => {
          const isActive = rec.id === active
          return (
            <li key={rec.id}>
              <button
                type="button"
                onClick={() => onSelect(isActive ? null : rec.id)}
                className={cn(
                  'flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition',
                  isActive
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-border/60 bg-white hover:border-primary/30',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold tabular-nums',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {rec.id}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-medium text-foreground">
                      {rec.range}
                    </span>
                    {rec.best && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-[1px] text-[10px] font-medium uppercase tracking-wider text-primary">
                        <Sparkles className="size-2.5" />
                        Лучший
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground tabular-nums">
                    {rec.vacDays}&nbsp;дн. отпуска → {rec.rest}&nbsp;дн. отдыха
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Legend({ className }: { className?: string }) {
  const items = [
    { color: 'bg-white border', label: 'Рабочий' },
    { color: 'bg-rose-50/60', label: 'Выходной' },
    { color: 'bg-rose-50 border-rose-200', label: 'Праздник' },
    { color: 'bg-sky-50/70', label: 'Перенос' },
    { color: 'bg-emerald-50 border-emerald-200', label: 'Ваш отпуск' },
    { color: 'bg-primary/15 border-primary/40', label: 'Топ-вариант' },
  ]
  return (
    <div
      className={cn(
        'flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-muted-foreground',
        className,
      )}
    >
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className={cn('size-3 rounded', it.color)} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

const YEAR_INSIGHTS_2026 = [
  'Январь «съедает» отпуск: 8 праздничных дней уже дают длинные выходные, брать отпуск здесь невыгодно.',
  'Май даёт лучшие связки: 1 и 9 мая ложатся удачно — 5 дней отпуска превращаются в 9 дней подряд.',
  'В феврале мало рабочих дней — средний день отпуска «стоит» больше, чем в длинных месяцах.',
]

function InsightsCard() {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-5 md:p-6">
      <h3 className="text-[15px] font-semibold">На что обратить внимание</h3>
      <ul className="mt-3 flex flex-col gap-2.5 text-[14px] leading-relaxed text-foreground/85">
        {YEAR_INSIGHTS_2026.map((text, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
