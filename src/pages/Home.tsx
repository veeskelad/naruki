import type { ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Lock,
  Wallet,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FaqSection } from '@/components/content/FaqSection'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HOME_FAQ } from '@/seo/content'

export function HomePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10 md:px-6 md:pt-20 md:pb-14">
        <div className="md:grid md:grid-cols-12 md:items-start md:gap-10 lg:gap-14">
          <div className="md:col-span-7">
            <Hero />
          </div>
          <div className="mt-10 md:col-span-5 md:mt-0">
            <SupportingBlock className="hidden md:block" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 md:pb-24">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <VacationPreviewCard />
          <SalaryPreviewCard />
        </div>
      </section>

      <HowItWorks />
      <Audience />
      <Privacy />
      <FaqSection items={HOME_FAQ} />
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

function SupportingBlock({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'rounded-[24px] border border-border/70 bg-card p-6 md:p-7',
        className,
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Что можно сделать
      </div>
      <ul className="mt-5 space-y-5">
        <Feature
          icon={<CalendarDays className="size-5" strokeWidth={1.8} />}
          title="Подобрать отпуск"
          body="Найти даты, где из нескольких дней отпуска получается длинный отдых подряд."
        />
        <Feature
          icon={<Wallet className="size-5" strokeWidth={1.8} />}
          title="Понять выплаты"
          body="Увидеть, когда приходят аванс и зарплата по&nbsp;месяцам."
        />
        <Feature
          icon={<BarChart3 className="size-5" strokeWidth={1.8} />}
          title="Сравнить год"
          body="Посмотреть таблицу и&nbsp;график выплат за&nbsp;весь год."
        />
      </ul>
    </aside>
  )
}

function Feature({
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
        <div className="text-[15px] font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
          {body}
        </div>
      </div>
    </li>
  )
}

type StripCell = 'off' | 'vac'

const VAC_STRIP: StripCell[] = [
  'off', 'off', 'off',
  'vac', 'vac', 'vac', 'vac', 'vac',
  'off', 'off', 'off',
]

function VacationPreviewCard() {
  return (
    <article className="flex h-full min-h-[340px] flex-col rounded-[24px] border border-border/70 bg-card p-6 md:min-h-[400px] md:p-8">
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Когда брать отпуск
      </div>
      <div className="mt-3 font-display text-[24px] font-bold leading-[1.15] tracking-tight text-foreground md:text-[28px]">
        Берёшь 5&nbsp;дней
        <br />
        →&nbsp;отдыхаешь 11&nbsp;дней подряд
      </div>
      <div className="mt-2 text-[13px] text-muted-foreground md:text-[14px]">
        Например, если взять отпуск с&nbsp;4 по&nbsp;8&nbsp;мая, получится отдых с&nbsp;1 по&nbsp;11&nbsp;мая.
      </div>

      <div className="mt-7">
        <div className="grid grid-cols-11 gap-1 md:gap-1.5">
          {VAC_STRIP.map((c, i) => (
            <StripSquare key={i} kind={c} />
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-11 gap-1 text-center text-[10px] leading-tight text-muted-foreground md:gap-1.5 md:text-[11px]">
          <span className="col-span-3">Выходные<br />и&nbsp;праздники</span>
          <span className="col-span-5">5&nbsp;дней отпуска</span>
          <span className="col-span-3">Выходные<br />и&nbsp;праздники</span>
        </div>
      </div>

      <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
        Подберём даты, чтобы на&nbsp;те же дни отпуска получилось больше отдыха.
      </p>

      <div className="mt-auto pt-8">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href="/vacation">
            Подобрать даты
            <ArrowRight />
          </a>
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

function SalaryPreviewCard() {
  return (
    <article className="flex h-full min-h-[340px] flex-col rounded-[24px] border border-border/70 bg-card p-6 md:min-h-[400px] md:p-8">
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
          <a href="/salary">
            Посчитать выплаты
            <ArrowRight />
          </a>
        </Button>
      </div>
    </article>
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
      <ol className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12 md:gap-x-8 md:gap-y-10">
        {steps.map((s, i) => (
          <li
            key={i}
            className={cn(
              'flex flex-col gap-4',
              i === 0 && 'md:col-span-3 md:col-start-1',
              i === 1 && 'md:col-span-4 md:col-start-5',
              i === 2 && 'md:col-span-3 md:col-start-10',
            )}
          >
            <span
              className="font-display text-[64px] font-bold leading-none tracking-tight text-primary/75 md:text-[96px]"
              aria-hidden
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="max-w-[18ch] text-[16px] leading-relaxed text-foreground md:text-[17px]">
              {s}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Audience() {
  const items = [
    ['Работникам по ТК РФ', 'Рассчитать НДФЛ, вычеты, аванс и зарплату по датам.'],
    ['Самозанятым', 'Сравнить доход от физлиц и организаций с учётом бонуса НПД.'],
    ['ИП на УСН', 'Учесть налог, фиксированные взносы и дополнительный 1%.'],
  ]
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 pb-24 md:px-6 md:pb-32"
    >
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            О сервисе
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Понятные расчёты для работы и отдыха
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-muted-foreground">
            «На руки» объясняет результат обычным языком и показывает не только
            итоговую цифру, но и даты, налоги и причины рекомендации.
          </p>
        </div>
        <div className="grid gap-3">
          {items.map(([title, body]) => (
            <article
              key={title}
              className="rounded-[20px] border border-border bg-card p-5"
            >
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Privacy() {
  return (
    <section
      id="privacy"
      className="mx-auto max-w-6xl px-4 pb-24 md:px-6 md:pb-32"
    >
      <div className="rounded-[28px] bg-foreground p-7 text-background md:p-12">
        <Lock className="size-6 text-primary" />
        <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-4xl">
          Ваши суммы и даты не покидают устройство
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-background/70">
          У сервиса нет аккаунтов и базы пользовательских расчётов. Формулы
          выполняются локально, а файлы Excel, CSV и ICS создаются прямо в
          браузере.
        </p>
      </div>
    </section>
  )
}
