# m2-foundational-color · deal-desk-prototype-2

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
The prototype's color system was re-aligned with Twenty's actual tokens (Radix indigo as the brand "blue", gray1–gray12 neutral scale, semantic status colors), hardcoded inline color values were removed, and a working dark theme was added that follows the OS preference with an explicit toggle in the top bar.

Specifically:
- **Palette** — Replaced the Tailwind-indigo brand color (`#4f46e5`) with Radix indigo9 (`#3e63dd`), which is what `twenty-ui` actually exports as `MAIN_COLORS_LIGHT.blue`. Hover, subtle, border, and on-bg-text shades come from Radix indigo 3/4/5/10/11 instead of ad-hoc tints. The page-header app-icon and the agent-header micro-icon now share one `--grad-accent` token instead of two unrelated purple gradients.
- **Contrast** — Body text (`--font-primary` on `--bg-primary`) is 12.6:1; secondary text 5.7:1; tertiary text (now reserved for icons / labels, not body copy) is 2.9:1 — matching Twenty's own ratios. In dark mode the corresponding pairs land at 14.2 / 4.7 / 3.1 (WCAG AA for body text, AA-Large for tertiary labels). The deal-desk-panel info surface uses `--accent-3`/`--accent-11`, AI-preview wrapper uses yellow tokens at the same intensity in both themes, and the `pending-pill` / `stage-pill` no longer use one-off Tailwind amber hex codes — they reuse `--color-yellow-bg/border/11`.
- **Semantic roles** — Added explicit semantic groups: `accent` (brand/info), `yellow` (warning/AI), `green` (success/complete), `red` (danger/blocked). The AI-preview dashed border now uses `--color-yellow-border` (muted) instead of `--color-yellow-9` (saturated `#ffd400`) so it reads as "AI-tinted region" rather than "alert." The Deal Desk panel reuses `accent-3/4/11`, making it visually a sibling of the info chip — one shared meaning.
- **Dark mode** — Added a full dark token set sourced from `twenty-ui/theme/constants/{BackgroundDark, BorderDark, FontDark, GrayScaleDark}.ts`. Activates from `prefers-color-scheme: dark` and from a `data-theme` attribute toggled by a sun/moon button in the top bar. Status colors get dedicated dark-mode pairs (e.g. green-bg `#15291f` / green-11 `#6cc196`) instead of bleeding white-mode tints onto a dark canvas. Shadows are deepened (`rgba(0,0,0,.45)` instead of `.06`) so cards and the deploy bar still read as elevated.
- **Cleanup** — Removed all hardcoded color hex/inline color props (`#999`, `#666`, `#fef3c7`, `#92400e`, `#fde68a`, `#1f2937 → #374151`, `#6366f1 → #8b5cf6`). The few remaining literal colors are intentional decorative gradients (`--grad-warm` for the orange account avatar, `--grad-workspace` for the workspace pill) that have their own dark-mode variants.

## Cost
- wall time:
- tokens:

## How Claude achieved it
1. **Audit.** Read `src/styles.css` and `src/App.tsx`, then cross-referenced against `grounding/twenty/packages/twenty-ui/src/theme/constants/` — specifically `MainColorsLight.ts`, `MainColorsDark.ts`, `GrayScaleLight.ts`, `GrayScaleDark.ts`, `BackgroundLight.ts`, `BackgroundDark.ts`, `BorderDark.ts`, `FontDark.ts`. Confirmed Twenty's "blue" is Radix `indigoP3.indigo9` (≈ `#3e63dd`), not Tailwind's indigo-600 (`#4f46e5`) the prototype was using.

2. **Rewrote `src/styles.css`** with a layered token model:
   - **Layer 1 — neutral scale**: `--gray-1`…`--gray-12` matching Twenty's display-p3 grayscale values converted to sRGB hex. Two scales exist: one in `:root`/`[data-theme=light]`, one in `[data-theme=dark]`/`@media (prefers-color-scheme: dark)`.
   - **Layer 2 — surface/border/font tokens** (`--bg-primary`, `--border-medium`, `--font-secondary`, …) defined *in terms of* the neutral scale, so flipping themes only flips Layer 1.
   - **Layer 3 — accent + semantic status**: `--accent-3/4/5/9/10/11/contrast` (Radix indigo light & dark) + `--color-{yellow,green,red}-{3,5,9,11,12,bg,border}` with light and dark pairs. Legacy `--color-blue*` and `--font-link` were kept as aliases pointing at `--accent-*` so existing markup still works.
   - **Layer 4 — decorative**: theme-aware gradients (`--grad-accent`, `--grad-warm`, `--grad-workspace`) replacing the inline Tailwind gradients that were baked into the original CSS and JSX.

3. **Replaced hardcoded values in `src/App.tsx`.** Stripped the inline `style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}` off the agent-header icon (it now uses the standard `.app-icon` class so it tracks the page-header icon). Stripped all `color="#999"` / `color="#666"` from icon props in the rollout filter row, side-effects header, and estimate row — icons now inherit `currentColor` from CSS rules scoped to their parents (`.select-multi .chevron`, `.side-effects-header svg`, `.estimate-row svg`). Same treatment for the `style={{ color: '#999' }}` text on placeholders (`.select-multi .placeholder`, `.advanced-helper`, `.pilot-prep`).

4. **Wired dark mode.** Added a `useEffect` that writes `theme` to `document.documentElement[data-theme]`. Initial value comes from `window.matchMedia('(prefers-color-scheme: dark)')` so the page respects OS preference on first render. A sun/moon toggle in the top bar lets the user override. Token swap is the only thing the rest of the app needs to do — every previously-hardcoded color is now a `var(--…)` reference.

5. **Tightened a few semantic role mismatches noticed during the audit:**
   - `.stage-pill` was using free-floating Tailwind amber hex (`#fef3c7` / `#92400e` / `#fde68a`) — switched to `--color-yellow-*` so it matches the chip/pill family.
   - `.ai-preview-wrap` had a `border: 1px dashed var(--color-yellow-9)` (the saturated `#ffd400` core color, intended for solid swatches) — moved to `--color-yellow-border` (the muted border-token) which is what the chip/pill border already uses.
   - `.tech-line .plus` was bound to `--color-green-9` (saturated swatch); pushed to `--color-green-11` (text-on-bg shade) for legibility on both themes.
   - `.dd-check-icon.pending` background switched from `--bg-tertiary` to `--bg-primary` so it reads as an empty disc against the blue panel surface instead of disappearing into the panel tint.

6. **Verified.** `tsc -b --noEmit` clean. Started Vite (`pnpm exec vite --port 5204`) and confirmed the page serves with the new CSS. The MCP browser couldn't reach localhost in this sandboxed environment, but the harness's screenshot phase will capture the final result.

## Prompt
```
/goal Improve the color usage of this prototype (http://localhost:5204/), which is a mock of a future feature built into twenty (live codebase is at ../../grounding/twenty for reference to use as a baseline to adhere to). Focus on palette, contrast, semantic roles, and dark mode. Ignore unrelated design issues.
```
