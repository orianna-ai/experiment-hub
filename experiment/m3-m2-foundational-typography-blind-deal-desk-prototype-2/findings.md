# m3-m2-foundational-typography-blind · deal-desk-prototype-2

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement

The prototype's typography was technically functional but read as undifferentiated UI-chrome: every visible string lived between 10–20px in 400/500/600 with 1.4 line-height and no font pairing. There was no clear H1, body copy spanned the full content width, ALL-CAPS labels were undertracked, and numbers shared the same proportional-figure glyphs as everything else.

The improvements address all five dimensions called out in the prompt:

**Scale.** Replaced the cramped 13/14/16/20 ladder with a clearer Major-Third-ish scale: page H1 28 → section H2 17 → card H3 16 → body 14.5 → secondary 13 → meta 12.5 → micro-label 11 → chip 10.5. The 20→16 step that was reading as "two regional headings the same size" is now 28→17, so the page identity (Deal Desk) clearly dominates the section identities (What changes / Try it / What the AI agent can do / Who gets it).

**Pairing.** Kept Inter for all UI text, but introduced JetBrains Mono (already loaded by the page) as a deliberate second face for tabular tokens: the "$250,000 ARR" stat and the date column in the Mutual action plan. This both (a) gives the page real font-pairing rhythm instead of monoculture Inter and (b) makes numbers feel like data rather than prose. Enabled Inter's stylistic alternates (`ss01`, `cv11`) for cleaner glyphs at larger sizes, and `tabular-nums` on all data cells.

**Leading.** Headlines used a body-copy line-height of 1.4 (20/28 on the title), which makes large type look slack. Tightened H1 to 1.15 and H2/H3 to 1.25. Conversely, the description paragraph at 13/18.2 (1.4) was too tight for sustained reading at its width — bumped to 15/1.55. Lists and the Deal risk summary got 1.55 as well so they feel scanned, not crammed.

**Measure.** The lede paragraph "Adds a Deal Desk workflow to Enterprise opportunities…" was running ~736px wide at 13px — well past the 50–75ch comfortable measure. Capped it at 62ch (roughly 480px) so the line breaks land where the eye expects.

**Weight contrast.** The page used 600 for everything that wanted emphasis and 400 for everything else — a one-step ladder. Spread it out: H1 700 (with -0.022em tracking), H2/H3 650 (a variable-weight slot between semibold and bold, with -0.014em), strong inline text 650, UI body 500, body copy 400, byline 450. The page now has a discernible "headline / heading / strong / regular" rhythm instead of just "bold or not."

**Tracking adjustments that came along for the ride.** Negative tracking on larger sizes (Inter at 20+ wants ~-0.02em to feel right), and positive tracking bumped from ~0.04em to 0.085–0.11em on the many ALL-CAPS micro-labels (AFFECTS, OPPORTUNITY, DEAL DESK PANEL, READS/WRITES/ACTS, PIPELINE/TEAM/TERRITORY/DEAL SIZE, USER/WORKSPACE/OTHER) so they read as labels rather than compressed strings.

Caveats: changes were applied as a live CSS overlay in the browser (the prompt forbids touching prototype source), so they reflow the rendered DOM but are not persisted. The overlay leaves color tokens, iconography, and chip backgrounds alone — those are out of scope for a typography pass.

## Cost
- wall time: 6m 25s
- turns: 42
- tokens (input / cache-create / cache-read / output): 71 / 102932 / 2609509 / 23161
- $ estimate: $2.5274595

## How Claude achieved it

1. **Set up an inspection channel.** The dev server was on localhost:5251 but the Playwright session was sandboxed and couldn't reach it directly. Ran `softlight start-tunnel 5251` to publish the prototype through `softlight.orianna.ai/api/tunnel/<id>/` and navigated the headless browser there.

2. **Audited the existing type system, not the source.** Ran a DOM walk via `browser_evaluate` that enumerated every visible text node and recorded `{tag, text, fontSize, fontWeight, lineHeight, letterSpacing, textTransform}`. Deduped by style key to surface the actual ladder in use: 10/11/12/13/14/15/16/18/20px with weights 400/500/600, line-heights all clustered at 1.4× the font size, and a single family (Inter — variable, with JetBrains Mono also loaded but unused for numerics). Also probed `document.fonts` to confirm Inter and JetBrains Mono were available at 400/500/600/700.

3. **Mapped semantic regions to class names.** Located each notable element by its text (Deal Desk title, "What changes" section header, "$250,000 ARR", "AFFECTS", "DEAL DESK PANEL", "READS", etc.) and read its `className` and parent chain. Got clean targets: `.page-header-title`, `.section-title`, `.agent-name`, `.record-title`, `.record-meta`, `.field-section-title`, `.deal-desk-panel-tag`, `.filter-label`, `.perm-subsection-label`, `.nav-section-title`, `.nav-item`, `.breadcrumb`, etc.

4. **Designed a deliberate type scale on paper** before writing CSS — five sections of the prompt (scale, pairing, leading, measure, weight) became five buckets of decisions with named values (`--letter-h1: -0.022em`, etc.) so the eventual stylesheet had a coherent system instead of one-off overrides.

5. **Injected a single `<style id="type-improvements">` block** via `browser_evaluate`, scoped to the existing class names. Used `!important` only because it was overriding stylesheets, not because of cascade fragility. The unlabeled lede paragraph (no class) was tagged with `.desc-paragraph` programmatically before the rules ran.

6. **Iterated once.** First pass changed `.deal-desk-panel-tag` color as a side effect of regrouping it with the other uppercase labels; reverted that to `color: inherit` so the typographic changes were not entangled with the page's color decisions. Also nudged the JetBrains-Mono $ from 12px → 12.5px to match its surrounding row.

7. **Verified visually** with full-page screenshots before and after the overlay. The H1 "Deal Desk" now dominates, section titles are clearly subordinate, the description column wraps at a comfortable measure, "$250,000 ARR" sits in mono, and uppercase labels breathe.

8. **Wrote findings.md** describing both the diagnosis (what the prior type system was doing wrong) and the prescription (the new values and their rationale per dimension).

## Prompt
```
/goal Improve the typography of this prototype (http://localhost:5251/), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Focus on scale, pairing, leading, measure, and weight contrast.
```
