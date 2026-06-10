import { StructuredData } from '@/seo/StructuredData'
import { absoluteUrl, SITE_NAME } from '@/seo/site'
import { SALARY_FAQ } from '@/seo/content'

const title = 'Сколько и когда придёт — калькулятор зарплаты 2026'
const description =
  'Заполните три шага — получите сумму на руки, НДФЛ и даты выплат на 2026 год. Сохраните результат в Excel. Расчёт выполняется только в браузере.'

export function Head() {
  const canonical = absoluteUrl('/salary')
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="ru" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absoluteUrl('/og/salary.png')} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Калькулятор зарплаты на руки в 2026 году"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteUrl('/og/salary.png')} />
      <StructuredData
        value={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Калькулятор зарплаты и выплат',
            url: canonical,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            browserRequirements: 'JavaScript',
            inLanguage: 'ru-RU',
            isAccessibleForFree: true,
            description,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: SITE_NAME,
                item: absoluteUrl('/'),
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Калькулятор зарплаты',
                item: canonical,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: SALARY_FAQ.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
        ]}
      />
    </>
  )
}
