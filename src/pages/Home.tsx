import { Link } from 'wouter'
import { Calendar, Wallet, Sparkles } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { cn } from '@/lib/utils'

export function HomePage() {
  return (
    <PageShell>
      <Hero />
      <FeatureCards />
    </PageShell>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-14 pb-10 md:pt-24 md:pb-16">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[52px] md:text-[56px]">
            Планируйте отпуск и&nbsp;доход&nbsp;—
            <br className="hidden sm:block" /> без регистрации
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground md:text-lg">
            Производственный календарь&nbsp;РФ, расчёт выплат по&nbsp;ТК, ИП и&nbsp;НПД.
            Всё считается в&nbsp;браузере — мы&nbsp;ничего не&nbsp;сохраняем.
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}

function HeroPreview() {
  return (
    <div className="relative hidden md:block">
      <div className="relative">
        <VacationPreviewCard />
        <SalaryPreviewCard />
      </div>
    </div>
  )
}

function VacationPreviewCard() {
  // Мини-календарь недели: Пн–Вс, пятница-праздник, 4–5 отпуск, сб-вс выходные
  const days: Array<{ d: number; kind: 'work' | 'vac' | 'holi' | 'wknd' }> = [
    { d: 4, kind: 'vac' },
    { d: 5, kind: 'vac' },
    { d: 6, kind: 'vac' },
    { d: 7, kind: 'vac' },
    { d: 8, kind: 'vac' },
    { d: 9, kind: 'holi' },
    { d: 10, kind: 'wknd' },
  ]
  return (
    <div className="rounded-[22px] border border-border/60 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Май 2026
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="size-3" />
          Лучший вариант
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div
            key={day.d}
            className={cn(
              'grid aspect-square place-items-center rounded-lg text-[13px] font-medium',
              day.kind === 'work' && 'bg-white text-foreground border border-border/60',
              day.kind === 'vac' && 'bg-primary/15 text-emerald-800 ring-1 ring-primary/30',
              day.kind === 'holi' && 'bg-rose-50 text-rose-600 border border-rose-100',
              day.kind === 'wknd' && 'bg-rose-50/50 text-rose-500',
            )}
          >
            {day.d}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2.5">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            5 дней отпуска
          </div>
          <div className="mt-0.5 text-[18px] font-semibold text-foreground">
            9 дней отдыха
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Выгода
          </div>
          <div className="mt-0.5 text-[18px] font-semibold text-primary">
            ×1.80
          </div>
        </div>
      </div>
    </div>
  )
}

function SalaryPreviewCard() {
  return (
    <div className="absolute -bottom-12 -left-8 w-[72%] rounded-[20px] border border-border/60 bg-card p-4 shadow-[0_10px_25px_-15px_rgba(15,23,42,0.15)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          ТК РФ · декабрь
        </span>
        <span className="text-[11px] text-muted-foreground">13%</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] text-muted-foreground">До налогов</div>
          <div className="mt-1 text-[17px] font-semibold text-foreground line-through decoration-muted-foreground/50">
            200 000 ₽
          </div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">На руки</div>
          <div className="mt-1 text-[17px] font-semibold text-primary">
            174 000 ₽
          </div>
        </div>
      </div>
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: '87%' }} />
        <div className="h-full bg-rose-300" style={{ width: '13%' }} />
      </div>
    </div>
  )
}

function FeatureCards() {
  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-20 md:grid-cols-2 md:gap-6 md:pb-28 md:pt-20">
      <FeatureCard
        href="/vacation"
        icon={<Calendar className="size-7" strokeWidth={1.6} />}
        title="Когда брать отпуск"
      >
        Подскажем, в&nbsp;какие даты 2026&nbsp;года отпуск максимально склеится
        с&nbsp;праздниками и&nbsp;выходными.
      </FeatureCard>
      <FeatureCard
        href="/salary"
        icon={<Wallet className="size-7" strokeWidth={1.6} />}
        title="Сколько денег на руки"
      >
        Покажем, сколько вы&nbsp;получаете в&nbsp;месяц и&nbsp;за&nbsp;год
        с&nbsp;учётом налогов и&nbsp;режима работы.
      </FeatureCard>
    </section>
  )
}

function FeatureCard({
  href,
  icon,
  title,
  children,
}: {
  href: string
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-[24px] border border-border/60 bg-card p-6 transition duration-200 hover:border-primary/40 md:p-8"
    >
      <div className="grid size-14 place-items-center rounded-[16px] bg-primary/10 text-primary md:size-16">
        {icon}
      </div>
      <h2 className="mt-7 text-[22px] font-semibold tracking-tight text-foreground md:text-2xl">
        {title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground md:text-base">
        {children}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Открыть
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  )
}
