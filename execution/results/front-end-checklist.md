# Front-End Checklist Audit

Audit date: 2026-06-09  
Reference: <https://github.com/thedaviddias/Front-End-Checklist>  
Scope: `/`, `/vacation`, `/salary`, and the static error page.

## Result

The repository is ready for a Vercel preview deployment. All checks that can be
completed locally pass. Domain, CDN, and search-engine checks remain
post-deployment tasks.

## HTML

- [x] HTML5 doctype, UTF-8 charset, and responsive viewport.
- [x] `lang="ru-RU"` on every generated document.
- [x] One descriptive `h1` on each public route.
- [x] Semantic `header`, `nav`, `main`, `section`, `article`, `aside`, and
  `footer` landmarks.
- [x] Buttons are used for actions and anchors for navigation.
- [x] Forms and interactive controls have accessible names.
- [x] Complete useful content exists in prerendered HTML without JavaScript.
- [x] Custom static `404.html` is generated and marked `noindex`.
- [x] Branded SVG favicon, Apple touch icon, and web manifest.

## Meta And SEO

- [x] Unique titles: 48, 50, and 55 characters.
- [x] Unique descriptions: 137, 134, and 143 characters.
- [x] One canonical URL per route.
- [x] `robots` directives allow indexing and large previews.
- [x] Open Graph and Twitter card metadata.
- [x] 1200 x 630 PNG social images with alt text.
- [x] `WebSite`, `Organization`, `WebApplication`, `BreadcrumbList`, and
  `FAQPage` JSON-LD where applicable.
- [x] `sitemap.xml`, `robots.txt`, and `llms.txt`.
- [x] Russian and `x-default` alternate links.
- [x] Human-readable clean URLs.

## CSS And Responsive Design

- [x] Mobile-first layouts verified at 390 x 844 and desktop width.
- [x] No horizontal page overflow.
- [x] Visible keyboard focus and skip-to-content link.
- [x] `prefers-reduced-motion` disables reveal animation.
- [x] Basic print stylesheet hides application chrome and controls.
- [x] Native number spinners are removed; explicit `-` and `+` controls remain.
- [x] Design tokens provide WCAG AA contrast for meaningful text.

## Accessibility

- [x] Keyboard-accessible navigation and dialogs.
- [x] Accessible names for icon-only controls.
- [x] Scrollable data table is focusable and labelled.
- [x] Decorative logo image has empty alt text; adjacent brand text supplies
  the accessible name.
- [x] Automated axe checks report no serious or critical WCAG A/AA violations
  on all routes in desktop and mobile projects.
- [x] Six accessibility scenarios pass in Playwright.

## JavaScript And Behavior

- [x] TypeScript production build succeeds.
- [x] Domain logic is separated from React components.
- [x] Salary and vacation engines have 11 passing unit tests.
- [x] Ten route and interaction scenarios pass in desktop and mobile Chromium.
- [x] No production console errors or warnings.
- [x] XLSX code is loaded only when the export action is used.
- [x] Content remains readable when hydration is unavailable.

## Images And Assets

- [x] Header logo has explicit intrinsic dimensions.
- [x] Header uses a 256 x 256 WebP asset instead of the 512 x 512 PNG.
- [x] Social images are correctly sized and compressed PNG files.
- [x] Hashed Vite assets receive immutable one-year cache headers.
- [x] No source maps are shipped by the production build.

## Security And Privacy

- [x] No user calculation data is sent to an application backend.
- [x] `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and
  restrictive `Permissions-Policy` headers are configured.
- [x] `npm audit` reports zero known vulnerabilities.
- [x] No credentials or production secrets are required by the client.

## Performance Notes

- [x] Public routes are statically generated.
- [x] Route entry chunks are approximately 13-27 kB before gzip.
- [x] Main CSS is approximately 70 kB before gzip.
- [x] The 930 kB ExcelJS chunk is lazy and is not preloaded by any route.
- [x] Logo payload used by the header is approximately 28 kB.
- [ ] Lighthouse and Core Web Vitals must be measured against the deployed CDN,
  not the local preview.

## Post-Deployment Checks

- [ ] Confirm HTTPS, certificate, and HTTP-to-HTTPS redirect on the Vercel URL.
- [ ] Confirm `naruki.space` and `www` redirect to one canonical host.
- [ ] Verify edge response headers and compression.
- [ ] Run Lighthouse mobile and desktop against the production URL.
- [ ] Validate live cards in Telegram/Open Graph debuggers.
- [ ] Add Google Search Console and Yandex Webmaster verification files.
- [ ] Submit the live sitemap and inspect indexing status.
- [ ] Test current Safari, Firefox, Chrome, and Edge manually.

## Verification Commands

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm audit
```
