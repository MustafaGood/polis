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
| Dialog keyboard behavior | Partial | Participant regression tests cover Tab, Escape, clipboard feedback and focus restoration even when the invite form disappears; verify live participant and admin flows. |
| PCA alternative and controls | Partial | A text disclosure now gives group counts, PCA coordinate ranges and centers, cluster coordinates, and the participant's cluster position when available. Manual review must confirm the description is understandable and sufficiently equivalent. |
| jest-axe and cypress-axe | Partial | Component tests cover voting, forms and PCA controls. The seeded accessibility spec and full Cypress suite passed locally on the dedicated test stack; remote GitHub CI remains pending because the changes are uncommitted. |
| Report-client jsx-a11y lint and triage | Partial | A separate lint command found 23 accessibility-rule errors; full visualization remediation is outside the plan. |
| Admin checkboxes, dialogs and tables | Partial | Accessibility changes exist; verify all relevant names, keyboard flows and table relationships manually. |
| Manual NVDA/VoiceOver, keyboard and i18n assessment | Missing | A full live-flow keyboard checklist is now documented, but no complete manual run is recorded. Individual screen-reader and i18n checks remain untested. Historical code/axe summaries are not a manual assessment. |
| eID sandbox | Partial | A local BankID test-user sign-in was reported and a submitted statement was observed. On 2026-11-19, the local Docker Compose development stack was brought up, the conversation loaded, and the participation API returned HTTP 200. This is a local setup, not a shared or published instance. Freja, identity assurance claims and the complete automated sandbox flow remain unverified. |
| Documentation and handover | Partial | Guides and test status are available; supervisor review, agreed scope, demo and any required GDPR review remain open. |

### Plan acceptance criteria

The plan lists five criteria: zero critical axe violations on defined journeys;
all interactive elements keyboard reachable; visible focus on buttons and
fields; form errors announced by a screen reader; and a green participant
`npm run verify`. The verify command passed in an isolated copy after its
format step rewrote files; the unchanged worktree does not pass the CI-style
format check. Counting only the command criterion gives **1 of 5 (20%)**;
the other four are not fully verified, although the Cypress run now covers
parts of the axe and keyboard criteria. This is not a percentage of the entire
LIA or a claim that CI is green.

## Test results

- Follow-up on 2026-11-23: the participant client passed `npm test -- --runInBand`
  (16 suites, 129 tests) and `npm run lint`. The new PCA description, participant
  position summary, successful-vote status, and keyboard interaction tests are
  included. `npx tsc --noEmit` still reports diagnostics in existing, untouched
  files; none point to files changed in this follow-up. These results do not
  replace screen-reader or manual WCAG assessment.
- Dedicated Cypress run on 2026-11-23: all five tests in
  `e2e/cypress/e2e/alpha-client/a11y.cy.js` passed against a uniquely named
  Compose project with its own PostgreSQL database, OIDC simulator, server,
  Alpha client and proxy. The seeded conversation and comment were created
  through the isolated API. The run covered two axe checks (zero critical or
  serious violations in the checked selectors), keyboard focus/vote/comment
  submission, and a field-associated duplicate-comment error. This was the
  accessibility spec only, not the full E2E suite; math and file-server
  services were not started. Cypress ESLint and Prettier checks passed.
- Full Cypress E2E run on 2026-11-23: all 35 specs completed on the isolated
  full test stack using `CI=true` (the workflow's timeout and retry settings).
  Cypress reported 217 passing, 0 failing and 1 pending test (218 total); the
  pending case is the existing skipped Alpha integrated-embed parity TODO.
  Some tests needed a retry before passing, so the suite is green but still
  shows intermittent timing sensitivity. The local run does not establish a
  GitHub Actions result.
- Earlier Cypress accessibility smoke: four tests passed twice in an isolated copy
  of the participant app with mock API responses. They cover axe checks for
  the voting card and form, keyboard focus order and an intercepted duplicate
  submission error. This earlier test exposed insufficient button contrast,
  which was corrected and checked in the passing runs.
- Earlier participant changes: `npm test -- --runInBand` passed (16 suites,
  125 tests) and `npm run lint` passed. Jest exercises the invite-to-dialog
  focus handoff, clipboard feedback, dialog description and the PCA vote-count
  table, including statement ID 0. TypeScript still reports 34 diagnostics in
  existing files; none are in the changed modal, focus or PCA files. These
  tests do not replace a real browser or screen-reader assessment.
- Subsequent form and focus changes: `npm test -- --runInBand` passed
  (16 suites, 118 tests) and `npm run lint` passed. Component tests cover
  validation, pending submissions and focus restoration. An isolated
  Chromium test used simulated keyboard input and mocked APIs to check
  voting controls, the three forms, and focus after code login. No real
  conversation data was submitted. Real end-to-end flows and screen-reader
  announcements still need assessment.
- GitHub Actions: `.github/workflows/cypress-tests.yml` now triggers on pushes
  to `feature/eid-oidc-poc`. The remote branch has not run this updated workflow:
  the changes are local and uncommitted, so remote CI verification is pending
  push.
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
- Local environment check on 2026-11-19: started the development stack with
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile postgres up -d`.
  PostgreSQL became ready, `participationInit` returned HTTP 200, and the
  conversation, voting controls and statement form loaded in the browser.
  The local Idura callback route was configured through the Nginx proxy and
  returned the callback page; this does not verify a complete Idura callback
  exchange, Freja, eID `acr` enforcement or a shared deployment. The Nginx
  callback change is local and has not been pushed to GitHub.

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

1. The full Cypress suite passed locally on the dedicated test database. Inspect
   the GitHub Actions result after these changes are committed/pushed; do not
   reset a shared database.
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
