# Architectural Decisions

## 2026-06-09: Vike SSG instead of a client-only SPA

Each public URL must return complete HTML for search engines and AI crawlers.
Vike preserves the existing Vite/React stack while adding prerendering and
hydration without a full Next.js migration.

## 2026-06-09: Browser-only domain processing

All calculations and file exports run in the browser. Static rendering outputs
descriptive default content, while personal values appear only after hydration.

## 2026-06-09: Data registries by year

Production calendars and tax constants are stored by year. Unsupported years
are not silently treated as official data.

## 2026-06-09: Source hierarchy

The latest archive screens define presentation. Official government and tax
sources override prototype formulas and hard-coded examples.

