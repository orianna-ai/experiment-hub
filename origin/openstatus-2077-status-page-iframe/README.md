# OpenStatus PR 2077 Status Page Iframe Fixture

Source PR: https://github.com/openstatusHQ/openstatus/pull/2077  
Source repo: https://github.com/openstatusHQ/openstatus  
PR title: feat: status-page iframe

This standalone Vite fixture clones the PR-relevant public OpenStatus status page journey for chromeless embed mode. The first load uses `?embed=&theme=light`, hides the public status page header chrome, keeps the compact non-whitelabel attribution footer, renders the title, banner, component trackers, feed, adds the embed `robots` metadata, and supports URL states for section hiding, forced light/dark embed theme, empty feed, whitelabel footer hiding, and standalone mode.

## Commands

```sh
pnpm install
pnpm build
pnpm exec vite --host 127.0.0.1 --port 5173
```

## Intentional Mocks

- Status page data, open events, component uptime, grouped trackers, whitelabel state, and empty feed state are hardcoded.
- Backend services, auth, tRPC, Next.js routing, `nuqs`, `next-themes`, and docs routing are not included.
- Optional local query controls are available with `?embed=&theme=light&controls=1`; they are hidden from the default product-like embed viewport.
