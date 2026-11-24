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
| PCA alternative and controls | Partial | A text disclosure gives group counts, PCA coordinate ranges and centers, cluster coordinates, shape geometry, axis directions, and the participant's cluster position when available. Screen-reader assessment remains. |
| jest-axe and cypress-axe | Partial | Component tests cover voting, forms and PCA controls. The seeded accessibility spec and full Cypress suite passed locally and in GitHub Actions on the dedicated test stack; manual accessibility journeys remain incomplete. |
| Report-client jsx-a11y lint and triage | Partial | A separate lint command found 23 accessibility-rule errors; full visualization remediation is outside the plan. |
| Admin checkboxes, dialogs and tables | Partial | Accessibility changes exist; verify all relevant names, keyboard flows and table relationships manually. |
| Manual NVDA/VoiceOver, keyboard and i18n assessment | Partial | No complete manual run is recorded. The user reported hearing several form errors and a vote confirmation with Windows Narrator; limited i18n checks and simulated keyboard checks were also performed. Other journeys remain untested. Historical code/axe summaries are not a manual assessment. |
| eID sandbox | Partial | A local BankID test-user sign-in was reported and a submitted statement was observed. On 2026-11-19, the local Docker Compose development stack was brought up, the conversation loaded, and the participation API returned HTTP 200. This is a local setup, not a shared or published instance. Freja, identity assurance claims and the complete automated sandbox flow remain unverified. |
| Documentation and handover | Partial | Guides and test status are available; supervisor review, agreed scope, demo and any required GDPR review remain open. |

### Plan acceptance criteria

The plan lists five criteria: zero critical axe violations on defined journeys;
all interactive elements keyboard reachable; visible focus on buttons and
fields; form errors announced by a screen reader; and a green participant
`npm run verify`. The command passed on the current participant worktree after
its format step rewrote files, and a separate non-writing Prettier check passed.
Counting only the command criterion gives **1 of 5 (20%)**; the other four are
not fully verified. The Cypress run covers parts of the axe and keyboard
criteria. GitHub Actions is green for the earlier feature branch's Cypress
workflow; this is not a percentage of the entire LIA and does not establish
full accessibility conformance.

## Test results

- PCA test portability follow-up: GitHub's Linux participant CI failed three
  tests because they expected the Swedish locale's Unicode minus sign while
  Linux formatted the number with a hyphen-minus. The expectations now use
  the runtime's number format, preserving the application's existing behavior.
  The focused PCA suite passed all 10 tests locally on Windows and in a Linux
  container. The corrected commit still needs GitHub CI confirmation.
- Keyboard follow-up on 2026-11-24: after instructions for the isolated
  participation page, the user reported reaching the visible controls,
  seeing focus and not getting trapped. After instructions for the invite gate,
  the user reported reaching both forms, submitting invalid codes with Enter,
  seeing focus and navigating onward. The exact test conditions were not
  independently observed; other states and complete journeys remain to be checked.
- Expanded isolated accessibility checks on 2026-11-24: whole-page axe scans
  initially found insufficient contrast in the invite form's separator and
  pending submit button. The separator and enabled button were darkened, and
  pending/disabled text was made dark. After rebuilding the isolated client,
  13 Cypress tests passed: scans covered the participation page, duplicate
  comment error, invite gate, invalid invite/login errors, pending invite and
  a mocked login-code dialog. No critical or serious axe violations were
  reported in those tested states. Dialog focus, Tab wrapping and Escape were
  also checked with simulated input. This is not a full manual audit.
  Participant `npm run verify` passed again (16 suites, 139 tests, lint and build).
- Windows Narrator form-error follow-up on 2026-11-24: the user reported
  hearing errors for a duplicate statement, invalid email, invalid invite
  code and invalid login code after instructions for the isolated test
  environment. The email case concerned browser validation, not an API error.
  The announcements and exact test conditions were not independently observed;
  no alert was visible on the shared page afterward. Network errors, other
  form cases and complete screen-reader journeys remain unverified.
- Participant worktree verification on 2026-11-24: `npm run verify` formatted
  the worktree and passed lint, all 16 Jest suites (139 tests), and the build.
  A subsequent non-writing Prettier check also passed.
- Windows Narrator follow-up on 2026-11-24: after instructions to submit a
  vote with Enter on the shared isolated test page, the user reported hearing
  the confirmation. The announcement and precise test conditions were not
  independently observed; other screen-reader journeys remain to be tested.
- Participant verification on 2026-11-24 after the login-status change:
  `npm run verify` passed in an isolated copy without local environment files.
  Its format step rewrote that copy; lint, all 16 Jest suites (139 tests), and
  the build passed. A non-writing Prettier check in the original worktree
  identified 10 unformatted files. The worktree was reformatted later, as
  recorded above.
- Invite/login Cypress regression: simulated `.type('{enter}')` on each
  focused submit button sends a request and displays a field-linked error for
  mocked invalid-code responses. The invite-gated spec may reuse an isolated
  test conversation through `CYPRESS_TREEVITE_CONVERSATION_ID`; otherwise it
  creates one as before. The isolated run passed all 3 tests in both Electron
  and Chrome. This synthetic test does not replace native keyboard or
  screen-reader assessment.
