# m2-foundational-iconography · deal-desk-prototype-1

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
Aligned the prototype's icon system with Twenty's actual icon library (Tabler v3, used via `@tabler/icons-react` in `twenty-ui`). Three foundational fixes:

1. **Weight.** Default stroke raised from `1.75` → `2`, matching Tabler's default and Twenty's `theme.icon.stroke.md` (`packages/twenty-ui/src/theme/constants/Icon.ts`). Icons now read with the same weight as they would inside Twenty itself.
2. **Style.** Replaced ad-hoc / simplified glyphs (a settings "circle" with no gear teeth, a "robot" that was just a rect with a stick, sparkles that were 8 cardinal dashes, a "key" missing its bit, etc.) with the canonical Tabler v3 paths. Also switched from a mix of `<rect>`/`<circle>`/`<ellipse>`/`<line>`/`<polyline>` primitives to all-`<path>` rendering so every glyph picks up `strokeLinecap="round"` / `strokeLinejoin="round"` consistently — no more half-square corners on info/warning/x.
3. **Consistency.** Standardized sizes to Twenty's scale: `md = 16` for body/nav and `sm = 14` for icons embedded in tags, tabs, and small inline contexts. Killed the stray `12px` icons (`lock`, `bellOff`, `sparkles`, `x`) which were noticeably smaller than their neighbors. Also de-duplicated `apps` and `build` — both were the same 4-rounded-squares glyph; `build` is now `IconCode`, so the left-nav "Build" entry and the "Technical diff" tab are visually distinct from "Apps".

## Cost
- wall time: 5m 3s
- turns: 35
- tokens (input / cache-create / cache-read / output): 50 / 70505 / 2309937 / 21934
- $ estimate: $2.14422475

## How Claude achieved it
1. Inspected `cp_of_deal-desk-prototype-1/src/App.tsx` and identified the inline `Icon` helper plus the `I` glyph map (~20 icons). Noted default stroke `1.75`, a soup of size overrides (`12`, `14`, `16`), `apps` and `build` rendering the same shape, and several glyphs that were stand-ins rather than the real Tabler shapes.
2. Cross-referenced `grounding/twenty/packages/twenty-ui`:
   - `package.json` → `"@tabler/icons-react": "^3.31.0"` (icon source of truth)
   - `src/theme/constants/Icon.ts` → `stroke: { sm: 1.6, md: 2, lg: 2.5 }` and `size: { sm: 14, md: 16, lg: 20, xl: 24 }`
   - `src/display/icon/components/IconAddressBook.tsx` (and siblings) → confirmed Twenty defaults `stroke = theme.icon.stroke.md` (=2) and renders Tabler raw SVGs.
3. Rewrote the `I` map in `App.tsx` only: bumped the `Icon` default `stroke` to `2`, replaced each glyph's path data with the canonical Tabler v3 path(s) (all-`<path>`, so the rounded line join/cap apply uniformly), normalized every size override to `14` (sm) — removing every `12px` icon — and swapped the `build` glyph to `IconCode` so it no longer collides with `apps`.
4. Did not touch `App.css` (no semantic CSS hooks needed) or any non-icon markup. Type-checked with `tsc --noEmit`; clean.

## Prompt
```
/goal Improve the iconography of this prototype (http://localhost:5227/), which is a mock of a future feature built into twenty (live codebase is at ../../grounding/twenty for reference to use as a baseline to adhere to). Focus on style, weight, and consistency. Ignore unrelated design issues.
```
