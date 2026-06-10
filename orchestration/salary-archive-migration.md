# Salary Archive Migration

Status: completed

## Goal

Replace the current `/salary` route implementation with the updated layout
and copy structure from `naruki.zip`, while keeping the current calculation
engine, static rendering, SEO metadata, and browser-only exports.

## Scope

- Rebuild `src/pages/Salary.tsx` to match the updated archive screens:
  - title and lead copy
  - 3-step control block
  - next payment hero
  - schedule card with preview toggle
  - insight cards
  - article section
  - FAQ section
- Update `pages/salary/+Head.tsx` to match the new route wording.
- Preserve the current calculation modules in `src/lib/salary/*` and the
  XLSX export helper in `src/lib/export/salary.ts`.
- Keep FAQ answers and route content prerendered for search indexing.

## Constraints

- All calculations remain client-side only.
- The route must remain statically rendered.
- No API endpoints, cookies, analytics, or persistence.
- Use the existing Radix/shadcn primitives already in `src/components/ui`.

## Implementation Steps

1. Compare the archive salary screens with the current salary route and
   identify the layout blocks that need to be recreated.
2. Rebuild the page as typed React components that map to the archive
   sections, using the current calendar and salary libraries for data.
3. Update metadata and structured data copy so the route title/description
   matches the new design.
4. Verify the page in the browser, then run the frontend checklist review and
   fix any Critical/High issues in scope.
5. Record the final decisions and any new gotchas in `directions/known-issues.md`.

## Notes

- The archive already contains the target presentation, so the current page
  should be treated as obsolete rather than incrementally patched.
- The current salary math can be reused; the work is mostly route/UI
  migration plus copy/SEO alignment.
