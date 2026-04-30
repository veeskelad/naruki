import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const DESKTOP_NAV = [
  { href: '/vacation', label: 'Отпуск' },
  { href: '/salary', label: 'Зарплата' },
  { href: '/about', label: 'О сервисе' },
] as const

const MOBILE_NAV = [
  { href: '/vacation', label: 'Отпуск' },
  { href: '/salary', label: 'Зарплата' },
] as const

export function SiteHeader() {
  const [location, navigate] = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const goMobile = (href: string) => {
    setMobileOpen(false)
    navigate(href)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:h-[88px] md:px-6">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2.5 md:gap-3"
        >
          <img
            src="/naruki-logo.png"
            alt="На руки"
            className="h-14 w-auto shrink-0 md:h-[60px]"
            loading="eager"
            decoding="async"
          />
          <span className="relative top-px font-display text-[19px] font-medium leading-none tracking-[-0.01em] md:text-[22px]">
            На&nbsp;руки
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex">
          {DESKTOP_NAV.map((item) => {
            const active = location === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-foreground/75 hover:text-foreground',
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-[30px] left-0 right-0 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        <Popover open={mobileOpen} onOpenChange={setMobileOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Меню"
              aria-expanded={mobileOpen}
              className="grid size-10 place-items-center rounded-xl border border-border/60 text-foreground/75 transition hover:text-foreground md:hidden"
            >
              <Menu className="size-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={10}
            className="w-[200px] p-2 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {MOBILE_NAV.map((item) => {
                const active = location === item.href
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => goMobile(item.href)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-[15px] font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted/60',
                      )}
                    >
                      {item.label}
                      <span aria-hidden className="text-muted-foreground">
                        →
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
