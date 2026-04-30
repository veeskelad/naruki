import type { ReactNode } from 'react'
import { Link } from 'wouter'
import {
  ArrowRight,
  CalendarClock,
  Lock,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HomePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-14 md:px-6 md:pt-20 md:pb-20">
        <div className="md:grid md:grid-cols-12 md:items-stretch md:gap-8 lg:gap-12">
          <div className="flex flex-col md:col-span-8">
            <Hero />
            <div className="mt-10 md:mt-14">
              <VacationPreviewCard />
            </div>
          </div>
          <div className="mt-10 md:col-span-4 md:mt-0 md:flex md:flex-col">
            <SalaryPreviewCard className="md:hidden" />
            <SalarySidePanel className="hidden md:flex md:h-full" />
          </div>
        </div>
      </section>
      <HowItWorks />
    </PageShell>
  )
}

function Hero() {
  return (
    <div className="max-w-[640px]">
      <h1
        className="reveal reveal--title font-display text-[34px] font-bold leading-[1.08] tracking-tight text-foreground sm:text-[44px] md:text-[56px] lg:text-[68px]"
        style={{ maxWidth: '14ch' }}
      >
        Планируйте отпуск и&nbsp;выплаты
      </h1>
      <p className="reveal reveal--lede mt-5 max-w-[420px] text-[15px] leading-relaxed text-muted-foreground sm:text-[16px] md:mt-6 md:max-w-[520px] md:text-[18px]">
        Производственный календарь и&nbsp;расчёт выплат&nbsp;— прямо в&nbsp;браузере.
      </p>
      <div className="reveal reveal--lede mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-[12px] text-muted-foreground md:text-[13px]">
        <Lock className="size-3.5" strokeWidth={2} />
        Без регистрации и&nbsp;без сохранения данных
      </div>
    </div>
  )
}

type StripCell = 'off' | 'vac'

const VAC_STRIP: StripCell[] = [
  'off', 'off',
  'vac', 'vac', 'vac', 'vac', 'vac',
  'off', 'off',
]

function VacationPreviewCard() {
  return (
    <article className="flex h-full min-h-[340px] flex-col rounded-[24px] border border-border/70 bg-card p-6 md:min-h-[420px] md:p-8">
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Когда брать отпуск
      </div>
      <div className="mt-3 font-display text-[24px] font-bold leading-[1.15] tracking-tight text-foreground md:text-[28px]">
        5&nbsp;дней отпуска
        <br />
        →&nbsp;9&nbsp;дней отдыха подряд
      </div>
      <div className="mt-2 text-[13px] text-muted-foreground md:text-[14px]">
        Выходные + отпуск + выходные
      </div>

      <div className="mt-7">
        <div className="grid grid-cols-9 gap-1 md:gap-1.5">
          {VAC_STRIP.map((c, i) => (
            <StripSquare key={i} kind={c} />
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-9 gap-1 text-center text-[10px] leading-tight text-muted-foreground md:gap-1.5 md:text-[11px]">
          <span className="col-span-2">Выходные<br />и&nbsp;праздники</span>
          <span className="col-span-5">5&nbsp;дней отпуска</span>
          <span className="col-span-2">Выходные<br />и&nbsp;праздники</span>
        </div>
      </div>

      <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
        Подберём даты, чтобы на&nbsp;те же дни отпуска получилось больше отдыха.
      </p>

      <div className="mt-auto pt-8">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/vacation">
            Подобрать даты
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function StripSquare({ kind }: { kind: StripCell }) {
  return (
    <span
      className={cn(
        'block aspect-square w-full rounded-[6px]',
        kind === 'off' && 'bg-primary/15',
        kind === 'vac' && 'bg-primary',
      )}
      aria-hidden
    />
  )
}

function SalaryPreviewCard({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        'flex h-full min-h-[340px] flex-col rounded-[24px] border border-border/70 bg-card p-6 md:min-h-[400px] md:p-8',
        className,
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Когда и&nbsp;сколько придёт
      </div>
      <div className="mt-3 font-display text-[24px] font-bold leading-[1.15] tracking-tight text-foreground md:text-[28px] tabular">
        100&nbsp;000&nbsp;₽ на&nbsp;руки
        <br />
        в&nbsp;месяц
      </div>

      <div className="mt-7 space-y-2">
        <PayoutRow label="Аванс" date="25 числа" amount="46 000 ₽" />
        <PayoutRow label="Зарплата" date="10 числа" amount="54 000 ₽" />
        <div className="flex items-baseline justify-between border-t border-border/70 pt-2.5">
          <span className="text-[12px] text-muted-foreground md:text-[13px]">
            Итого за&nbsp;месяц
          </span>
          <span className="font-display text-[16px] font-bold tabular text-foreground md:text-[17px]">
            100&nbsp;000&nbsp;₽
          </span>
        </div>
      </div>

      <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
        Покажем даты выплат и&nbsp;сумму на&nbsp;руки по&nbsp;месяцам.
      </p>

      <div className="mt-auto pt-8">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/salary">
            Посчитать выплаты
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function SalarySidePanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'flex-col rounded-[24px] border border-border/70 bg-card p-6 md:p-7',
        className,
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Зарплата
      </div>
      <div className="mt-3 font-display text-[22px] font-bold leading-[1.15] tracking-tight text-foreground lg:text-[24px]">
        Что покажет калькулятор
      </div>

      <ul className="mt-7 space-y-5">
        <Advantage
          icon={<Wallet className="size-4.5" strokeWidth={1.8} />}
          title="Сколько на руки"
          body="По ТК, НПД, ИП УСН и любой ставке."
        />
        <Advantage
          icon={<CalendarClock className="size-4.5" strokeWidth={1.8} />}
          title="Когда приходят выплаты"
          body="Даты аванса и зарплаты — по месяцам."
        />
        <Advantage
          icon={<TrendingUp className="size-4.5" strokeWidth={1.8} />}
          title="Помесячный и годовой обзор"
          body="Таблица и график выплат на весь год."
        />
      </ul>

      <div className="mt-auto pt-8">
        <Button asChild size="lg" className="w-full">
          <Link href="/salary">
            Посчитать выплаты
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </aside>
  )
}

function Advantage({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-foreground">
          {title}
        </div>
        <div className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground lg:text-[14px]">
          {body}
        </div>
      </div>
    </li>
  )
}

function PayoutRow({ label, date, amount }: { label: string; date: string; amount: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="text-[14px] font-medium text-foreground md:text-[15px]">
          {label}
        </span>
        <span className="text-[12px] text-muted-foreground md:text-[13px]">
          · {date}
        </span>
      </span>
      <span className="font-display text-[15px] font-bold tabular text-foreground md:text-[16px]">
        {amount}
      </span>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    'Вводите параметры',
    'Смотрите расчёт — сразу в браузере',
    'Сохраняете в Excel',
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6 md:pb-32">
      <h2 className="font-display text-[24px] font-bold tracking-tight text-foreground md:text-[32px]">
        Как это работает
      </h2>
      <ol className="mt-8 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-10">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col gap-4">
            <span
              className="font-display text-[64px] font-bold leading-none tracking-tight text-primary/25 md:text-[88px]"
              aria-hidden
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-[16px] leading-relaxed text-foreground md:text-[17px]">
              {s}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
