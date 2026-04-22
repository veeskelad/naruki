import { Link } from 'wouter'
import { Calendar, Wallet } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { PrivacyPill } from '@/components/layout/PrivacyPill'

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
          <div className="mt-8">
            <PrivacyPill />
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  )
}

function HeroIllustration() {
  return (
    <div className="relative hidden h-full min-h-[260px] md:block">
      <svg
        viewBox="0 0 400 320"
        className="mx-auto h-full w-full max-w-md"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect
          x="40"
          y="40"
          width="280"
          height="220"
          rx="24"
          className="fill-white"
          stroke="none"
        />
        <rect
          x="40"
          y="40"
          width="280"
          height="220"
          rx="24"
          className="stroke-border"
        />

        <line x1="40" y1="84" x2="320" y2="84" className="stroke-border" />
        <line x1="88" y1="40" x2="88" y2="84" className="stroke-border" />
        <line x1="112" y1="40" x2="112" y2="84" className="stroke-border" />

        <g className="stroke-muted-foreground/50">
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 7 }).map((_, col) => {
              const cx = 64 + col * 36
              const cy = 108 + row * 28
              return <circle key={`${row}-${col}`} cx={cx} cy={cy} r="3" />
            }),
          )}
        </g>

        <g className="fill-primary stroke-primary">
          {[2, 3, 4, 5, 6].map((col) => (
            <circle key={`hl-${col}`} cx={64 + col * 36} cy={164} r="5" />
          ))}
        </g>

        <circle cx="320" cy="230" r="46" className="fill-white stroke-border" />
        <circle cx="320" cy="230" r="36" className="stroke-primary/60" />
        <text
          x="320"
          y="240"
          textAnchor="middle"
          className="fill-primary"
          stroke="none"
          fontSize="28"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="600"
        >
          ₽
        </text>

        <g className="stroke-primary/70">
          <circle cx="90" cy="250" r="14" />
          <path d="M90 230 L90 220" />
          <path d="M76 250 L66 250" />
          <path d="M104 250 L114 250" />
          <path d="M80 240 L72 232" />
          <path d="M100 240 L108 232" />
        </g>
      </svg>
    </div>
  )
}

function FeatureCards() {
  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-20 md:grid-cols-2 md:gap-6 md:pb-28">
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
