# Visual Design Nit Experiments

The catalog. Each `### \`<id>\`` heading owns a `> /goal …` quote block (or a multi-paragraph block of consecutive `>` lines). `bin/exp.sh` extracts that block and substitutes the two template slots before sending the prompt to the agent.

For everything else — how runs are scaffolded, where outputs land, the UI, batching, recovery — see [README.md](./README.md).

## Reusable slots

| Slot | Value at substitution time |
|---|---|
| `<URL>` | `http://localhost:$PORT/` (PORT from the experiment's `.env`) |
| `<GROUNDINGS>` | `../../grounding/twenty` (relative to the experiment dir) |

Every prompt starts with `/goal` and is sent verbatim with the two slots substituted. Reference template (the one-off that this catalog grew out of):

> `/goal Improve the spacing/aesthetic of this prototype (<URL>), which is a mock of a future feature built into twenty (live codebase is at <GROUNDINGS> for reference to use as a baseline to adhere to).`

---

## M0 — Baseline (no skill)

### `m0-generalized`

Same surface as `m1-generalized`, no `/goal` invocation. Measures how much the `/goal` skill itself moves the result.

> Improve the visual design of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Cover the full surface of visual design nits: typography, color, spacing & rhythm, grid & layout, iconography, information hierarchy, composition & balance, responsive behavior, forms, tables & data density, empty/loading/error states, pixel polish, token consistency, and AI-slop tells.

## M1 — Generalized single-shot

### `m1-generalized`

> `/goal` Improve the visual design of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Cover the full surface of visual design nits: typography, color, spacing & rhythm, grid & layout, iconography, information hierarchy, composition & balance, responsive behavior, forms, tables & data density, empty/loading/error states, pixel polish, token consistency, and AI-slop tells.

### `m1-exhaustive`

Single-prompt detailed audit that explicitly enumerates every M2 sub-experiment's checklist. Tests whether spelling out the rubric in one shot competes with running M2 as 15 targeted passes.

> `/goal` Improve the visual design of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to).
>
> Exhaustively audit and fix every category of visual design issue. For each category, look for the specific signals listed and fix what you find before moving on.
>
> Typography — number of distinct font sizes vs an explicit type scale and the ratio between adjacent steps; intentional vs accidental font pairing; line-height (leading) consistency across body, display, and dense content; measure (line length) on body copy roughly 45–75 characters; weight contrast between heading and body weight and which weights are actually used vs available.
>
> Color — total distinct colors in use and whether they form a coherent token system rather than one-offs; WCAG AA contrast on body text (4.5:1) and AA Large on display (3:1) plus button/chip foreground vs background; semantic role usage (success/warning/danger/info) matches conventional meaning; neutrality of grays; if dark mode applies, whether tokens semantically swap rather than blindly invert.
>
> Spacing & rhythm — distinct spacing values vs an explicit 4/8/12/16-style scale; density consistency across card padding, row height, and button padding; vertical rhythm of section gaps, paragraph spacing, and label-to-input gap.
>
> Grid & layout — stated grid (typically 12-column) and whether elements actually align to it; optical vs mathematical alignment with off-by-pixel issues; sane content max-widths on wide viewports.
>
> Iconography — filled vs outlined style consistency; stroke-width consistency across the icon set; same concept rendered the same way everywhere; single icon library vs accidental mixing.
>
> Information hierarchy — F-pattern / Z-pattern scannability; one dominant focal point per surface; primary CTA clearly distinguished from secondary actions; anchor-text density and reading order.
>
> Composition & balance — asymmetry vs symmetry that reads as intentional; whitespace breathing around dense regions; visual weight on the side that matters; nothing crowding the boundaries.
>
> Responsive behavior — explicit breakpoints with no layout breakage between them; graceful content reflow with sticky behaviors preserved; minimum 44×44 touch targets on actionable elements.
>
> Forms — top-aligned vs inline label position used consistently across the form; error placement, color coding, and recovery affordance; hover/focus/disabled/loading states all distinguishable; required vs optional treatment.
>
> Tables & data density — zebra-striping or hairlines (whichever, consistent); sticky headers on long tables; sort affordances visible with current-sort state communicated; tabular-numeric on numeric columns; sensible column widths and truncation.
>
> Empty / loading / error states — each present where data is fetched; empty copy that tells the user what to do next; skeleton or spinner appropriate to the surface; error copy that is actionable with a retry affordance.
>
> Pixel polish — 1px nudges where elements should optically align even when mathematically aligned looks wrong; optical centering of icons within their container; hairlines crisp at every density; no half-pixel borders.
>
> Consistency — every value maps back to a design token (no hardcoded inline styles or magic numbers); the same component used the same way every time; one-off styles flagged and consolidated.
>
> AI-slop tells (remove these explicitly) — centered-hero with three cards beneath; gradient overuse on icons, headers, buttons; generic stock-photography vibe; excessive corner-radius (>12px on small elements); "Built by AI" badges, watermarks, or "generated"-feeling copy; lorem-ipsum-feel copy without substance; emoji icons standing in for real iconography; pastel-on-pastel color palettes; identical 3-column "feature card" rows.
>
> For each category, fix what you can without breaking other categories. Cover the full surface in a single pass — do not stop at the first round of fixes; cycle back through categories that depend on others (e.g. spacing after grid, hierarchy after typography).

