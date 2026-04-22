import { Link, Route, Switch } from 'wouter'
import { PageShell } from '@/components/layout/PageShell'
import { HomePage } from '@/pages/Home'
import { VacationPage } from '@/pages/Vacation'
import { SalaryPage } from '@/pages/Salary'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/vacation" component={VacationPage} />
      <Route path="/salary" component={SalaryPage} />
      <Route component={NotFound} />
    </Switch>
  )
}

function NotFound() {
  return (
    <PageShell>
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-[40px] font-semibold tracking-tight md:text-[56px]">
          404
        </h1>
        <p className="mt-4 text-[17px] text-muted-foreground">
          Страница не найдена. Возможно, мы ещё её не сделали.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          На главную →
        </Link>
      </section>
    </PageShell>
  )
}
