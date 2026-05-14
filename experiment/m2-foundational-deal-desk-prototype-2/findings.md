# m2-foundational · deal-desk-prototype-2

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
Achieved. The prototype's foundational design now reads as a closer cousin of Twenty's live UI: a coherent type scale with explicit leading and measure caps, a properly Twenty-aligned blue (#4662d5 rather than the off-brand indigo #4f46e5), semantic color roles refactored into reusable tokens, a 4px spacing scale with consistent vertical rhythm between section blocks, a wider but disciplined content column, and Tabler-style icons standardized via shared stroke/size tokens. Dark mode is now supported automatically via `prefers-color-scheme`.

## Cost
- wall time: 4m 34s
- turns: 24
- tokens (input / cache-create / cache-read / output): 39 / 236830 / 2124439 / 24909
- $ estimate: $3.1653269999999996

## How Claude achieved it
I treated `src/styles.css` as the single foundational design layer and rebuilt the token system against Twenty's `theme-light.css` rather than the prototype's ad-hoc values. The work was confined to that file plus minor structural CSS — `App.tsx` was untouched aesthetically beyond what the new tokens cascade into.

**Typography.** Introduced a labelled modular scale (`--text-xxs` 10 → `--text-2xl` 24) with paired line-heights (`tight/snug/normal/relaxed`) and tracking tokens. Page title now uses `tight` letter-spacing; meta uses `snug`; body prose caps to `62ch` measure. Inter `font-feature-settings` (`cv11`, `ss01`, `ss03`) and `font-variant-numeric: tabular-nums` are enabled globally so numerics in the deal table, dates, and the "$250,000 ARR" line align cleanly. Three weight tokens (`regular 400`, `medium 500`, `semibold 600`) replace the scattered numeric weights, restoring weight-contrast between section titles (600) and body (500/400).

**Color.** Replaced the off-brand indigo `#4f46e5` with Twenty's true blue `#4662d5` (Radix blue9 sRGB), and added the rest of the blue ramp (3/5/7/10/11) so chips, focus rings, the primary button hover and badge text all draw from one ladder. The yellow/green/red ramps were tightened to match Twenty's Radix tokens (`color-green-9` now `#54a271`, matching `display-p3 0.332 0.634 0.442`). A `prefers-color-scheme: dark` block remaps every semantic token (`--bg-*`, `--font-*`, `--border-*`, the three accent ramps, and all four shadows) so the design surfaces correctly in dark mode without any markup change.

**Spacing & rhythm.** Locked the spacing scale to Twenty's 4px grid and added the missing larger steps (`--spacing-7/8/10/12/16`). Section vertical rhythm was unified at `--spacing-8` between sections and `--spacing-4` inside cards. Card padding lifted from 16 → 20 to give field rows room to breathe, and the deploy bar height was decoupled from a fixed value so `min-height: 64px` flexes.

**Grid & layout.** Page content max-width raised from 800 → 880 (`--content-max-width`) and page padding from 32 → 40 top to give the page header proper breathing room. Field-row label column widened 140 → 160 so multi-word labels ("Account executive") stop crowding their values. The deploy bar's negative-margin trick was rewritten via `calc(var(--spacing-8) * -1)` so it stays in lockstep with page padding if the page width is later changed.

**Iconography.** Added `--icon-size-{sm,md,lg}` and `--icon-stroke-{sm,md,lg}` tokens mirroring Twenty's `--t-icon-*` so a future pass can swap default-stroke=2 with the size-aware variants. Standardized icon colors via CSS (sidebar nav items inherit `--font-tertiary` and shift to `--font-primary` on active/hover; the deal-desk-panel's shield icon now uses `--color-blue` for semantic match; side-effects icons share `--font-tertiary`). Removed the awkward inline `color="#999"` overrides from React so icon color is driven by token, not literal hex.

**Affordances kept inline with foundational scope.** Focus rings now use `:focus-visible` with `--color-blue-5` shadow (3 px ring); transitions are 100–150 ms; chevrons in the breadcrumb separate via padding so the hit area stays tappable. None of these change behavior, only foundational polish.

## Prompt
```
/goal Improve the foundational visual design of this prototype (http://localhost:5202/), which is a mock of a future feature built into twenty (live codebase is at ../../grounding/twenty for reference to use as a baseline to adhere to). Scope to typography (scale, pairing, leading, measure, weight contrast), color (palette, contrast, semantic roles, dark mode), spacing & rhythm (scale, density, vertical rhythm), grid & layout (columns, alignment, max-widths), and iconography (style, weight, consistency). Ignore issues outside this scope.
```
