# Accessibility

The LIA accessibility work prioritizes `client-participation-alpha`: forms,
keyboard focus, dialogs, status messages, landmarks and the PCA visualization.
The admin interface is a supplementary scope.

## Review and testing

- Run the participant Jest tests and the Cypress accessibility smoke tests as
  described in [DEVELOPMENT.md](./DEVELOPMENT.md).
- Use the [manual checklist](./client-participation-alpha/docs/a11y-manual-checklist.md)
  to record the browser, assistive technology, date and result of each test.
  Its historical summary describes code and automated checks, not a completed
  keyboard or screen-reader assessment.
- Check the participant voting and submission flows, validation and status
  messages, visualization controls and text alternative, and dialogs with
  keyboard only and a screen reader. Test relevant admin controls and dialogs too.
- An axe scan covers only the rendered content and rules it checks. Passing it
  does not establish WCAG conformance or accessibility with assistive technology.

See [WCAG-COMPLIANCE.md](./WCAG-COMPLIANCE.md) for the scope and outstanding
assessment, and [TEST-REPORT.md](./TEST-REPORT.md) for actual test results.

## Contributing

Use visible labels and meaningful accessible names, preserve keyboard focus and
visible focus indicators, connect validation errors to their fields, and
announce status changes appropriately. For dialogs, test focus entry, trapping,
Escape and focus restoration. Add focused regression tests for changed behavior,
then verify the actual interaction with keyboard and assistive technology.
