# Salary Compare Panel Fix

Status: completed

## Problem

The current `/salary` page renders an extra `SalaryArticle` section titled
“Понятные расчёты”. The latest `naruki.zip` design instead places a collapsible
“Сравнить с другими режимами” panel after the insight cards.

## Plan

1. Remove `SalaryArticle` and its unused icon dependency from
   `src/pages/Salary.tsx`.
2. Recreate the archive comparison panel with the current design tokens and
   responsive layout.
3. Calculate TK RF, NPD, and IP USN 6% comparison values through the current
   typed `calculateSalary` engine, preserving the user's monthly gross income
   and applicable settings.
4. Implement the panel as an accessible disclosure with `aria-expanded`,
   visible keyboard focus, symmetric open/close motion, and
   `prefers-reduced-motion` support.
5. Keep the salary schedule preview collapsed on initial page load.
6. Verify the desktop and mobile layouts, run lint/build, and review the
   changed frontend file with the Front-End Checklist.

## Acceptance Criteria

- The extra “Понятные расчёты” block is absent from `/salary`.
- The comparison panel matches the archive hierarchy and three-card layout.
- “Ваш” marks the selected supported regime and “Больше всего” marks the
  highest annual net result.
- Comparison values come from production calculation modules, not prototype
  formulas.
- The schedule table preview is initially collapsed and remains expandable.
- The route remains statically prerendered and keyboard accessible.
- Lint, production build, and scoped checklist review pass without unresolved
  Critical or High findings.
