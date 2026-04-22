import { Link, useLocation } from 'wouter'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/vacation', label: 'Отпуск' },
  { href: '/salary', label: 'Зарплата' },
  { href: '/about', label: 'О сервисе' },
] as const

export function SiteHeader() {
  const [location] = useLocation()

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 md:h-[80px]">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-[10px] bg-primary text-primary-foreground font-semibold">
            ₽
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            На&nbsp;руки
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] md:flex">
          {NAV.map((item) => {
            const active = location === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-[26px] left-0 right-0 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          aria-label="Меню"
          className="grid size-10 place-items-center rounded-xl border border-border/60 text-muted-foreground transition hover:text-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </div>
    </header>
  )
}
