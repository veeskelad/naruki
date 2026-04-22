import { PageShell } from '@/components/layout/PageShell'

type FontOption = {
  id: 'unbounded' | 'onest' | 'nunito'
  name: string
  stack: string
  weight: number
  description: string
  character: string
  tradeoff: string
}

const FONTS: FontOption[] = [
  {
    id: 'unbounded',
    name: 'Unbounded',
    stack: '"Unbounded", ui-sans-serif, system-ui, sans-serif',
    weight: 800,
    description:
      'Современный геометрический display-шрифт с расширенными формами. Сильный брендовый характер.',
    character: 'Геометрия · широкие буквы · продуктовый характер',
    tradeoff: 'Выразительно — но требует воздуха вокруг.',
  },
  {
    id: 'onest',
    name: 'Onest',
    stack: '"Onest", ui-sans-serif, system-ui, sans-serif',
    weight: 700,
    description:
      'Нейтральный гротеск со сдержанным характером. Близок к Inter, хорошо ложится рядом с body.',
    character: 'Чистый гротеск · сдержанный · fintech-ish',
    tradeoff: 'Безопасно, но менее запоминается.',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    stack: '"Nunito", ui-sans-serif, system-ui, sans-serif',
    weight: 800,
    description:
      'Дружелюбный округлый sans. Добавляет тепла, снижает «банковскую тяжесть».',
    character: 'Округлые формы · дружелюбный · тёплый',
    tradeoff: 'Мягко — но у бренда остаётся меньше «серьёзности».',
  },
]

export function FontsPreviewPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 pt-10 pb-24 md:pt-14">
        <h1 className="text-[32px] font-semibold tracking-tight md:text-[40px]">
          Шрифт для логотипа
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground md:text-base">
          Три варианта «На руки» — выбери один. Body-текст везде остаётся Inter.
        </p>

        <div className="mt-10 flex flex-col gap-6">
          {FONTS.map((font) => (
            <FontCard key={font.id} font={font} />
          ))}
        </div>

        <p className="mt-10 text-[13px] text-muted-foreground">
          Отпиши в чат, какой из трёх берём — заменю глобально.
        </p>
      </div>
    </PageShell>
  )
}

function FontCard({ font }: { font: FontOption }) {
  return (
    <section className="rounded-[24px] border border-border/60 bg-card p-6 md:p-8">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Вариант
        </span>
        <span className="text-[13px] font-medium text-foreground">
          {font.name} · {font.weight}
        </span>
      </div>

      {/* Логотип в размере хедера */}
      <div className="mt-6 flex items-center gap-3">
        <span
          className="grid size-9 place-items-center rounded-[10px] bg-primary text-primary-foreground text-[16px]"
          style={{ fontFamily: font.stack, fontWeight: font.weight }}
        >
          ₽
        </span>
        <span
          className="text-[17px] tracking-tight"
          style={{ fontFamily: font.stack, fontWeight: font.weight }}
        >
          На&nbsp;руки
        </span>
      </div>

      {/* Крупно для визуальной оценки */}
      <div className="mt-6 flex items-center gap-5">
        <span
          className="grid size-20 place-items-center rounded-2xl bg-primary text-primary-foreground text-[36px]"
          style={{ fontFamily: font.stack, fontWeight: font.weight }}
        >
          ₽
        </span>
        <span
          className="text-[48px] leading-[1] tracking-tight md:text-[64px]"
          style={{ fontFamily: font.stack, fontWeight: font.weight }}
        >
          На&nbsp;руки
        </span>
      </div>

      {/* H1 из реального сайта для сравнения */}
      <div className="mt-8 border-t border-border/60 pt-6">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          В H1
        </span>
        <p
          className="mt-2 text-[32px] leading-[1.1] tracking-tight md:text-[44px]"
          style={{ fontFamily: font.stack, fontWeight: font.weight }}
        >
          Выгодный отпуск 2026
        </p>
        <p
          className="mt-3 text-[18px] leading-relaxed text-muted-foreground"
          style={{ fontFamily: font.stack, fontWeight: 600 }}
        >
          Планируйте отпуск и&nbsp;доход
        </p>
      </div>

      {/* Характер + тред-офф */}
      <div className="mt-6 grid gap-3 rounded-2xl bg-muted/40 p-4 text-[13px] text-muted-foreground sm:grid-cols-2">
        <div>
          <span className="block font-medium text-foreground">Характер</span>
          {font.character}
        </div>
        <div>
          <span className="block font-medium text-foreground">Trade-off</span>
          {font.tradeoff}
        </div>
      </div>

      <p className="mt-4 text-[13px] text-muted-foreground">
        {font.description}
      </p>
    </section>
  )
}
