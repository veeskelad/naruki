# Export Quality Plan

Status: completed

## Goal

Make the existing salary XLSX and vacation CSV, ICS, and clipboard outputs
accurate, professionally formatted, testable, and consistent with the values
shown in the browser.

## Decisions

- Keep the existing export formats; do not add new download buttons.
- Use the Naruki white/green visual language with Arial throughout XLSX.
- For TK RF, expose only first-half and second-half workday counts as editable
  blue inputs. Related monthly and annual values use Excel formulas.
- Tax settings and dates remain a documented snapshot, not a full accounting
  model.
- Do not install LibreOffice. Validate formulas structurally and through cached
  values with ExcelJS/openpyxl; document native recalculation as residual risk.

## Steps

1. Move workday adjustment calculations into a shared typed salary module used
   by both the on-page preview and XLSX export.
2. Split workbook generation from browser download and rebuild the three XLSX
   sheets with formulas, validation, correct filters, Russian labels, print
   settings, and fixed summary/detail layouts.
3. Expose pure vacation text builders, improve CSV/ICS compliance, and add an
   accessible clipboard success/error status.
4. Add unit and browser tests for all formats, inspect generated XLSX with
   ExcelJS and openpyxl, then run lint, build, E2E, and the frontend checklist.

## Acceptance Criteria

- XLSX reflects edited workday counts from the salary preview.
- No duplicated parameters, `[object Object]`, broken filters, or formula error
  tokens appear in the workbook.
- CSV is sorted, deduplicated, BOM-prefixed, semicolon-delimited, and CRLF
  terminated.
- ICS contains valid all-day events with stable UIDs, DTSTAMP, CALSCALE, and
  METHOD fields.
- Clipboard output uses localized dates and announces success or failure.
- Product changes and DOE/service documentation are committed separately.
