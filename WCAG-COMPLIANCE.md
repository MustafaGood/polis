# WCAG 2.1 AA assessment status

This is a work-in-progress mapping, **not a conformance claim or certification**.
Existing implementation and automated tests are evidence of work, not proof
that a success criterion is satisfied throughout the product.

| Area | Relevant criteria | Assessment still needed |
| --- | --- | --- |
| Labels, structure, landmarks and headings | 1.3.1, 2.4.1, 2.4.6, 3.3.2 | Review all affected flows and languages with assistive technology. |
| Keyboard, focus and dialogs | 2.1.1, 2.1.2, 2.4.3, 2.4.7 | Verify complete keyboard journeys, dialog focus trapping, Escape and focus restoration in a browser. |
| Errors and status messages | 3.3.1, 3.3.3, 4.1.3 | Trigger errors and confirm announcements with a screen reader. |
| PCA visualization and controls | 1.1.1, 1.3.1, 2.1.1, 4.1.2 | A table exposes displayed statement vote counts; plot geometry and user position still need an equivalent alternative. Verify controls without a mouse. |
| Admin checkboxes, tables and dialogs | 1.3.1, 2.1.1, 2.4.3, 4.1.2 | Review accessible names, table relationships and complete keyboard/screen-reader behavior. |

The plan excludes full remediation of the report client's visualizations;
`client-report` lint and triage were proposed separately. Other WCAG criteria,
responsive layouts, zoom, contrast, language variations and assistive
technologies require a broader assessment before any product-wide conclusion.

Use [the manual checklist](./client-participation-alpha/docs/a11y-manual-checklist.md)
and record results rather than treating historical code-review summaries as
manual passes.
