# Security and Privacy

- Calculations and exports run locally in the browser.
- Do not add API endpoints that receive salary, tax, or vacation inputs.
- Do not persist calculator state in cookies or remote analytics.
- Do not use WebVisor, session replay, or form-content analytics.
- Escape structured-data values and never interpolate user input into JSON-LD.
- External links opened in a new tab must use `rel="noreferrer"`.

