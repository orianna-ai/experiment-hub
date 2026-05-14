# m2-structural-responsive · deal-desk-prototype-2

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
Added responsive behavior matching Twenty's `MOBILE_VIEWPORT = 768px` convention (with a tablet step at 1024px). The fixed 236px sidebar now collapses to a 56px icon rail under 1024px and disappears entirely under 768px so the 800px content column gets the full viewport. Sub-768px the page reflows to single column: the 2-up summary grid stacks, the 4-up rollout filters stack full-width, `field-row` flips its `140px 1fr` grid to a stacked label/value, `preview-bar` and `record-meta` wrap, and the side-effects rows reflow with "View payload" dropping under the text. The sticky deploy bar wraps with a full-width primary CTA and its negative margin is rewritten to match the smaller mobile gutter. Touch targets are enlarged on mobile and on coarse pointers: switches grow from 28×16 → 36×22, perm pills hit 40px min height, buttons go to 40px, and nav items get 10px vertical padding. `.select-280` got `max-width: 100%` so it never blows out narrow viewports.

## Cost
- wall time: 3m 40s
- turns: 32
- tokens (input / cache-create / cache-read / output): 42 / 150058 / 2344236 / 11196
- $ estimate: $2.3900905000000003

## How Claude achieved it
1. Inspected the prototype (`src/App.tsx`, `src/styles.css`) and identified the non-responsive structures: 236px fixed sidebar, 800px content column, 2-col `summary-grid`, 4-up `filter-row` with 180px min-width, `field-row` with a fixed 140px label column, `select-280` width:280px, and a `deploy-bar` with `margin: 0 -32px -96px` tied to desktop padding.
2. Grepped `grounding/twenty` for prior art and found `packages/twenty-ui/src/theme-constants/constants.ts` exporting `MOBILE_VIEWPORT = 768`, used across `twenty-front` via `@media (max-width: ${MOBILE_VIEWPORT}px)`. Adopted that breakpoint and added a tablet step at 1024px.
3. Tweaked one existing rule (`.select-280` → `max-width: 100%`) and appended three media blocks to `styles.css`:
   - `@media (max-width: 1024px)`: sidebar shrinks to a 56px icon rail (labels, section titles, modifier tags hidden); content padding tightens.
   - `@media (max-width: 768px)`: sidebar hidden, app shell allows vertical scroll, page-body radius/border dropped, page-body-inner padding drops to 16/12, page header wraps, `summary-grid` and `filter-row` stack, `field-row` becomes single-column, `record-meta` / `deal-desk-check` / `side-effect-row` wrap, sticky deploy bar wraps with full-width CTA and corrected negative margins, popover capped at `min(260px, 100vw - 32px)`. Touch targets enlarged (switch 36×22, perm-pill 40px min-height, buttons 40px, selects 40px).
   - `@media (hover: none) and (pointer: coarse)`: enlarges nav-item padding, link hit areas, and switches on touch devices regardless of viewport.
4. Tried to verify in headless Chromium but Vite is bound to IPv6 `localhost` only, which the playwright sandbox can't reach; relied on hot-reload + the harness's before/after screenshots.

## Prompt
```
/goal Improve the responsive behavior of this prototype (http://localhost:5211/), which is a mock of a future feature built into twenty (live codebase is at ../../grounding/twenty for reference to use as a baseline to adhere to). Focus on breakpoints, reflow, and touch targets. Ignore unrelated design issues.
```
