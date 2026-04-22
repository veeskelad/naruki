export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>© 2026 На&nbsp;руки</span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="hover:text-foreground" href="/about">
            О&nbsp;сервисе
          </a>
          <a className="hover:text-foreground" href="/privacy">
            Конфиденциальность
          </a>
          <a className="hover:text-foreground" href="mailto:hello@naruki.app">
            Обратная связь
          </a>
        </nav>
      </div>
    </footer>
  )
}
