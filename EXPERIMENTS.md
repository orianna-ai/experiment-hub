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

Iterative builder loop driven by `/goal`. The agent has a working copy of the prototype on a live dev server, plus a static human-designed CRM reference image. Each turn it edits the prototype source, re-snaps the prototype's rendering to `image-B.png`, and compares against `image-A.png`. The loop continues until the agent's craft audit finds no AI-mock tells in `image-B` that aren't also present in `image-A`, or the turn budget is exhausted. Whether the iterated prototype actually fools a fresh judge is graded **separately** (see `m5-ai-detection-judge` below).

Reference pool lives at `comparison/m5-ai-detection-comparison/references/` — five 1440×900 PNGs of flat full-screen human-designed CRM surfaces: companies table (×2 — clean + with record side-panel open), opportunities kanban, record with email inbox tab, record with activity timeline tab. Four come from `grounding/twenty/packages/twenty-docs/images/user-guide/`; one comes from a twentyhq/twenty PR screenshot. See that folder's `README.md` for provenance and selection rationale.

Harness behaviour for this id (to wire into `cmd_run`):
- Standard `cmd_new` scaffolding: `cp_of_<origin>/`, `.env` with allocated `PORT`, the prompt substituted into `prompt.md`.
- `image-A.png` ← uniformly-random sample from `comparison/m5-ai-detection-comparison/references/ref-*.png` (or `comparison/m5-ai-detection-comparison/overrides/<experiment-name>.png` if present).
- `image-B.png` ← initial snapshot of the dev server (the agent's pre-edit baseline).
- `refresh.sh` written into the experiment dir — one-line wrapper that screencaps the dev server into `image-B.png`. The agent calls this between edit rounds.
- `comparison-key.json` records `reference_source` for traceability.
- Run claude **non-blind** — the agent edits `cp_of_*/` and can read `grounding/twenty/`. The `/goal` evaluator (Haiku) reads the transcript after each turn and re-prompts until completion criteria hold.
- After the loop, the post-iteration `image-B.png` is the artifact for `m5-ai-detection-judge`.

> `/goal` Iterate the prototype rendered at `<URL>` until `./image-B.png` (a fresh screenshot of the prototype) is craft-equivalent to the human-designed CRM reference at `./image-A.png` — i.e. a blind judge could no longer reliably identify `image-B` as the AI-built one. Edit the working copy at `./cp_of_*/src/` (the dev server hot-reloads). Re-snap `image-B.png` between edit rounds by running `./refresh.sh`. Read `<GROUNDINGS>` for the design-system the reference is anchored in. Stop after at most 8 turns regardless.
>
> Loop discipline:
>
> 1. Read `./image-A.png` and `./image-B.png`. Enumerate concrete AI-mock tells visible in B that are not present in A. Pin each tell to a region or component. Rank by visual weight. Use your own design judgement on what counts as a tell — don't ask for a checklist.
> 2. Edit `./cp_of_*/src/` to remove the top-ranked tells. Prefer touching tokens (spacing, color, radius) before one-off hacks. Read `<GROUNDINGS>` source when you need a real value to anchor to.
> 3. Run `./refresh.sh` to re-snap `./image-B.png`. Read the new image.
> 4. Re-rank. If a tell survived, change tactics rather than re-trying the same fix.
> 5. Loop. Each turn should produce a visible diff in `./image-B.png` from the previous turn.
>
> Completion criteria (the evaluator checks these from the transcript):
>
> - You have run `./refresh.sh` at least three times across the loop.
> - Your final turn emits the fenced report (format below) exactly once, with no preamble inside the fence.
> - The report honestly distinguishes tells you eliminated from tells that survived — fabricated wins fail the evaluator.
> - The final assessment is grounded in the latest post-refresh `image-B.png`, not in your edits. If you claim a tell is gone, you must have just re-read `image-B.png` to verify.
> - No edits to `./image-A.png`. No edits outside `./cp_of_*/`.
>
> Output, exactly once at the end of your final turn:
>
> ```
> ELIMINATED_TELLS:
>   1. <tell> — was at <region/component>; fixed by <one-line>
>   2. …
> SURVIVING_TELLS:
>   1. <tell still visible in image-B> — at <region/component>; why it survived: <one-line>
>   …
> REFRESH_COUNT: <integer ≥ 3>
> FINAL_ASSESSMENT: <3–5 sentences comparing the latest image-B against image-A>
> ```

### `m5-ai-detection-judge`

Fresh-eyes forced-choice grader for `m5-ai-detection-comparison`. Run **after** the builder loop completes. The agent has no context, sees only the two images, picks which is human-designed. **Pass** (for the *upstream* builder run) = the judge picks the iterated `image-B` as human (the prototype "fooled" the judge). **Fail** = the judge correctly flags `image-B` as the AI-built one.

Harness behaviour:
- Reads `image-A.png` + `image-B.png` from the upstream `m5-ai-detection-comparison-*` experiment dir, plus its `comparison-key.json`.
- Randomly re-assigns the two images to fresh `judge-image-A.png` / `judge-image-B.png` (independent coin flip from the builder phase, so the judge can't infer from naming).
- Runs claude in **blind mode** (no codebase, no grounding) with `--no-session-persistence` and a fresh transcript so prior context can't leak.
- Parses the `HUMAN_DESIGNED:` line and grades against the re-assignment key.

> `/goal` Decide which of `./judge-image-A.png` and `./judge-image-B.png` is a screenshot of a production CRM application designed by a human team, and which is a screenshot of a feature mock built by an AI coding agent against a vite dev server. Both images are 1440×900 CRM surfaces — grade on within-CRM craft, not on marketing-page tells.
>
> Stop after at most 4 turns. Each turn the evaluator will re-prompt you with what's missing.
>
> Completion criteria:
>
> - You have used the Read tool on each of `judge-image-A.png` and `judge-image-B.png` at least twice — once to form an initial verdict and once to look for evidence that would flip it.
> - You emit the fenced block (format below) exactly once at the end of your final turn, with no preamble inside the fence.
> - `HUMAN_DESIGNED` is `A` or `B`. `CONFIDENCE` is an integer 0–100. Exactly 3 entries under `DECISIVE_TELLS`.
> - Each tell names a concrete observable property, pins it to image A or B, and to a specific visible region or component.
> - At least one tell resolves evidence you initially read as ambiguous or as pushing the opposite verdict — your reasoning should make this re-weighting visible.
> - No tell relies on identification ("looks like Salesforce", "this is twenty"), filenames, metadata, or URLs. Recognition is not evidence.
>
> If a third grounded tell isn't there, lower `CONFIDENCE` rather than fabricate. A forced choice with low confidence is fine; refusing to pick is not.
>
> Production-app hallmarks — restrained palette with intentional accents; 4/8 spacing snapping; one icon set; tabular-numeric alignment; lived-in seed data (varied names, realistic pipeline stages); sidebar grouped by user concept; 1px nudges visible at 100% zoom.
>
> AI-mock tells — decorative gradients on surfaces; corner radii >12px on small elements; emoji-as-icons; generic placeholder data ("Acme / John Doe / lorem"); AI-flavor copy ("Maximize your potential"); three identical stat-cards above a table; default-feeling form controls next to custom ones; gaps that don't snap to a scale.
>
> Output, exactly once at the end of your final turn:
>
> ```
> HUMAN_DESIGNED: A | B
> CONFIDENCE: <0-100>
> DECISIVE_TELLS:
>   1. <observed property> — image <A | B>, at <region/component>
>   2. <observed property> — image <A | B>, at <region/component>
>   3. <observed property> — image <A | B>, at <region/component>
> ```

---

## M6 — goal with examples from real designers

### `m6-my-prompt`

Simple goal prompt with 3-4 images of good design work to help anchor

> `/goal` Your task is to take the core surfaces in this application (`<URL>`) and make it look like a world class designer worked on it.
> WHEN YOU ARE DONE: You will look at the key surfaces of the app via browser tools, and compare it to "good design" examples. You are not done until you can hold up the designs side by side with human design and you can't tell which was made by AI vs. which was made by humans. After checking, you will identify the gaps in the design of it across the key surfaces and user journeys. You will make changes to the code to close those gaps. Repeat. You are only done when you feel like the screenshots of the app look like a real human professional designer made it, by comparing to the examples of good design. Be ruthless when you decide if it looks like a human desginer made it: if any doubt remains, no matter how small, YOU ARE NOT DONE!!! Repeat the process again. 
> All of this code was written by AI, and not touched by a professional designer. We want to show what the app would look like if a real designer spent time thinking about how it should be styled. You MUST look through all the surfaces. The core things that generally lead to a better design: 
> (1) Prioritization: Ruthlessly focus the user on the core information. Remove the rest or use progressive disclosure to show the rest of the information.
> (2) Progressive disclosure: Ensure that the the right information hierarchy is present and put info behind "clicks" where necessary.
> (3) Whitespace & focus: Don't overcrowd any area of the design.
> (4) Less is more: remove random icons and UI elements that add nothing.
> (5) Emphasis hierarchy: Ensure the use of different font weights and colors is used sparingly to lead to a really clear, clean design where a user knows where to focus.
> Here are the examples of good design: https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/a2045beb-c7cd-4962-9d27-c9801775bda6.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/94edf0a9-511f-48cc-af9d-6522a821be86.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/9628af2b-a58f-49d8-8cc6-e148ed4890a0.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/cb5d6067-78b0-43a0-8788-c366e33dd869.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/e8679bd4-9e56-499b-9f34-edd66afa469c.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/be85f5c8-85d0-460c-a141-d9ffed3bd102.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/73e72d66-4197-4402-ad35-e175e1ac1794.png

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