## M2 — Sub-goal decomposition

Each M2 experiment scopes the agent to a single dimension. The section-level ids (`m2-foundational`, `m2-structural`, `m2-component`, `m2-quality`) bundle their bullets; the bullet ids fire one targeted pass each.

### `m2-foundational`

> `/goal` Improve the foundational visual design of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Scope to typography (scale, pairing, leading, measure, weight contrast), color (palette, contrast, semantic roles, dark mode), spacing & rhythm (scale, density, vertical rhythm), grid & layout (columns, alignment, max-widths), and iconography (style, weight, consistency). Ignore issues outside this scope.

### `m2-foundational-typography`

> `/goal` Improve the typography of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on scale, pairing, leading, measure, and weight contrast. Ignore unrelated design issues.

### `m2-foundational-color`

> `/goal` Improve the color usage of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on palette, contrast, semantic roles, and dark mode. Ignore unrelated design issues.

### `m2-foundational-spacing`

> `/goal` Improve the spacing and rhythm of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on the spacing scale, density, and vertical rhythm. Ignore unrelated design issues.

### `m2-foundational-grid`

> `/goal` Improve the grid and layout of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on columns, alignment, and max-widths. Ignore unrelated design issues.

### `m2-foundational-iconography`

> `/goal` Improve the iconography of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on style, weight, and consistency. Ignore unrelated design issues.

### `m2-structural`

> `/goal` Improve the structural design of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Scope to information hierarchy (scannability, focal points), composition & balance (asymmetry, whitespace, tension), and responsive behavior (breakpoints, reflow, touch targets). Ignore issues outside this scope.

### `m2-structural-hierarchy`

> `/goal` Improve the information hierarchy of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on scannability and focal points. Ignore unrelated design issues.

### `m2-structural-composition`

> `/goal` Improve the composition and balance of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on asymmetry, whitespace, and tension. Ignore unrelated design issues.

### `m2-structural-responsive`

> `/goal` Improve the responsive behavior of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on breakpoints, reflow, and touch targets. Ignore unrelated design issues.

### `m2-component`

> `/goal` Improve the component-level design of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Scope to forms (label position, validation, affordances), tables & data density (zebra, sticky headers, sort affordances), and empty/loading/error states. Ignore issues outside this scope.

### `m2-component-forms`

> `/goal` Improve the forms of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on label position, validation, and affordances. Ignore unrelated design issues.

### `m2-component-tables`

> `/goal` Improve the tables and data density of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on zebra striping, sticky headers, and sort affordances. Ignore unrelated design issues.

### `m2-component-states`

> `/goal` Improve the empty, loading, and error states of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Cover all three states across every data-driven view. Ignore unrelated design issues.

### `m2-quality`

> `/goal` Improve the craft quality of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Scope to pixel polish (alignment, optical centering, hairlines), token & pattern consistency, and AI-slop tells (centered-hero+3-cards, gradient overuse, generic stock vibe). Ignore issues outside this scope.

### `m2-quality-pixel`

> `/goal` Improve the pixel polish of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on alignment, optical centering, and hairlines. Ignore unrelated design issues.

### `m2-quality-consistency`

> `/goal` Improve the design-token and pattern consistency of this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on token adherence and repeated patterns. Ignore unrelated design issues.

### `m2-quality-aislop`

> `/goal` Remove AI-slop tells from this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Focus on centered-hero+3-cards, gradient overuse, and generic stock vibe. Ignore unrelated design issues.

## M3 — Codebase-blind variants

Same goal as a source experiment, but the agent only sees the rendered URL — no grounding pointer and no working-copy source. The runner detects the `m3-` prefix and switches to blind mode (see README §"Blind mode (M3)"). Used to test how much of the result comes from codebase access vs prompt alone.

### `m3-m1-generalized-blind`

