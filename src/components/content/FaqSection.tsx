import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface FaqItem {
  question: string
  answer: string
}

export function FaqSection({
  items,
  title = 'Часто спрашивают',
}: {
  items: readonly FaqItem[]
  title?: string
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-24 md:grid-cols-[260px_1fr] md:px-6 md:pb-32">
      <div>
        <h2 className="font-display text-[30px] font-bold leading-tight tracking-tight md:text-[40px]">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Расчёты справочные. Для нестандартной ситуации проверьте результат у
          бухгалтера или в официальном источнике.
        </p>
      </div>
      <Accordion
        type="single"
        collapsible
        className="overflow-hidden rounded-[24px] border border-border bg-card px-6"
      >
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger className="py-5 text-[15px] hover:no-underline md:text-[16px]">
              {item.question}
            </AccordionTrigger>
            <AccordionContent
              forceMount
              className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground data-[state=closed]:hidden md:text-[15px]"
            >
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
