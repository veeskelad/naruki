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

## 2026-06-10: Salary archive migration on current engine

The `/salary` route was rebuilt to match the updated `naruki.zip` screens,
but the current typed salary calculation engine and XLSX export helper were
kept as the execution source of truth. This preserves browser-only behaviour
and static SEO while aligning presentation with the archive.

## 2026-06-10: Schedule preview uses explicit clipping

The salary schedule table preview collapses with inline `max-height` and
`opacity` on its wrapper rather than a grid row animation. Table content
resisted grid collapsing in practice, and explicit clipping is more reliable
for this section.

## 2026-06-11: XLSX is an editable report, not a second tax engine

The salary workbook uses the same shared monthly adjustment model as the
browser. In the TK RF sheet, only first-half and second-half workday counts are
editable; dependent monthly and annual cells contain formulas with cached
results. Tax settings and payment dates are exported as a documented snapshot.
Structural formula checks and cached-value checks are mandatory because native
Excel recalculation cannot be tested locally without LibreOffice.

## 2026-06-11: Vacation recommendations are additive short periods

The configured vacation-day count is an annual budget, not the duration of
each recommendation. The optimizer returns stable, non-overlapping periods of
1 to 14 workdays. Users add or remove complete recommendations and may edit
individual workdays in the calendar; recommendation additions cannot exceed
the budget.