> `/goal` Improve the visual design of this prototype (`<URL>`), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Cover the full surface of visual design nits: typography, color, spacing & rhythm, grid & layout, iconography, information hierarchy, composition & balance, responsive behavior, forms, tables & data density, empty/loading/error states, pixel polish, token consistency, and AI-slop tells.

### `m3-m1-exhaustive-blind`

> `/goal` Improve the visual design of this prototype (`<URL>`), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase.
>
> Exhaustively audit every category of visual design issue. For each category, look for the specific signals listed.
>
> Typography — number of distinct font sizes vs an explicit type scale and the ratio between adjacent steps; intentional vs accidental font pairing; line-height consistency across body, display, and dense content; measure on body copy roughly 45–75 characters; weight contrast between heading and body weight.
>
> Color — total distinct colors and whether they form a coherent token system; WCAG AA contrast on body text (4.5:1) and AA Large on display (3:1); semantic role usage; neutrality of grays; dark-mode swap quality if applicable.
>
> Spacing & rhythm — distinct spacing values vs an explicit 4/8/12/16-style scale; density consistency across card padding, row height, and button padding; vertical rhythm of section gaps, paragraph spacing, and label-to-input gap.
>
> Grid & layout — stated grid alignment; optical vs mathematical alignment with off-by-pixel issues; sane content max-widths on wide viewports.
>
> Iconography — filled vs outlined style consistency; stroke-width consistency; single icon library vs accidental mixing.
>
> Information hierarchy — F-pattern / Z-pattern scannability; one dominant focal point per surface; primary CTA distinction; reading order.
>
> Composition & balance — intentional asymmetry vs symmetry; whitespace breathing; visual weight; nothing crowding boundaries.
>
> Responsive behavior — breakpoints with no layout breakage; graceful reflow; minimum 44×44 touch targets.
>
> Forms — label position consistency; error placement and recovery affordance; hover/focus/disabled/loading states; required vs optional treatment.
>
> Tables & data density — zebra/hairline consistency; sticky headers on long tables; sort affordances and current-sort state; tabular-numeric on numeric columns.
>
> Empty / loading / error states — each present where data is fetched; actionable copy; appropriate skeleton vs spinner; retry affordance on error.
>
> Pixel polish — 1px nudges for optical alignment; optical centering of icons; hairlines crisp at every density.
>
> Consistency — every value should trace back to a design token; same component used the same way every time; one-off styles flagged.
>
> AI-slop tells — centered-hero with three cards; gradient overuse; generic stock-photography vibe; excessive corner-radius; "Built by AI" badges/copy; lorem-ipsum-feel copy; emoji-as-icons; pastel-on-pastel palettes; identical 3-column "feature card" rows.

### `m3-m2-foundational-typography-blind`

> `/goal` Improve the typography of this prototype (`<URL>`), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Focus on scale, pairing, leading, measure, and weight contrast.

### `m3-m2-foundational-spacing-blind`

> `/goal` Improve the spacing and rhythm of this prototype (`<URL>`), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Focus on the spacing scale, density, and vertical rhythm.

## M4 — Design-debt minimization

Reframes the eval as iterative debt reduction rather than per-dimension fixes. Two variants explore where the "system" the agent is comparing against lives.

### `m4-design-debt`

Internal-consistency framing: minimize debt by enforcing that the prototype acts as a unified system with itself.

> `/goal` Minimize the design debt in this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Define design debt as the consistency across the overall design and how it functions as a unified system. For each component, element, or grid, count its contribution to design debt as +1 for every inconsistent approach it takes (e.g. font sizes that don't align to the text hierarchy, elements that don't align to a grid, spacing or aesthetic that isn't respected). Continue working until the total design debt is 0.

### `m4-design-debt-system`

System-alignment framing: minimize debt as drift away from twenty's design system. Same goal, anchored externally instead of internally.

> `/goal` Minimize the design debt in this prototype (`<URL>`), which is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference to use as a baseline to adhere to). Define design debt by iterating over each UI element and classifying it relative to twenty's design system. If an element contains text, what kind of text is it meant to be relative to the defined design system? If it's a component, what kind of component is it referencing or using from the design system? If it's a new component just for this design, does it make sense — is it in line with the overall style, spacing, and typography of other components in the design system? For each instance of drift, add 1 to the overall design debt count. Continue until the total is 0. If you find yourself increasing drift by more than 10, stop and describe why you are failing to achieve the goal.

## M5 — AI-detection

### `m5-ai-detection-naive`

Single-image judgement. Has the prototype only.

