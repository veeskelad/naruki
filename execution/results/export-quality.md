# Export Quality Verification

Date: 2026-06-11

## Scope

- Salary XLSX for TK RF, NPD, and IP USN modes.
- Vacation CSV, ICS, and clipboard text.
- Browser download flow and edited workday propagation.

## Results

- Unit tests: 19 passed.
- Playwright E2E: 24 passed.
- ESLint: passed.
- Production build: passed.
- Front-End Checklist review/release: 0 local issues.
- ExcelJS round trip: passed.
- openpyxl inspection: three expected sheets, 97 formulas, valid filters,
  freeze panes, print areas, input validation, and no formula error tokens.
- Cached formula values reflect edited workdays; January net pay was verified
  as 63,800 rubles after setting first-half workdays to zero.

## Residual Risk

LibreOffice is not installed by project decision. Formula structure and cached
results are verified, but native desktop spreadsheet recalculation was not run
in this environment.
