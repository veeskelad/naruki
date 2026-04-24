import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/vacation', label: 'Отпуск' },
  { href: '/salary', label: 'Зарплата' },
  { href: '/about', label: 'О сервисе' },
] as const

export function SiteHeader() {
  const [location, navigate] = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const go = (href: string) => {
    setMobileOpen(false)
    navigate(href)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:h-[80px] md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/naruki-logo.png"
            alt="На руки"
            className="size-9 rounded-[10px] object-contain"
            loading="eager"
            decoding="async"
          />
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

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Меню"
              className="grid size-10 place-items-center rounded-xl border border-border/60 text-muted-foreground transition hover:text-foreground md:hidden"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[84%] max-w-[320px] p-0">
            <SheetHeader className="border-b border-border/60 px-6 py-5">
              <SheetTitle className="flex items-center gap-3 text-left text-[17px]">
                <img
                  src="/naruki-logo.png"
                  alt="На руки"
                  className="size-9 rounded-[10px] object-contain"
                />
                На&nbsp;руки
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-3">
              {NAV.map((item) => {
                const active = location === item.href
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-left text-[16px] transition',
                      active
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted/60',
                    )}
                  >
                    {item.label}
                    <span aria-hidden className="text-muted-foreground">
                      →
                    </span>
                  </button>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