> `/goal` Assess whether the prototype at `<URL>` looks like it was designed by an AI rather than a human designer. The prototype is a mock of a future feature built into twenty (live codebase is at `<GROUNDINGS>` for reference for what the product normally looks like). Give a binary verdict (AI / human) up front, then a ranked list of tells with locations. Do not modify the prototype source.

### `m5-ai-detection-comparison`

Forced-choice human-vs-AI design judgement. The agent picks which of two images was made by a human. **Pass** = the judge picks the prototype as human-designed (the prototype "fools" the agent). **Fail** = the judge correctly flags the prototype as AI-made.

Reference pool lives at `comparison/m5-ai-detection-comparison/references/` — sixteen 1440×900 PNGs sourced from `grounding/twenty/packages/twenty-docs/images/user-guide/` (flat app UI captures: table layout, record side panel, kanban ×3, view menu, command palette, search, emails, notes, import wizard, field settings, etc.). Renamed to `ref-NN.png` so filenames don't leak identification, and cropped to match `screenshots/after.png` (1440×900) exactly so image size can't be a tell. See that folder's `README.md` for provenance, sizing, and why marketing-style release shots were rejected.

Harness behaviour for this id (to wire into `cmd_run`):
- Resolve a human-designed reference image:
  - If `comparison/m5-ai-detection-comparison/overrides/<experiment-name>.png` exists, use it (per-prototype override).
  - Otherwise sample uniformly at random from `comparison/m5-ai-detection-comparison/references/ref-*.png`.
- Randomly assign the prototype's `screenshots/after.png` and the chosen reference to `image-A.png` / `image-B.png` inside the experiment dir.
- Record the ground truth and which reference was used in `comparison-key.json` (`{ "human_designed": "A" | "B", "reference_source": "references/ref-07.png" }`).
- Run claude in blind mode (no codebase/grounding access, like `m3-*-blind`).
- Parse the agent's `HUMAN_DESIGNED:` line and grade against the key. Stamp `pass | fail` + confidence into `findings.md`.

> `/goal` Forced-choice design judgement. Read both images at `./image-A.png` and `./image-B.png`. One was designed by a human; the other was generated by an AI agent. You do not know which is which.
>
> Pick which image was human-designed. Base your decision on craft signals only — do not search the web, do not attempt to identify either artifact (reverse-image search, matching to a known product, reading file metadata), do not infer from filenames.
>
> Craft signals to weigh:
>
> Composition coherence — intentional asymmetry and visual rhythm vs cookie-cutter symmetric grids.
>
> Typography — custom type scale and deliberate font pairing vs default ratios, single-font fallback, or accidentally-mixed weights.
>
> Color — system-anchored palette with intentional token roles vs ad-hoc saturation, pastel, or rainbow choices.
>
> Spacing — explicit scale (4 / 8 / 12 / 16 …) vs magic numbers and inconsistent rhythm.
>
> Content density and copy — real-feeling, edge-case-aware copy vs lorem-ipsum, boilerplate filler, or copy that "sounds AI-written".
>
> Iconography — consistent stroke and style from a real library vs mixed inline glyphs, emoji-as-icons, or freehand SVGs.
>
> Layout craft — 1px nudges, optical centering, accumulated micro-decisions a human would notice but an agent rarely produces.
>
> AI-design tells — centered-hero + three-card row, gradient overuse, generic stock-photography vibe, excessive corner-radius, "Built by AI" / "Generated" badges, emoji-as-icons, pastel-on-pastel palettes, identical feature-card grids, vibrant gradients on every accent surface.
>
> Output exactly this block at the end of your response, with no preamble inside the fence:
>
> ```
> HUMAN_DESIGNED: A | B
> CONFIDENCE: <0-100>%
> DECISIVE_TELLS:
>   1. <tell> — observed in <A | B> at <region/component>
>   2. <tell> — observed in <A | B> at <region/component>
>   3. <tell> — observed in <A | B> at <region/component>
> ```
>
> Forced choice: you must pick A or B even if you are uncertain — pick whichever you'd assign higher probability to. Do not modify the images.

---

## Reach goal

Run every experiment above against every prototype in `origin/`.

## Suggested run order

1. `m1-generalized` across all origins (baseline).
2. M2 section-level: `m2-foundational`, `m2-structural`, `m2-component`, `m2-quality`.
3. M2 bullet-level: the other 14 ids.
4. Score, pick 3–5 winners.
5. `m3-*-blind` on winners.
6. `m4-design-debt` and `m4-design-debt-system` for comparison framings.
7. `m5-ai-detection-*` last — they depend on `after.png` from prior runs (independent of the rest, can fire whenever a run has output).
