import { Link } from 'wouter'
import { ArrowRight, Sparkles, SlidersHorizontal, BarChart3, Download } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { cn } from '@/lib/utils'

export function HomePage() {
  return (
    <PageShell>
      <Hero />
      <TwoUpPreview />
      <HowItWorks />
    </PageShell>
  )
}

/* ── HERO ───────────────────────────────────────────── */

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 pb-8 md:px-6 md:pt-20 md:pb-10">
      <div className="max-w-[760px]">
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[56px] md:text-[64px]">
          Планируйте отпуск и&nbsp;доход&nbsp;— без регистрации
        </h1>
        <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-muted-foreground md:text-lg">
          Производственный календарь&nbsp;РФ и&nbsp;расчёт выплат. Считаем в&nbsp;браузере,
          ничего не&nbsp;сохраняем.
        </p>
      </div>
    </section>
  )
}

/* ── TWO-UP PREVIEW (entry points) ──────────────────── */

function TwoUpPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-16">
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <VacationPreviewCard />
        <SalaryPreviewCard />
      </div>
    </section>
  )
}

/* ── VACATION PREVIEW CARD ──────────────────────────── */

type MonthCell =
  | { kind: 'outside' }
  | { kind: 'work' }
  | { kind: 'wknd' }
  | { kind: 'holi' }
  | { kind: 'vac' }

// May 2026: 1 мая — пт (праздник). Sat/Sun — выходные.
// Vacation: 4, 5, 6, 7, 8 мая (пн-пт после праздника+выходных).
// С учётом 9-10 мая (сб, вс) — 9 дней отдыха подряд с 2 по 10 мая.
function mayPreview(): MonthCell[] {
  // 1 мая 2026 — пятница → 1-я строка: 4 outside + пт-сб-вс
  // Заполним ровно 6 строк × 7 = 42 ячейки для консистентности.
  const cells: MonthCell[] = []
  // row 0: outside×4 + [1=holi, 2=wknd, 3=wknd]
  for (let i = 0; i < 4; i++) cells.push({ kind: 'outside' })
  cells.push({ kind: 'holi' }, { kind: 'wknd' }, { kind: 'wknd' })
  // row 1: 4-10 мая — [4 vac, 5 vac, 6 vac, 7 vac, 8 vac, 9 wknd(holi), 10 wknd]
  cells.push(
    { kind: 'vac' },
    { kind: 'vac' },
    { kind: 'vac' },
    { kind: 'vac' },
    { kind: 'vac' },
    { kind: 'holi' },
    { kind: 'wknd' },
  )
  // row 2: 11-17 — пн-пт work, сб-вс wknd
  const workWeek = (): MonthCell[] => [
    { kind: 'work' }, { kind: 'work' }, { kind: 'work' }, { kind: 'work' }, { kind: 'work' },
    { kind: 'wknd' }, { kind: 'wknd' },
  ]
  cells.push(...workWeek()) // 11-17
  cells.push(...workWeek()) // 18-24
  cells.push(...workWeek()) // 25-31
  // May 2026 has 31 days. By 31 мая = 7 строк (sun). But row 4 ends at 31.
  // Row 5 — полностью outside для визуальной балансировки
  for (let i = 0; i < 7; i++) cells.push({ kind: 'outside' })
  return cells
}

function VacationPreviewCard() {
  const cells = mayPreview()

  return (
    <article className="group relative flex h-full flex-col rounded-[24px] border border-border/60 bg-card p-6 transition hover:border-primary/40 md:p-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Когда брать отпуск
          </div>
          <div className="mt-1 text-[17px] font-semibold tracking-tight text-foreground">
            Май 2026
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="size-3" />
          Лучший вариант
        </span>
      </div>

      {/* Mini-month calendar — no numbers, only dot/pill colors */}
      <div className="mt-5 rounded-2xl bg-muted/30 p-4">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          {['п', 'в', 'с', 'ч', 'п', 'с', 'в'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {cells.map((c, i) => (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-md',
                c.kind === 'outside' && 'opacity-0',
                c.kind === 'work' && 'bg-white ring-1 ring-border/60',
                c.kind === 'wknd' && 'bg-rose-100/70',
                c.kind === 'holi' && 'bg-rose-200',
                c.kind === 'vac' && 'bg-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-muted/30',
              )}
            />
          ))}
        </div>
      </div>

      {/* Human-readable benefit */}
      <div className="mt-5 border-t border-border/60 pt-5">
        <div className="text-[13px] text-muted-foreground">
          Берёте 5&nbsp;дней отпуска
        </div>
        <div className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-foreground md:text-[24px]">
          отдыхаете 9&nbsp;дней подряд
        </div>
      </div>

      <Link
        href="/vacation"
        className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[15px] font-medium text-primary"
      >
        Открыть
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  )
}

