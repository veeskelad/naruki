import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Info,
  Minus,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FaqSection } from '@/components/content/FaqSection'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  MONTH_NAMES_RU,
  WEEKDAY_NAMES_SHORT,
} from '@/lib/calendar/types'
import { iterMonth, parseIso } from '@/lib/calendar'
import {
  findBestVacations,
  restDaysLabel,
  vacationDaysLabel,
  type AnalysisMode,
  type VacationOption,
} from '@/lib/vacation/optimizer'
import { buildMonthRatings } from '@/lib/vacation/financial'
import {
  canSelectVacationDate,
  restBreakdown,
} from '@/lib/vacation/selection'
import {
  exportVacationCsv,
  exportVacationIcs,
} from '@/lib/export/vacation'
import { VACATION_FAQ } from '@/seo/content'
import { cn } from '@/lib/utils'

const YEAR = 2026

export function VacationPage() {
  const [days, setDays] = useState(7)
  const [mode, setMode] = useState<AnalysisMode>('max_rest')
  const [withinMonth, setWithinMonth] = useState(false)
  const [detailMonth, setDetailMonth] = useState<number | null>(null)
  const recommendations = useMemo(
    () =>
      findBestVacations(YEAR, days, {
        mode,
        withinMonth,
        topN: 5,
      }),
    [days, mode, withinMonth],
  )
  const [customSelection, setCustomSelection] = useState<Set<string> | null>(
    null,
  )
  const selectedDates = useMemo(
    () => customSelection ?? new Set<string>(),
    [customSelection],
  )
  const breakdown = useMemo(
    () => restBreakdown(selectedDates),
    [selectedDates],
  )
  const ratings = useMemo(() => buildMonthRatings(YEAR), [])

  const chooseRecommendation = (option: VacationOption) => {
    setCustomSelection(new Set(option.vacationDates))
    setDetailMonth(parseIso(option.startDate).getMonth())
  }

  const toggleDate = (iso: string) => {
    if (!canSelectVacationDate(iso)) return
    setCustomSelection((current) => {
      const next = new Set<string>(current ?? selectedDates)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
  }

  const copySelection = async () => {
    const dates = [...selectedDates].sort()
    const text = `Отпуск ${YEAR}: ${dates.join(', ')}. ${breakdown.vacation} дней отпуска → ${breakdown.total} дней отдыха.`
    await navigator.clipboard.writeText(text)
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 pt-9 pb-20 md:px-6 md:pt-14 md:pb-28">
        <header>
          <h1 className="font-display text-[36px] font-bold leading-tight tracking-tight md:text-[50px]">
            Выгодный отпуск 2026
          </h1>
          <p className="mt-4 max-w-[740px] text-[15px] leading-relaxed text-muted-foreground md:text-[18px]">
            Смотрите весь год сразу. Подберём рабочие дни, которые соединятся
            с выходными и праздниками в длинный непрерывный отдых.
          </p>
        </header>

        <VacationToolbar
          days={days}
          setDays={(value) => {
            setDays(value)
            setCustomSelection(null)
          }}
          mode={mode}
          setMode={(value) => {
            setMode(value)
            setCustomSelection(null)
          }}
          withinMonth={withinMonth}
          setWithinMonth={(value) => {
            setWithinMonth(value)
            setCustomSelection(null)
          }}
        />

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
          {detailMonth === null ? (
            <YearCalendar
              selectedDates={selectedDates}
              recommendations={recommendations}
              onOpenMonth={setDetailMonth}
            />
          ) : (
            <MonthDetail
              month={detailMonth}
              selectedDates={selectedDates}
              onToggleDate={toggleDate}
              onClose={() => setDetailMonth(null)}
              onMonthChange={setDetailMonth}
            />
          )}

          <aside className="flex flex-col gap-6">
            <SelectionCard
              selectedDates={selectedDates}
              breakdown={breakdown}
              budget={days}
              onClear={() => setCustomSelection(new Set())}
              onCopy={copySelection}
            />
            <Recommendations
              recommendations={recommendations}
              selectedDates={selectedDates}
              onSelect={chooseRecommendation}
            />
          </aside>
        </div>

        <MonthRatings ratings={ratings} />
      </div>

      <VacationArticle />
      <FaqSection items={VACATION_FAQ} />
    </PageShell>
  )
}

function VacationToolbar({
  days,
  setDays,
  mode,
  setMode,
  withinMonth,
  setWithinMonth,
}: {
  days: number
  setDays: (value: number) => void
  mode: AnalysisMode
  setMode: (value: AnalysisMode) => void
  withinMonth: boolean
  setWithinMonth: (value: boolean) => void
}) {
  return (
    <section
      aria-label="Параметры подбора"
      className="mt-8 rounded-[22px] border border-border bg-card p-4 md:p-5"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Год</span>
          <span className="flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium">
            2026
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDays(Math.max(1, days - 1))}
            disabled={days <= 1}
            aria-label="Уменьшить число дней"
            className="grid size-10 place-items-center rounded-xl border border-border disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <label className="flex h-10 items-center rounded-xl border border-border px-2">
            <input
              type="number"
              min={1}
              max={28}
              value={days}
              inputMode="numeric"
              onChange={(event) =>
                setDays(Math.min(28, Math.max(1, Number(event.target.value))))
              }
              className="w-10 bg-transparent text-center font-semibold outline-none"
              aria-label="Количество дней отпуска"
            />
            <span className="pr-2 text-sm text-muted-foreground">
              {vacationDaysLabel(days).replace(String(days), '').trim()} отпуска
            </span>
          </label>
          <button
            type="button"
            onClick={() => setDays(Math.min(28, days + 1))}
            disabled={days >= 28}
            aria-label="Увеличить число дней"
            className="grid size-10 place-items-center rounded-xl border border-border disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="grid w-full grid-cols-3 gap-1 rounded-xl bg-muted p-1 text-xs md:ml-auto md:w-auto">
          {[
            ['max_rest', 'Больше отдыха'],
            ['balanced', 'Баланс'],
            ['max_financial', 'Больше денег'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as AnalysisMode)}
              className={cn(
                'min-h-9 rounded-lg px-3 font-medium',
                mode === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm">
        <Checkbox
          checked={withinMonth}
          onCheckedChange={(value) => setWithinMonth(value === true)}
        />
        Показывать только варианты внутри одного месяца
      </label>
    </section>
  )
}

function YearCalendar({
  selectedDates,
  recommendations,
  onOpenMonth,
}: {
  selectedDates: Set<string>
  recommendations: VacationOption[]
  onOpenMonth: (month: number) => void
}) {
  const recommendationDates = useMemo(
    () => new Set(recommendations.flatMap((item) => item.vacationDates)),
    [recommendations],
  )

  return (
    <section className="rounded-[24px] border border-border bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">
            Производственный календарь 2026
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Откройте месяц, чтобы отметить рабочие дни вручную.
          </p>
        </div>
        <Legend />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MONTH_NAMES_RU.map((name, month) => (
          <MiniMonth
            key={name}
            month={month}
            selectedDates={selectedDates}
            recommendationDates={recommendationDates}
            onClick={() => onOpenMonth(month)}
          />
        ))}
      </div>
    </section>
  )
}

function MiniMonth({
  month,
  selectedDates,
  recommendationDates,
  onClick,
}: {
  month: number
  selectedDates: Set<string>
  recommendationDates: Set<string>
  onClick: () => void
}) {
  const days = iterMonth(YEAR, month)
  const cells = [
    ...Array.from({ length: days[0]?.dow ?? 0 }, () => null),
    ...days,
  ]
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border p-3 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="font-semibold">{MONTH_NAMES_RU[month]}</span>
      <span className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] text-muted-foreground">
        {WEEKDAY_NAMES_SHORT.map((weekday) => (
          <span key={weekday}>{weekday[0]}</span>
        ))}
      </span>
      <span className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) =>
          day ? (
            <DayDot
              key={day.date}
              day={day.day}
              kind={day.kind}
              selected={selectedDates.has(day.date)}
              recommended={recommendationDates.has(day.date)}
            />
          ) : (
            <span key={`empty-${index}`} />
          ),
        )}
      </span>
    </button>
  )
}

