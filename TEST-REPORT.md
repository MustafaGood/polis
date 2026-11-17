# LIA verification report

## Scope and interpretation

The internship plan offers accessibility, eID or a hybrid; the agreed final
scope and approval must be confirmed by the supervisor and education provider.
This report does not certify WCAG conformance or LIA completion. Results refer
only to the local revision and environment tested, not automatically to CI
or to every pull-request branch.

## Plan checklist

| Deliverable | Status | Evidence or remaining work |
| --- | --- | --- |
| Participant labels, focus, status, landmarks and form errors | Partial | Implemented and covered in part by existing component tests; complete keyboard and screen-reader journeys remain to be assessed. |
| Dialog keyboard behavior | Partial | Implementation and regression tests exist; verify the live participant and admin flows, including focus restoration. |
| PCA alternative and controls | Partial | An alternative and accessible controls exist; check the completeness of the information and interaction manually. |
| jest-axe and cypress-axe | Partial | Tests and CI workflows exist. The Cypress smoke tests cover only the voting card and submission form; the updated seeded setup still needs an isolated-stack run. |
| Report-client jsx-a11y lint and triage | Partial | A separate lint command found 23 accessibility-rule errors; full visualization remediation is outside the plan. |
| Admin checkboxes, dialogs and tables | Partial | Accessibility changes exist; verify all relevant names, keyboard flows and table relationships manually. |
| Manual NVDA/VoiceOver, keyboard and i18n assessment | Missing | Individual entries in the existing manual checklist are marked untested. Historical code/axe summaries are not a manual assessment. |
| eID sandbox | Partial | The user reported BankID test-user login and a statement submission was observed. Freja, identity assurance claims and the complete automated sandbox flow remain unverified. |
| Documentation and handover | Partial | Guides and test status are available; supervisor review, agreed scope, demo and any required GDPR review remain open. |

### Plan acceptance criteria

The plan lists five criteria: zero critical axe violations on defined journeys;
all interactive elements keyboard reachable; visible focus on buttons and
fields; form errors announced by a screen reader; and a green participant
`npm run verify`. The verify command passed in an isolated copy after its
format step rewrote files; the unchanged worktree does not pass the CI-style
format check. Counting only the command criterion gives **1 of 5 (20%)**;
the other four are unverified. This is not a percentage of the entire LIA or
a claim that CI is green.

## Test results

- E2E smoke spec: focused Prettier and ESLint checks passed; the Cypress
  execution with the new seeded setup has not been run on an isolated stack.
- Participant: `npm test -- --runInBand` passed (15 suites, 103 tests);
  `npm run lint` passed. `npm run verify` and `npm run build` passed in an
  isolated copy without local environment files, where verify automatically
  formatted files. In the unchanged worktree `npx prettier --check .` failed
  on 10 files and `npx tsc --noEmit` failed with 34 existing diagnostics;
  none were in files changed for this task.
- Admin: `npm test -- --runInBand` passed (30 suites, 314 tests), and
  `npm run lint` passed. `npm run build` passed in an isolated copy without
  local environment files.
- Report client: `npm run lint` passed. The separate `npm run lint:a11y`
  failed with 23 JSX accessibility-rule errors: 11 missing keyboard events,
  9 static-element interactions and one each for focusability, label
  association and required ARIA properties. The broader `.js`/`.jsx` scan
  also reported other existing lint issues. No full remediation is claimed.
- Earlier in this session, 24 server eID-related unit tests, 6 participant
  tests and 4 admin token tests passed. These numbers concern the earlier eID
  changes only and do not demonstrate end-to-end Idura behavior.

## Pull requests

Open PRs [#1](https://github.com/MustafaGood/polis/pull/1),
[#2](https://github.com/MustafaGood/polis/pull/2),
[#3](https://github.com/MustafaGood/polis/pull/3),
[#4](https://github.com/MustafaGood/polis/pull/4),
[#5](https://github.com/MustafaGood/polis/pull/5) and draft
[#7](https://github.com/MustafaGood/polis/pull/7) were reported mergeable,
with no check results returned. Their heads are ancestors of the local HEAD;
the PRs overlap and #7 contains a larger combined change. These observations
do not establish code quality or green CI for each PR; an independent
line-by-line review of every PR and a full repository security audit remain
outstanding. The local audit changes were not part of the PR heads inspected
at that time. PR #6 is merged. No PR was merged as part of this audit.

| PR | Purpose |
| --- | --- |
| #1 | Participant form labels, focus, live regions and landmarks |
| #2 | Form errors and visualization control states |
| #3 | PCA text alternatives |
| #4 | Manual checklist, i18n and test updates |
| #5 | Admin filters and landmarks |
| #7 | Draft combining accessibility and eID work; 98 changed files |

## Files changed in this audit

The following files were changed during this audit:

- Participant: `Statement.tsx`, `visualization/PCAVisualization.tsx`,
  `visualization/VisualizationControls.tsx`, `__tests__/Statement.a11y.test.tsx`,
  `__tests__/PCAVisualization.a11y.test.tsx`,
  `__tests__/TreeviteLoginCodeModal.test.tsx`, and
  `client-participation-alpha/docs/a11y-manual-checklist.md`.
- Admin, under `client-admin/src/components/conversation-admin`:
  `CheckboxField.js` and its test; `InviteCodes.js` and its test;
  `ParticipantManagement.js` and its test;
  `ParticipantManagement/UploadXidsModal.js` and its test;
  `ParticipantManagement/XidAllowListTable.js` and its test; and
  `comment-moderation/Comment.js` and its test.
- CI and tests: `.github/workflows/client-participation-alpha-ci.yml` and
  `e2e/cypress/e2e/alpha-client/a11y.cy.js`.
- Report-client lint: `client-report/package.json`, `package-lock.json`, and
  `.eslintrc.a11y.yml`.
- Documentation: `README.md`, `ACCESSIBILITY.md`, `WCAG-COMPLIANCE.md`,
  `DEVELOPMENT.md`, and this report.

Two generated `.astro` files were already modified before this audit and were
left untouched.

## Known limitations and next steps

1. Run the Cypress suite on a dedicated test database and inspect the CI
   results for each PR. Do not reset a shared database.
2. Record complete keyboard and NVDA/VoiceOver checks, including participant
   and admin dialogs, screen-reader announcements and PCA alternatives.
3. Address the participant TypeScript diagnostics and the worktree formatting
   failures. Triage and prioritize the report-client lint findings.
4. Validate BankID and Freja test flows, applicable claims, security/privacy
   decisions and the final demonstration with the supervisor.
5. Review the overlapping PR stack and obtain authorization before merging.

Additional existing TODOs include a skipped alpha integrated-embed parity test,
missing topic-agenda success/error feedback and server integration/auth test
follow-ups. They are not evidence of completed functionality.
