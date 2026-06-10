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
    <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6 md:pb-32">
      <div className="md:grid md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <h2 className="font-display text-[24px] font-bold leading-tight tracking-tight md:text-[32px]">
            {title}
          </h2>
          <p className="mt-3 max-w-[320px] text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
            Расчёты справочные. Для нестандартной ситуации проверьте результат
            у бухгалтера или в официальном источнике.
          </p>
        </div>
        <Accordion
          type="multiple"
          className="mt-8 rounded-[24px] border border-border bg-card px-5 md:col-span-8 md:mt-0 md:px-7"
        >
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="py-4 text-[15px] hover:no-underline md:py-5 md:text-[16px]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent
                forceMount
                className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground md:text-[15px]"
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
