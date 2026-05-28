# Langfuse PR 13098 Bedrock API Key Fixture

Source PR: https://github.com/langfuse/langfuse/pull/13098

Source repo: https://github.com/langfuse/langfuse

PR title: feat(web): add support for AWS Bedrock API Keys (Bearer Tokens)

This standalone Vite fixture clones the Project Settings -> LLM Connections
surface for the Bedrock credential flow. It opens directly to the create LLM
connection dialog with the new Bedrock authentication method tabs visible; the
create form matches PR HEAD by selecting AWS access keys first, with the
Bedrock API key field reachable through the adjacent API key tab. The
underlying settings page includes the LLM connection list/table, a configured
Bedrock API-key row, update dialog, delete confirmation, custom model controls,
and validation states.

Commands:

```sh
pnpm build
pnpm preview --host 0.0.0.0
```

Intentional mocks:

- Backend, auth, RBAC, tRPC, encryption, and model testing are mocked in local
  React state.
- The project/organization shell is static and focused on the PR-relevant
  Project Settings -> LLM Connections journey.
- Form submission updates the in-memory table instead of calling Langfuse APIs.
