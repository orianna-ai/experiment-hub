# Unkey PR 5540 Env Vars Onboarding

Source PR: https://github.com/unkeyed/unkey/pull/5540

Source repo: `unkeyed/unkey`

PR title: `feat: add env vars step to onboarding wizard`

This standalone Vite fixture clones the Unkey project onboarding journey around the new `Configure environment variables` step. The first load starts in the onboarding wizard on that new step, showing the shared environment variables surface with the deploy action below it. The configure deployment step, deployment-complete state, add-env-var panel, select-repo hint pattern, and existing project overview Environment Variables page are reachable through normal in-app buttons and navigation.

Commands:

```sh
pnpm build
pnpm exec vite --host 127.0.0.1 --port 5177 --strictPort
```

Intentional mocks:

- Auth, workspace, GitHub installation, repository data, deployments, deployment steps, and project data are hardcoded.
- Environment variables are stored in React state instead of the Unkey collections/TRPC backend.
- Deploy and redeploy actions transition local UI state without calling external services.
- Port `5177` was used during verification because `5173` was already occupied by another local fixture.
