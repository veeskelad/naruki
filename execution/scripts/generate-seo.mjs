import { writeFile } from 'node:fs/promises'

const raw =
  process.env.VITE_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  'https://naruki.space'
const origin = raw.startsWith('http') ? raw : `https://${raw}`
const urls = ['/', '/vacation', '/salary']

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${new URL(path, origin).toString()}</loc></url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', origin)}
`

const llms = `# На руки

> Бесплатный русскоязычный сервис для планирования отпуска и расчёта выплат.

- [Главная](${new URL('/', origin)}): описание сервиса и поддерживаемых режимов.
- [Выгодный отпуск](${new URL('/vacation', origin)}): производственный календарь РФ 2026 и подбор дат.
- [Зарплата на руки](${new URL('/salary', origin)}): НДФЛ, НПД, УСН и календарь выплат.

Все персональные расчёты выполняются локально в браузере и не отправляются на сервер.
`

await Promise.all([
  writeFile('public/sitemap.xml', sitemap),
  writeFile('public/robots.txt', robots),
  writeFile('public/llms.txt', llms),
])

