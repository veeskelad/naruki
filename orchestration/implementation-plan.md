# Full MVP Implementation Plan

Status: approved by the user on 2026-06-09.

1. Introduce Vike SSG and route-level SEO.
2. Implement reusable calendar, salary, export, and metadata modules.
3. Port the final archive UI into typed, focused React components.
4. Add static FAQ/content blocks for search and AI discovery.
5. Add automated tests and verify Vercel-compatible production output.

The production origin is configured with `VITE_PUBLIC_SITE_URL`. Until
`naruki.space` is connected, Vercel should set it to the production deployment
URL. The intended final value is `https://naruki.space`.

