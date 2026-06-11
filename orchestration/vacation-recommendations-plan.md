# Vacation Recommendations Plan

Status: completed

## Goal

Replace full-budget vacation alternatives with short profitable periods that
users can combine through the year, while keeping calendar editing, copy
output, and the vacation-day input predictable.

## Decisions

- Generate recommendation periods from 1 to 14 vacation workdays.
- In max-rest mode, rank by attached off-days, then leverage, then lower
  vacation-day cost.
- Keep five non-overlapping recommendations stable after selection.
- Clicking a recommendation adds it; clicking a fully selected recommendation
  removes it.
- Disable additions that would exceed the configured vacation-day budget.
- Remove the redundant financial month-rating section from the page.
- Copy only compact human-readable ranges separated by semicolons.
- Allow the day input to be temporarily empty and restore the last valid value
  on blur.

## Steps

1. Rework the pure vacation optimizer and expose recommendation selection
   helpers without duplicating calendar rules in the UI.
2. Update the vacation page state, recommendation cards, numeric input, and
   explanatory copy.
3. Group copied dates into rest-connected intervals and simplify the clipboard
   API.
4. Add unit and E2E coverage for ranking, additive selection, budget
   enforcement, copied ranges, and empty input editing.
5. Run lint, build, unit tests, accessibility/E2E, and the frontend checklist.

## Acceptance Criteria

- Entering 18 days does not produce five 18-day recommendation periods.
- Recommendations prioritize calendar bridges around holidays and weekends.
- Multiple recommendations can be combined without exceeding the budget.
- Selected recommendations can be removed and manually edited by month.
- Clipboard text contains ranges only.
- The numeric input can be cleared before pasting another value.
