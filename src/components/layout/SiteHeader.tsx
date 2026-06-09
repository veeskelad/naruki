import { useState } from 'react'
import { Menu } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const DESKTOP_NAV = [
  { href: '/vacation', label: 'Отпуск' },
  { href: '/salary', label: 'Зарплата' },
  { href: '/#about', label: 'О сервисе' },
] as const

const MOBILE_NAV = [
  { href: '/vacation', label: 'Отпуск' },
  { href: '/salary', label: 'Зарплата' },
  { href: '/#about', label: 'О сервисе' },
] as const

export function SiteHeader() {
  const { urlPathname } = usePageContext()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:h-[88px] md:px-6">
        <a
          href="/"
          className="flex min-w-0 shrink items-center gap-3"
        >
          <img
            src="/naruki-logo.webp"
            alt=""
            width="256"
            height="256"
            className="h-14 w-auto shrink-0 md:h-[60px]"
            loading="eager"
            decoding="async"
          />
          <span className="font-display text-[19px] font-normal leading-none tracking-[-0.01em] md:text-[22px]">
            На&nbsp;руки
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex">
          {DESKTOP_NAV.map((item) => {
            const active = urlPathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'relative transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-foreground/85 hover:text-foreground',
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-[30px] left-0 right-0 h-[2px] rounded-full bg-primary" />
                )}
              </a>
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
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <ul className="flex flex-col gap-1">
              {MOBILE_NAV.map((item) => {
                const active = urlPathname === item.href
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
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
                    </a>
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