function DayDot({
  day,
  kind,
  selected,
  recommended,
}: {
  day: number
  kind: string
  selected: boolean
  recommended: boolean
}) {
  return (
    <span
      className={cn(
        'grid aspect-square place-items-center rounded text-[10px]',
        kind === 'weekend' && 'bg-rose-50 text-rose-700',
        (kind === 'holiday' || kind === 'transfer-off') &&
          'bg-rose-100 text-rose-700',
        kind === 'pre-holiday' && 'bg-sky-50 text-sky-700',
        recommended && 'bg-emerald-100 text-emerald-800',
        selected && 'bg-primary font-semibold text-primary-foreground',
      )}
    >
      {day}
    </span>
  )
}

function MonthDetail({
  month,
  selectedDates,
  onToggleDate,
  onClose,
  onMonthChange,
}: {
  month: number
  selectedDates: Set<string>
  onToggleDate: (iso: string) => void
  onClose: () => void
  onMonthChange: (month: number) => void
}) {
  const days = iterMonth(YEAR, month)
  const cells = [
    ...Array.from({ length: days[0]?.dow ?? 0 }, () => null),
    ...days,
  ]
  while (cells.length < 42) cells.push(null)
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null)
  const dragModeRef = useRef<'select' | 'deselect' | null>(null)

  useEffect(() => {
    dragModeRef.current = dragMode
  }, [dragMode])

  useEffect(() => {
    if (!dragMode) return
    const clearDrag = () => {
      dragModeRef.current = null
      setDragMode(null)
    }
    window.addEventListener('pointerup', clearDrag)
    window.addEventListener('pointercancel', clearDrag)
    return () => {
      window.removeEventListener('pointerup', clearDrag)
      window.removeEventListener('pointercancel', clearDrag)
    }
  }, [dragMode])

  const applyDrag = (iso: string) => {
    const mode = dragModeRef.current
    if (!mode) return
    const selected = selectedDates.has(iso)
    if ((mode === 'select' && !selected) || (mode === 'deselect' && selected)) {
      onToggleDate(iso)
    }
  }

  return (
    <section className="rounded-[24px] border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-10 items-center gap-1 rounded-xl px-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          К году
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange((month + 11) % 12)}
            aria-label="Предыдущий месяц"
            className="grid size-10 place-items-center rounded-xl hover:bg-muted"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="min-w-36 text-center font-semibold">
            {MONTH_NAMES_RU[month]} 2026
          </h2>
          <button
            type="button"
            onClick={() => onMonthChange((month + 1) % 12)}
            aria-label="Следующий месяц"
            className="grid size-10 place-items-center rounded-xl hover:bg-muted"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть месяц"
          className="grid size-10 place-items-center rounded-xl hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
      <Legend className="mt-4" />
      <div className="mt-5 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] uppercase text-muted-foreground">
          {WEEKDAY_NAMES_SHORT.map((weekday) => (
            <span key={weekday} className="py-2">
              {weekday}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, index) =>
            day ? (
              <button
                key={day.date}
                type="button"
                disabled={!canSelectVacationDate(day.date)}
                onPointerDown={(event) => {
                  if (event.button !== 0) return
                  event.preventDefault()
                  const shouldSelect = !selectedDates.has(day.date)
                  const nextMode = shouldSelect ? 'select' : 'deselect'
                  dragModeRef.current = nextMode
                  setDragMode(nextMode)
                  onToggleDate(day.date)
                }}
                onPointerEnter={() => applyDrag(day.date)}
                onPointerUp={() => {
                  dragModeRef.current = null
                  setDragMode(null)
                }}
                onPointerCancel={() => {
                  dragModeRef.current = null
                  setDragMode(null)
                }}
                onClick={(event) => {
                  if (event.detail !== 0) return
                  onToggleDate(day.date)
                }}
                aria-pressed={selectedDates.has(day.date)}
                aria-label={`${day.day} ${MONTH_NAMES_RU[month].toLowerCase()}: ${
                  day.name ?? kindLabel(day.kind)
                }`}
                className={cn(
                  'relative aspect-[5/4] border-b border-r border-border text-sm transition-all duration-200 ease-out focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 disabled:cursor-default',
                  day.kind === 'weekend' && 'bg-rose-50/60 text-rose-700',
                  day.kind === 'holiday' && 'bg-rose-100 text-rose-700',
                  day.kind === 'transfer-off' && 'bg-sky-50 text-sky-700',
                  day.kind === 'pre-holiday' && 'bg-sky-50/50',
                  selectedDates.has(day.date) &&
                    'bg-primary font-semibold text-primary-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] scale-[0.98]',
                )}
              >
                {day.day}
              </button>
            ) : (
              <span
                key={`empty-${index}`}
                className="aspect-[5/4] border-b border-r border-border bg-muted/20"
              />
            ),
          )}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Выбирать можно только рабочие дни. Выходные, праздники и переносы
        добавятся к непрерывному отдыху автоматически.
      </p>
    </section>
  )
}

