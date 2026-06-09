import { ArrowLeft } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { PageShell } from '@/components/layout/PageShell'

export function Page() {
  const { is404 } = usePageContext()

  return (
    <PageShell>
      <section className="mx-auto grid min-h-[68vh] max-w-4xl place-items-center px-6 py-20 text-center">
        <div>
          <p className="mb-5 font-display text-sm uppercase tracking-[0.2em] text-primary">
            {is404 ? 'Ошибка 404' : 'Ошибка'}
          </p>
          <h1 className="text-balance font-display text-4xl leading-tight sm:text-6xl">
            {is404 ? 'Такой страницы нет' : 'Что-то пошло не так'}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
            {is404
              ? 'Проверьте адрес или вернитесь на главную страницу сервиса.'
              : 'Обновите страницу. Если ошибка повторится, попробуйте вернуться позже.'}
          </p>
          <a
            href="/"
            className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:brightness-95"
          >
            <ArrowLeft aria-hidden className="size-4" />
            На главную
          </a>
        </div>
      </section>
    </PageShell>
  )
}
