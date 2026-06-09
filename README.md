# На руки

Статический русскоязычный сервис с калькулятором зарплаты и планировщиком
отпуска по производственному календарю России на 2026 год.

Все пользовательские значения обрабатываются локально в браузере. Публичные
страницы заранее рендерятся в HTML, поэтому основной текст, метаданные и
структурированные данные доступны поисковым роботам без выполнения JavaScript.

## Возможности

- расчёт зарплаты, НДФЛ и дат выплат по ТК РФ;
- режимы НПД и ИП на УСН;
- подбор выгодных периодов отпуска;
- экспорт расчёта зарплаты в XLSX;
- экспорт отпуска в CSV и ICS;
- статические `sitemap.xml`, `robots.txt`, `llms.txt` и `404.html`;
- адаптивный интерфейс и клавиатурная навигация.

## Стек

- React 19, TypeScript 6, Vite 8;
- Vike SSG и `vike-react`;
- Tailwind CSS 4 и Radix UI;
- ExcelJS для ленивого XLSX-экспорта;
- Vitest и Playwright.

## Локальная разработка

```bash
npm install
cp .env.example .env.local
npm run dev
```

Проверки:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Production-preview:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

## Архитектура

- `pages/` — файловые маршруты Vike, head-теги и error page;
- `src/pages/` — интерфейс страниц;
- `src/lib/` — чистая расчётная логика и экспорт;
- `src/data/` — календарь и налоговые константы;
- `src/seo/` — URL и JSON-LD;
- `directions/` — требования и инженерные правила DOE;
- `orchestration/` — план и архитектурные решения;
- `execution/` — генераторы, журналы и результаты проверок.

Команда `npm run build` сначала генерирует SEO-файлы, затем собирает приложение
и пререндерит маршруты в `dist/client`.

## Деплой на Vercel

Репозиторий готов к импорту в Vercel:

- Build Command: `npm run build`;
- Output Directory: `dist/client`;
- Install Command: `npm install`;
- переменная `VITE_PUBLIC_SITE_URL`: канонический origin без завершающего `/`.

До подключения домена можно использовать production URL проекта Vercel: он
автоматически подхватывается из `VERCEL_PROJECT_PRODUCTION_URL`. После
подключения `naruki.space` нужно установить
`VITE_PUBLIC_SITE_URL=https://naruki.space` и выполнить новый production
deployment.

DNS-записи следует брать из раздела Domains конкретного проекта Vercel. После
переноса домена необходимо добавить сайт в Google Search Console и Яндекс
Вебмастер и отправить `https://naruki.space/sitemap.xml`.

## Лицензия

MIT