function SelectionCard({
  selectedDates,
  breakdown,
  budget,
  onClear,
  onCopy,
}: {
  selectedDates: Set<string>
  breakdown: ReturnType<typeof restBreakdown>
  budget: number
  onClear: () => void
  onCopy: () => void
}) {
  const overBudget = breakdown.vacation > budget
  return (
    <section className="rounded-[24px] border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Ваш выбор</h2>
        {selectedDates.size > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Сбросить
          </button>
        )}
      </div>
      {selectedDates.size === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Выберите рекомендацию или откройте месяц и отметьте дни вручную.
        </p>
      ) : (
        <>
          <div className="mt-5 flex items-end gap-4">
            <Stat
              value={breakdown.vacation}
              label={`из ${budget} дней отпуска`}
              danger={overBudget}
            />
            <ChevronRight className="mb-3 size-5 text-muted-foreground" />
            <Stat
              value={breakdown.total}
              label="дней отдыха"
              accent
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {breakdown.vacation} дней отпуска + {breakdown.adjacentOff}{' '}
            праздников и выходных
          </p>
          {overBudget && (
            <div className="mt-3 flex gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
              <Info className="size-4 shrink-0" />
              Вы выбрали больше рабочих дней, чем указано в бюджете.
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onCopy}
              className="min-h-10 rounded-xl"
            >
              <Copy />
              Скопировать
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => exportVacationIcs(YEAR, selectedDates)}
              className="min-h-10 rounded-xl"
            >
              <CalendarDays />
              ICS
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => exportVacationCsv(YEAR, selectedDates)}
              className="min-h-10 rounded-xl"
            >
              <Download />
              CSV
            </Button>
          </div>
        </>
      )}
    </section>
  )
}