/* ── SALARY PREVIEW CARD ────────────────────────────── */

type YearMonth = {
  m: string
  net: number
  anomaly?: 'low' | 'high'
}

const YEAR_MONTHS: YearMonth[] = [
  { m: 'Янв', net: 170_200, anomaly: 'low' },
  { m: 'Фев', net: 174_000 },
  { m: 'Мар', net: 174_000 },
  { m: 'Апр', net: 174_000 },
  { m: 'Май', net: 165_500, anomaly: 'low' },
  { m: 'Июн', net: 174_000 },
  { m: 'Июл', net: 174_000 },
  { m: 'Авг', net: 174_000 },
  { m: 'Сен', net: 174_000 },
  { m: 'Окт', net: 174_000 },
  { m: 'Ноя', net: 171_500, anomaly: 'low' },
  { m: 'Дек', net: 212_400, anomaly: 'high' },
]

function SalaryPreviewCard() {
  const max = Math.max(...YEAR_MONTHS.map((m) => m.net))
  const total = YEAR_MONTHS.reduce((acc, m) => acc + m.net, 0)
  const avg = Math.round(total / 12)
  const fmt = (n: number) => n.toLocaleString('ru-RU')

  return (
    <article className="group relative flex h-full flex-col rounded-[24px] border border-border/60 bg-card p-6 transition hover:border-primary/40 md:p-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Сколько на руки
          </div>
          <div className="mt-1 text-[17px] font-semibold tracking-tight text-foreground">
            2026 · 12 выплат
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
          <BarChart3 className="size-3" />
          Каждый месяц
        </span>
      </div>

      {/* Vertical bar chart of 12 months */}
      <ul className="mt-5 space-y-1.5">
        {YEAR_MONTHS.map((row) => {
          const width = (row.net / max) * 100
          return (
            <li
              key={row.m}
              className="grid grid-cols-[32px_1fr_auto] items-center gap-2.5"
            >
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                {row.m}
              </span>
              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full',
                    row.anomaly === 'low'
                      ? 'bg-rose-300'
                      : row.anomaly === 'high'
                      ? 'bg-primary'
                      : 'bg-primary/50',
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span
                className={cn(
                  'text-[12px] tabular-nums',
                  row.anomaly === 'high'
                    ? 'font-semibold text-primary'
                    : row.anomaly === 'low'
                    ? 'text-rose-600'
                    : 'text-muted-foreground',
                )}
              >
                {fmt(row.net)}&nbsp;₽
              </span>
            </li>
          )
        })}
      </ul>

      {/* Summary */}
      <div className="mt-5 border-t border-border/60 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[13px] text-muted-foreground">В среднем</div>
            <div className="mt-0.5 text-[17px] font-semibold tabular-nums text-foreground">
              {fmt(avg)}&nbsp;₽ / мес
            </div>
          </div>
          <div className="text-right">
            <div className="text-[13px] text-muted-foreground">За год</div>
            <div className="mt-0.5 text-[22px] font-semibold tabular-nums tracking-tight text-primary">
              {fmt(total)}&nbsp;₽
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/salary"
        className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[15px] font-medium text-primary"
      >
        Открыть
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  )
}

/* ── HOW IT WORKS ───────────────────────────────────── */

function HowItWorks() {
  const steps: Array<{ icon: React.ReactNode; title: string; text: string }> = [
    {
      icon: <SlidersHorizontal className="size-5" strokeWidth={1.6} />,
      title: 'Выберите параметры',
      text: 'Дни отпуска или сумму дохода и налоговый режим.',
    },
    {
      icon: <BarChart3 className="size-5" strokeWidth={1.6} />,
      title: 'Смотрите расчёт',
      text: 'Лучшие даты отпуска и распределение выплат по месяцам.',
    },
    {
      icon: <Download className="size-5" strokeWidth={1.6} />,
      title: 'Скачайте в Excel',
      text: 'Готовый файл — чтобы обсудить с HR или сохранить себе.',
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6 md:pb-32">
      <h2 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[28px]">
        Как это работает
      </h2>
      <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                {s.icon}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Шаг {i + 1}
              </span>
            </div>
            <div className="mt-4 text-[17px] font-semibold tracking-tight text-foreground">
              {s.title}
            </div>
            <div className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
              {s.text}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