- Real invite/login follow-up on 2026-11-24: valid synthetic invites were
  redeemed on the isolated stack (HTTP 201), and their generated login codes
  succeeded (HTTP 200). Simulated Enter in Playwright and Space in Cypress
  worked; the modal trapped Tab/Shift+Tab, closed on Escape and returned focus
  to participation. `cy.press(Enter)` did not initiate a request in Cypress
  Electron or Chrome, although Playwright Enter did. In a separate native HTML
  form, Cypress 15.8.1 Enter likewise produced key events but no click or
  submit, while Space worked. Its Chromium protocol implementation sends no
  text for named Enter. In Electron, a direct protocol Enter with carriage
  return text generated click and submit even without a key code; adding key
  codes alone did not. This isolates a tool-input difference in the tested
  environment, not a demonstrated application bug or a cross-browser result.
  Login success originally disappeared when the gate unmounted. It now remains
  in a persistent status region, verified in the real isolated login flow.
  Three targeted Jest suites passed (21 tests), as did the existing focused
  Cypress accessibility suite (7 tests); screen-reader announcement of the
  success message remains unverified.
- Earlier verification on 2026-11-24: the participant code at that point passed
  `npm run verify` in an isolated copy after that copy was formatted: lint,
  16 Jest suites (138 tests) and build passed. The focused Cypress accessibility
  spec passed 7/7 in the isolated stack, including the new Swedish fallback and
  French language check. The original worktree was not reformatted.
- Follow-up on 2026-11-24: unsupported language requests now mark the document
  as English, matching the English UI fallback, while supported languages retain
  their requested language tag. The isolated Swedish-query and Swedish
  Accept-Language cases showed `lang="en"`; French retained `lang="fr"`.
  This does not translate Swedish or fix mixed-language fallback strings and
  user-generated content in otherwise supported languages.
- PCA selected-state contrast follow-up: the selected group button and SVG
  label previously used white text on #03a9f4 (approximately 2.63:1). Both use
  #0069d9 now, giving approximately 5.22:1. Computed colors were checked in
  the isolated live graph; other SVG text and states still require review.
- Isolated invite and modal keyboard follow-up: both fields had visible labels,
  and real invalid synthetic invite/login submissions produced field-linked
  HTTP 400/401 alerts. A mocked successful invite response opened the modal;
  Tab, Shift+Tab, Escape, its ARIA references and focus return were checked
  with simulated keyboard input. No valid code was redeemed or actual login
  performed. The user reported hearing the invite error with Windows Narrator;
  the error was not visible upon later inspection. Other screen-reader and
  real success-flow checks remain.
- Footer contrast follow-up: the Privacy and TOS link color was darkened from
  #999 to #666, giving approximately 5.74:1 against white. In the rebuilt
  isolated client, a whole-page axe scan reported no violations; some SVG text
  remains incomplete and requires manual contrast review. The Cypress
  accessibility spec now includes the footer and passed all 6 tests. This is
  not a full accessibility assessment of other pages or themes.
- Follow-up verification on 2026-11-23: `npm run verify` passed in an isolated
  copy of the current participant client after formatting that copy (16 suites,
  136 tests, lint and build). A non-writing Prettier check in the original
  worktree found 10 unformatted files. The focused Cypress accessibility spec
  passed 5/5 against the isolated live stack. A separate whole-page axe scan
  found serious color-contrast violations on the Privacy and TOS footer links
  (2.84:1; required 4.5:1); see the subsequent footer contrast follow-up above.
- Voting follow-up on 2026-11-23: all six combinations of Agree, Disagree and
  Pass with Enter and Space produced the expected status and restored focus
  after mocked HTTP 200 responses. No real votes were submitted in this check.
  This does not replace a complete manual keyboard or screen-reader assessment.
- Screen-reader follow-up on 2026-11-23: the user reported hearing both a vote
  error and a statement-form error with Windows Narrator. The isolated test page
  had been prepared with mocked HTTP 503 and 409 responses, respectively.
  The errors were no longer visible when the page was inspected afterward, so
  the announcements are user-reported. Other form errors and journeys remain
  unverified.
- Follow-up on 2026-11-23: the participant client passed `npm test -- --runInBand`
  (16 suites, 129 tests) and `npm run lint`. The new PCA description, participant
  position summary, successful-vote status, and keyboard interaction tests are
  included. `npx tsc --noEmit` still reports diagnostics in existing, untouched
  files; none point to files changed in this follow-up. These results do not
  replace screen-reader or manual WCAG assessment.
- PCA text/graph comparison on 2026-11-23: the focused
  `PCAVisualization.a11y.test.tsx` suite passed (7 tests). A deterministic fixture
  verifies exact group coordinate ranges, centers and cluster-point text, and
  confirms the participant description matches the plotted marker coordinates.
  An isolated live test conversation with generated PCA data showed two groups
  and a participant marker. The displayed group counts and rounded coordinates
  matched API data; the marker matched its described cluster. At that time the
  text did not describe the shapes or axis direction.
  Keyboard disclosure was checked with simulated Enter/Space; no screen-reader
  assessment or full geometric equivalence is claimed.