function Stat({
  value,
  label,
  accent,
  danger,
}: {
  value: number
  label: string
  accent?: boolean
  danger?: boolean
}) {
  return (
    <div>
      <div
        className={cn(
          'font-display text-4xl font-bold leading-none',
          accent && 'text-primary',
          danger && 'text-destructive',
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

function Recommendations({
  recommendations,
  selectedDates,
  onSelect,
}: {
  recommendations: VacationOption[]
  selectedDates: Set<string>
  onSelect: (option: VacationOption) => void
}) {
  return (
    <section className="rounded-[24px] border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="font-display text-lg font-bold">
          Лучшие варианты
        </h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Без пересекающихся периодов, отсортированы по выбранной цели.
      </p>
      <ol className="mt-4 space-y-2">
        {recommendations.map((option, index) => {
          const active =
            option.vacationDates.length === selectedDates.size &&
            option.vacationDates.every((date) => selectedDates.has(date))
          const topChoice = option.isTopChoice === true
          return (
            <li key={option.startDate}>
              <button
                type="button"
                onClick={() => onSelect(option)}
                className={cn(
                  'flex w-full gap-3 rounded-2xl border p-3 text-left transition',
                  active
                    ? 'border-primary/40 bg-primary/10'
                    : topChoice
                      ? 'border-emerald-200 bg-emerald-50/70'
                      : 'border-border hover:border-primary/30',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-all duration-200',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : topChoice
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {active ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm">
                    {formatRange(option.startDate, option.endDate)}
                  </strong>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {vacationDaysLabel(option.vacationDays)} →{' '}
                    {restDaysLabel(option.restDays)}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Эффективность {option.leverage.toFixed(2).replace('.', ',')}
                    {' · '}деньги {option.financialScore}/10
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function MonthRatings({
  ratings,
}: {
  ratings: ReturnType<typeof buildMonthRatings>
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        Финансовый рейтинг месяцев
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Чем больше рабочих дней в месяце, тем меньше один день отпуска обычно
        влияет на сумму зарплаты за этот месяц.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {ratings.map((rating) => (
          <article
            key={rating.month}
            className="rounded-[18px] border border-border bg-card p-4"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold">{MONTH_NAMES_RU[rating.month]}</h3>
              <span className="font-display text-xl font-bold text-primary">
                {rating.financialScore}/10
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {rating.workdays} рабочих дней
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {rating.comment}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Legend({ className }: { className?: string }) {
  const items = [
    ['bg-rose-50', 'Выходной'],
    ['bg-rose-100', 'Праздник'],
    ['bg-sky-50', 'Перенос'],
    ['bg-emerald-100', 'Вариант'],
    ['bg-primary', 'Ваш отпуск'],
  ]
  return (
    <div
      className={cn(
        'flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground',
        className,
      )}
    >
      {items.map(([color, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={cn('size-2.5 rounded', color)} />
          {label}
        </span>
      ))}
    </div>
  )
}

function VacationArticle() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 md:px-6 md:pb-28">
      <div className="rounded-[28px] border border-border bg-card p-6 md:p-10">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Как выбрать выгодный отпуск
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p>
            Для длинного отдыха сервис перебирает каждый рабочий день 2026
            года как возможное начало, набирает нужное число рабочих дней и
            расширяет период соседними выходными, праздниками и переносами.
          </p>
          <p>
            Режим «Больше денег» предпочитает месяцы с большим числом рабочих
            дней. Это упрощённая оценка влияния отпуска на зарплату, а не
            бухгалтерский расчёт отпускных по среднему заработку.
          </p>
          <a
            href="/salary"
            className="inline-flex items-center gap-2 font-medium text-primary"
          >
            Рассчитать выплаты на руки
            <ChevronRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

function formatRange(start: string, end: string): string {
  const date = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
  return `${date.format(parseIso(start))} — ${date.format(parseIso(end))}`
}

function kindLabel(kind: string): string {
  const labels: Record<string, string> = {
    workday: 'рабочий день',
    weekend: 'выходной',
    holiday: 'праздник',
    'transfer-off': 'перенесённый выходной',
    'pre-holiday': 'сокращённый день',
  }
  return labels[kind] ?? kind
}
