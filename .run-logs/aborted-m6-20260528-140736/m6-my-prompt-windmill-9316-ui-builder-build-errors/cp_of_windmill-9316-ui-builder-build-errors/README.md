# Windmill PR 9316 UI Builder Build Errors Fixture

Source PR: https://github.com/windmill-labs/windmill/pull/9316

This standalone Vite fixture clones the raw app UI Builder/editor journey changed by PR 9316. The first load shows the Windmill raw app editor shell with the UI Builder source iframe on the left, the Preview iframe on the right, a red `Build failed` alert over the preview pane, build logs, and the Preview tab tinted red.

Secondary PR states are reachable through the editor controls:

- The Preview split button collapses the preview into the tab set, where the red Preview tab remains the visible error indicator.
- The `failed` build-state control replays a successful build and clears the banner/tint, then toggles back to failure.
- The Logs header collapses/expands the build output overlay.

Run commands:

```bash
pnpm build
pnpm preview --host 0.0.0.0
```

Intentional mocks: authentication, workspace data, raw app files, background jobs, datatable responses, and build messages are hardcoded to match the PR-relevant visible states without backend services. The fixture serves Windmill's PR UI Builder artifact version `00c9834` and Windmill's `Inter-Variable.woff2` font from `public/`.