- Subsequent PCA geometry update: the focused suite passed (9 tests), including
  ordered polygon vertices, line endpoints, duplicate coordinates, absent shapes,
  and axis directions. The participant build, targeted lint and formatting
  checks passed. Type-checking still reports errors in unrelated existing files.
  The attempted isolated-client Docker rebuild did not complete: Docker
  returned an internal server error and the test site timed out. A later
  Docker restart restored the isolated environment; see the live check below.
- Isolated browser component check on 2026-11-23: with six synthetic points,
  the real PCA component and hull algorithm rendered a polygon and a line.
  Their SVG coordinates matched the ordered text coordinates to within 0.001
  SVG units, and the text stated both axis directions. Simulated keyboard
  navigation reached 21 focus stops across the mounted voting, form, invite,
  login and PCA controls; computed focus outlines were present on all of them.
  Both modal buttons also showed an outline during keyboard navigation, and
  one focused voting button was visually inspected. This was not a live-flow,
  screen-reader or comprehensive focus assessment.
- Follow-up live PCA check on 2026-11-23: the isolated test conversation
  returned HTTP 200 after Docker recovery and the alpha client was rebuilt
  with the test Compose configuration. The actual polygon vertex sequence
  and line endpoints matched the rounded API coordinates in the text, and
  axis directions and the participant marker matched the graph. Simulated
  keyboard navigation checked focus outlines on 15 page stops and selected
  group A and statement 0; Submit and the statement button were inspected
  visually. No forms or votes were submitted. This does not cover other
  live views or actual screen-reader announcements.
- Follow-up voting keyboard check on 2026-11-23: simulated keyboard input in
  the isolated live conversation exposed lost focus when vote buttons became
  disabled. The participant client now restores focus to the vote button, or
  the email field after the last vote, without overriding focus moved elsewhere.
  Real test votes via Agree/Space, Disagree/Enter and Pass/Space returned HTTP
  200 and retained or transferred focus as intended. A mocked HTTP 503 showed
  an alert and restored focus. Two targeted suites passed (12 tests); lint,
  formatting and the isolated client build passed. Other key combinations,
  views and screen-reader announcements remain to be tested.
- Follow-up statement-form check on 2026-11-23: in the isolated live
  conversation, simulated keyboard input submitted two synthetic statements
  with Enter and Space (HTTP 200), displayed a status, cleared the field and
  returned focus to it. An actual duplicate produced HTTP 409 and a field-linked
  alert; a simulated HTTP 503 preserved text without marking it invalid.
  Blank/whitespace input was blocked and the English 400-character limit and
  counter were checked. This does not verify screen-reader announcements or
  other languages.
- Follow-up email-form check on 2026-11-23: simulated keyboard input in the
  isolated live conversation reached the field and button with focus outlines.
  An invalid address triggered native validation without an API request.
  A mocked HTTP 503 produced a field-linked alert, and a mocked HTTP 200
  produced a focused status message. No subscription was created; actual
  backend behavior and screen-reader announcements remain unverified.
- Isolated language smoke on 2026-11-23: French voting labels rendered in the
  live conversation. The new PCA and vote-success strings initially fell back
  to English and were translated into French; the PCA text was checked in the
  rebuilt isolated client, and vote feedback was checked with a mocked response.
  The focused PCA suite passed (10 tests), as did targeted lint and the isolated
  build. With `ui_lang=sv`, the UI fell back to English while the page retained
  `lang="sv"`, a remaining screen-reader language mismatch. Other languages
  and actual screen-reader announcements were not assessed.
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
  shows intermittent timing sensitivity.
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
- GitHub Actions: the workflow was registered on `edge` through [PR #8](https://github.com/MustafaGood/polis/pull/8),
  then manually run against `feature/eid-oidc-poc`. [Run 45116680263](https://github.com/MustafaGood/polis/actions/runs/45116680263)
  completed successfully on 2026-11-23: all 35 specs, 217 passing, 0 failing
  and 1 existing pending Alpha embed-parity TODO. The Cypress job, lint and
  server integration checks on PR #8 also passed.
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

1. The full Cypress suite passed locally and in GitHub Actions on the dedicated
   test database. The existing skipped Alpha embed-parity TODO remains; do not
   reset a shared database.
2. Record complete keyboard and NVDA/VoiceOver checks, including participant
   and admin dialogs, screen-reader announcements and PCA alternatives.
3. Address the participant TypeScript diagnostics. Triage and prioritize the
   report-client lint findings.
4. Validate BankID and Freja test flows, applicable claims, security/privacy
   decisions and the final demonstration with the supervisor.
5. Review the overlapping PR stack and obtain authorization before merging.

Additional existing TODOs include a skipped alpha integrated-embed parity test,
missing topic-agenda success/error feedback and server integration/auth test
follow-ups. They are not evidence of completed functionality.
