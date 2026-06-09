import { StructuredData } from '@/seo/StructuredData'
import { absoluteUrl, SITE_NAME } from '@/seo/site'
import { VACATION_FAQ } from '@/seo/content'

const title = 'Когда брать отпуск в 2026 году выгоднее всего | На руки'
const description =
  'Подберите выгодные даты отпуска по производственному календарю России на 2026 год. Сравните дни отпуска, общую длину отдыха и влияние на доход.'

export function Head() {
  const canonical = absoluteUrl('/vacation')
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
      <meta property="og:image" content={absoluteUrl('/og/vacation.png')} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Калькулятор выгодных дат отпуска в 2026 году"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteUrl('/og/vacation.png')} />
      <StructuredData
        value={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Калькулятор выгодного отпуска',
            url: canonical,
            applicationCategory: 'LifestyleApplication',
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
                name: 'Выгодный отпуск',
                item: canonical,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: VACATION_FAQ.map((item) => ({
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
