# Coolify PR 10362 Vite Fixture

PR: https://github.com/coollabsio/coolify/pull/10362

Source repo: `coollabsio/coolify`

Title: `fix(github): improve GitHub App setup and installation flow`

This standalone Vite fixture clones the Coolify GitHub App source setup journey affected by the PR. It starts on the unconfigured GitHub App source page, then supports:

- creating/configuring a GitHub App source from the Sources page;
- automated manifest registration with the PR's generated one-time setup state in the GitHub form action;
- authenticated manifest callback success, missing-code, expired-state, already-configured, and signed-out states;
- repository installation and re-installation through the GitHub App install flow;
- verified install callback success plus mismatched-installation and signed-out error states;
- the configured source change view with credentials, permissions, repository update action, and resources table.

Run commands:

```bash
pnpm build
pnpm preview --host 0.0.0.0
```

Intentional mocks:

- GitHub pages are simulated in React and do not call GitHub.
- Coolify auth, teams, callback cache, GitHub API verification, secrets, private keys, and resources are hardcoded.
- The callback routes are route-like client states that preserve the PR-relevant status and error surfaces without requiring a Laravel backend.
