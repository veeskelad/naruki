# Naruki Product Requirements

## Goal

Deliver a production-ready Russian-language web service with two private,
browser-only calculators:

- profitable vacation dates for the Russian production calendar;
- salary and payment schedule calculations for employees, self-employed
  workers, and individual entrepreneurs.

## Release Requirements

- The routes `/`, `/vacation`, and `/salary` must be statically rendered.
- Meaningful content, headings, FAQ text, metadata, and structured data must be
  present in HTML before JavaScript executes.
- User-entered financial and vacation data must never be sent to a server.
- The final visual source is `naruki.zip`; internal specifications define
  calculation behavior when the archive only provides a prototype.
- The application must be deployable as a static Vercel project.

## Supported Release Data

- Production calendar: Russia, 2026.
- Salary tax rules: Russian rules applicable in 2026.
- Future years must be addable through data registries without rewriting UI.

