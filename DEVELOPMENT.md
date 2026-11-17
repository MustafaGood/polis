# Development and verification

Follow the [README quick start](./README.md#quick-start) for the Docker stack,
local certificates, JWT keys and environment configuration. Never commit
credentials, private keys or local environment files. The eID sandbox callback
must exactly match a URI registered with the identity provider; see the
[eID PoC](./docs/eid-oidc-poc-alt2-3.md).

## Participant client

From `client-participation-alpha`:

```sh
npm ci
npm run lint
npm test -- --runInBand
npx prettier --check .
npx tsc --noEmit
npm run build
```

`npm run verify` runs format, lint, test and build, but its format step uses
`prettier --write .` and can modify existing files. Inspect the worktree and
obtain permission before running it where those changes are not wanted. The
non-writing formatting command above is useful for checking the worktree.

## Admin and end-to-end tests

From `client-admin`, use `npm ci`, `npm run lint`, `npm test -- --runInBand`
and `npm run build` as applicable.

For the report-client accessibility triage, run `npm ci` and then
`npm run lint:a11y` from `client-report`. This is a separate, non-writing
check and does not imply that report visualizations are fully accessible.

The Cypress suite requires a running test stack and OIDC simulator. The E2E
workflow uses `docker-compose.test.yml` and `test.env`. Use a **dedicated test
database**, never a shared or production database: tests create accounts,
conversations, comments and other data. Do not remove volumes or reset an
existing database as part of setup without explicit authorization.

From `e2e`, after installing dependencies and configuring the local trusted CA:

```sh
npm run test:a11y
```

The smoke test creates a seeded conversation via the existing simulator
helpers. To use an existing test conversation instead, set
`CYPRESS_A11Y_CONVERSATION_ID`; the conversation must already contain a
visible statement and permit the participant flow. The npm script uses POSIX
shell syntax, so on Windows use a compatible shell or set `NODE_EXTRA_CA_CERTS`
and invoke the local Cypress CLI directly.

See [TEST-REPORT.md](./TEST-REPORT.md) for results actually obtained and
remaining unverified tests.
