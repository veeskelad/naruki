import { Link } from 'wouter'
import { ArrowRight, Lock } from 'lucide-react'
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
    <section className="mx-auto max-w-7xl px-4 pt-14 pb-16 md:px-6 md:pt-20 md:pb-24">
      <div className="max-w-[720px]">
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[56px] md:text-[64px]">
          Планируйте отпуск и&nbsp;доход&nbsp;— без регистрации
        </h1>
        <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-muted-foreground md:text-lg">
          Календарь выходных и&nbsp;расчёт выплат. Всё считается в&nbsp;браузере.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Lock className="size-3.5" strokeWidth={1.8} />
          Ничего не&nbsp;уходит на&nbsp;сервер
        </div>
      </div>
    </section>
  )
}

/* ── TWO-UP PREVIEW (entry points) ──────────────────── */

function TwoUpPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20">
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <VacationPreviewCard />
        <SalaryPreviewCard />
      </div>
    </section>
  )
}

/* ── VACATION PREVIEW CARD ──────────────────────────── */

type StripCell = 'wknd' | 'holi' | 'vac'

// Мини-полоска из 9 квадратиков: [wknd wknd holi vac×5 wknd]
const VAC_STRIP: StripCell[] = [
  'wknd', 'wknd', 'holi',
  'vac', 'vac', 'vac', 'vac', 'vac',
  'wknd',
]

function VacationPreviewCard() {
  return (
    <Link
      href="/vacation"
      className="group relative flex h-full min-h-[240px] flex-col rounded-[24px] border border-border/60 bg-card p-6 transition hover:border-primary/40 md:min-h-[300px] md:p-7"
    >
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Отпуск 2026
      </div>
      <div className="mt-2 text-[22px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[24px]">
        5&nbsp;дней отпуска&nbsp;→&nbsp;9&nbsp;дней отдыха
      </div>

      {/* Mini-visual strip */}
      <div className="mt-5 flex gap-1 md:gap-[4px]">
        {VAC_STRIP.slice(0, 9).map((c, i) => (
          <StripSquare key={i} kind={c} className="hidden md:block" />
        ))}
        {/* Mobile: first 7 squares only */}
        {VAC_STRIP.slice(0, 7).map((c, i) => (
          <StripSquare key={`m${i}`} kind={c} className="md:hidden" />
        ))}
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">
        Подберём даты, где отпуск склеится с&nbsp;праздниками.
      </p>

      <div className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-medium text-primary">
        Открыть календарь
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function StripSquare({ kind, className }: { kind: StripCell; className?: string }) {
  return (
    <span
      className={cn(
        'block size-5 rounded-[5px]',
        kind === 'wknd' && 'bg-muted/60 ring-1 ring-border/60',
        kind === 'holi' && 'bg-rose-200',
        kind === 'vac' && 'bg-primary',
        className,
      )}
      aria-hidden
    />
  )
}

/* ── SALARY PREVIEW CARD ────────────────────────────── */

function SalaryPreviewCard() {
  // Полоска: primary 87% (на руки) + rose-300 13% (налоги) = 200 000 ₽ gross.
  const netPct = 87
  const taxPct = 100 - netPct

  return (
    <Link
      href="/salary"
      className="group relative flex h-full min-h-[240px] flex-col rounded-[24px] border border-border/60 bg-card p-6 transition hover:border-primary/40 md:min-h-[300px] md:p-7"
    >
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Зарплата 2026
      </div>
      <div className="mt-2 text-[22px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[24px]">
        174&nbsp;000&nbsp;₽ на&nbsp;руки
      </div>

      {/* Mini-visual bar */}
      <div className="mt-5 w-full max-w-[240px]">
        <div className="flex h-2 overflow-hidden rounded-full">
          <span
            className="block h-full bg-primary"
            style={{ width: `${netPct}%` }}
          />
          <span
            className="block h-full bg-rose-300"
            style={{ width: `${taxPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>0&nbsp;₽</span>
          <span>174&nbsp;000&nbsp;₽</span>
          <span>200&nbsp;000&nbsp;₽</span>
        </div>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">
        из&nbsp;200&nbsp;000&nbsp;₽ до&nbsp;налогов. Посчитаем для ТК, ИП и&nbsp;самозанятых.
      </p>

      <div className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-medium text-primary">
        Открыть калькулятор
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

/* ── HOW IT WORKS ───────────────────────────────────── */

function HowItWorks() {
  const steps = [
    'Вводите параметры — за 30 секунд',
    'Смотрите расчёт — сразу в браузере',
    'Скачиваете в Excel — чтобы сохранить',
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6 md:pb-32">
      <h2 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[28px]">
        Как это работает
      </h2>
      <ol className="mt-6 flex flex-col gap-3 md:mt-8 md:flex-row md:gap-8">
        {steps.map((s, i) => (
          <li
            key={i}
            className="flex items-baseline gap-3 text-[15px] leading-relaxed text-foreground md:flex-1"
          >
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {['①', '②', '③'][i]}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
