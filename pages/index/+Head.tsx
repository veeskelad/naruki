import { StructuredData } from '@/seo/StructuredData'
import { absoluteUrl, SITE_NAME } from '@/seo/site'
import { HOME_FAQ } from '@/seo/content'

const description =
  'Калькулятор выгодного отпуска и выплат на руки в 2026 году. Производственный календарь РФ, НДФЛ, НПД и УСН — бесплатно и без регистрации.'

export function Head() {
  const canonical = absoluteUrl('/')
  return (
    <>
      <title>На руки — выгодный отпуск и расчёт зарплаты 2026</title>
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
      <meta property="og:title" content="На руки — отпуск и зарплата без регистрации" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absoluteUrl('/og/home.png')} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="На руки — калькуляторы отпуска и зарплаты"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="На руки — отпуск и зарплата без регистрации"
      />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteUrl('/og/home.png')} />
      <StructuredData
        value={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: canonical,
            inLanguage: 'ru-RU',
            description,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: canonical,
            logo: absoluteUrl('/naruki-logo.png'),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: HOME_FAQ.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        ]}
      />
    </>
  )
}
