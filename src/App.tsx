import { Calendar, Wallet, Lock } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              ₽
            </span>
            На&nbsp;руки
          </a>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/vacation" className="hover:text-foreground">Отпуск</a>
            <a href="/salary" className="hover:text-foreground">Зарплата</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Планируйте отпуск и доход — без регистрации
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Производственный календарь РФ, расчёт выплат по ТК, ИП и НПД.
            Всё считается в браузере — мы ничего не сохраняем.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Ничего не уходит на сервер
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 grid gap-6 md:grid-cols-2">
          <a
            href="/vacation"
            className="group rounded-2xl border border-border/60 bg-card p-8 transition hover:border-primary/40 hover:shadow-lg"
          >
            <div className="grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="size-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Когда брать отпуск</h2>
            <p className="mt-2 text-muted-foreground">
              Подскажем, в какие даты 2026 года отпуск максимально склеится с праздниками
              и выходными.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Открыть →
            </span>
          </a>

          <a
            href="/salary"
            className="group rounded-2xl border border-border/60 bg-card p-8 transition hover:border-primary/40 hover:shadow-lg"
          >
            <div className="grid size-12 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <Wallet className="size-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Сколько придёт на руки</h2>
            <p className="mt-2 text-muted-foreground">
              Расчёт зарплаты по месяцам и за год для ТК РФ, ИП и самозанятых.
              Экспорт в Excel.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Открыть →
            </span>
          </a>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © 2026 На руки · MIT ·{' '}
        <a
          className="hover:text-foreground"
          href="https://github.com/veeskelad/naruki"
        >
          github.com/veeskelad/naruki
        </a>
      </footer>
    </div>
  )
}
