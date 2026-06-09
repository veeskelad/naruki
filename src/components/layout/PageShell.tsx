import type { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-[oklch(0.985_0_0)] text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-lg transition-transform focus:translate-y-0"
      >
        Перейти к содержанию
      </a>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 scroll-mt-24 outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
