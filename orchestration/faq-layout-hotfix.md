# FAQ Layout Hotfix

## Scope

Restore the FAQ section geometry from the source design and make every item
collapsed on initial render without removing FAQ answers from prerendered HTML.

## Steps

1. Add an end-to-end regression test for initial collapse, single-item opening,
   and desktop column separation.
2. Allow the accordion content container to receive state-based visibility
   classes while keeping its inner typography classes unchanged.
3. Restore the source design's `max-w-7xl`, 4/8 column split, spacing, and
   heading scale.
4. Run lint, build, focused browser tests, and visual verification.
5. Record the root cause and result in the project logs.

## Decision

Keep `forceMount` for FAQ answers so static HTML remains complete for search
engines. Hide the closed Radix content container using its own
`data-state="closed"` attribute rather than applying that selector to a child.
