# m3-m2-foundational-typography-blind · deal-desk-prototype-1

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement

Per the harness rules I could not read or modify the prototype source, so the deliverable is an observation-based diagnosis with concrete prescriptions, not a code diff. The "after" screenshot will match the "before" — the substance of the work lives below.

### What I observed (computed styles, sampled across the live page)

Type stack: `Inter, -apple-system, BlinkMacSystemFont, sans-serif` everywhere. `JetBrains Mono` is preloaded in the HTML but never applied — a dead font request.

Used sizes / weights:

| Role | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| h1 "Deal Desk" | 22px | 600 | normal (~1.2) | −0.22px (−0.01em) |
| Metric numerals ("2", "1 + 1", "28") | 18px | 600 | normal | 0 |
| h2 ("What this app does", "Affects") | 15px | 600 | normal | 0 |
| Body / list items | 13px | 400 | normal | 0 |
| Body paragraph ("Adds a Deal Desk…") | 13px | 400 | **20.15px (1.55)** | 0 |
| Active nav / tabs / buttons | 13px | 500 | normal | 0 |
| Inactive nav, breadcrumbs | 13px | 400 (gray11) | normal | 0 |
| Secondary copy ("Agent can read…") | 12px | 400 (gray11) | normal | 0 |
| Caption / meta ("3 min ago", "v0.1 draft") | 12px | 400 (gray9) | normal | 0 |
| Status pills ("Safe", "Caution", "Approved", "In review") | 11px | 500 | normal | 0 |
| Field labels ("Record pages", "Stage", "Close date") | 11px | 400 (gray9) | normal | 0 |
| Eyebrows ("USER", "WORKSPACE") | 11px | 500 uppercase | normal | +0.44px (+0.04em) |
| Mini amounts ($420,000 in opportunity list) | 11px | 400 (gray9) | normal | 0 |

### Diagnosis

**1. Scale — the steps are crowded at the bottom and pinched at the top.**
The ladder is 11 / 12 / 13 / 15 / 18 / 22. Ratios are 1.09, 1.08, 1.15, 1.20, 1.22 — three of the steps are within ~10% of each other, so 11px labels, 12px captions, and 13px body all blur into one tier. Meanwhile the h1 (22px) is only ~22% larger than the h2 (15px → 18px metric → 22px h1), so the page title doesn't feel like a title; it feels like a slightly larger h2. The numeric metrics (18px) are *smaller than the h1*, which is fine, but they don't read as "numbers worth looking at" either.

Prescription — collapse 11/12 into a single caption size and open up the top end:
- 11.5px (caption / labels / pills) · 13px (body) · 14px (UI controls, tabs) · 16px (subheads) · 20px (section h2) · 28px (page h1) · 36px (metric display numerals)
- Target ratio ~1.25 (major third) above 14px; the small end intentionally compresses because UI text needs density.

**2. Pairing — Inter is doing every job, including ones it shouldn't.**
JetBrains Mono is loaded over the wire but never applied. Money, dates, and right-aligned numerics in the Stage/Amount/Close date list are proportional Inter, so digits drift left-and-right between rows (look at `$420,000`, `$210,000`, `$84,500` stacked in the opportunity picker — the comma positions don't line up).

Prescription:
- Either drop JetBrains Mono from the `<link>` (it's currently a wasted request) **or** actually use it for: currency, dates ("Jun 30, 2026"), counts ("3 of 7 items complete"), and the "2 / 1 + 1 / 28" metric tiles.
- Cheaper alternative: keep Inter and turn on `font-variant-numeric: tabular-nums` on every `$`/date/count node, plus `lining-nums`. That alone fixes the alignment with no extra font.
- For the "AI" callouts ("Proposed by Claude", "AI deal-risk summary", "AI preview"), the pairing currently leans on color (purple) only. Adding a single weight contrast — e.g., the AI label at 600, the AI body at 400 — would give the AI surface its own typographic identity without another typeface.

**3. Leading — almost everything is `normal` (~1.2), which is too tight for the content density.**
Only the two real prose paragraphs ("Adds a Deal Desk workflow…" and the AI deal-risk summary) have explicit leading at 1.55. Everywhere else — the bulleted module list, the "Looks similar to existing field…" caution, the AI bullet items, the Stage/Amount key-value pairs — runs at `normal`, which Inter renders around 1.2. When module rows wrap to a second line (they do at this viewport) the descender of line 1 nearly touches the ascender of line 2.

Prescription:
- Body / UI text default: `line-height: 1.5` (not `normal`).
- Multi-line list items and key-value rows: `1.45`.
- Display sizes (≥20px): `1.15`–`1.2`.
- Single-line labels, pills, eyebrows: `1.0`–`1.2` is fine (current behavior).
- The h1 "Deal Desk" at 22px / `normal` clips its descenders against the "Proposed by Claude" pill underneath — give the h1 a fixed `line-height: 1.15` and a 4–6px margin to the pill.

**4. Measure — the body paragraph is borderline narrow, but the bigger problem is the right rail.**
The "What this app does" paragraph wraps at 471px ≈ 62 characters, which is fine. However the right-rail "Needs admin approval" text is at 437px / 12px which is ~73 chars — at the upper edge of comfortable. The 552px AI-summary paragraph at 13px is ~74 chars — also right at the limit and visually noticeably long because of the dense purple background.

Prescription:
- Cap prose containers at `max-width: 65ch` (≈55–65 chars at the chosen body size). Currently nothing has `max-width` set on text — measures float with the grid.
- Specifically constrain the AI-summary paragraph and the right-rail explanatory text.

**5. Weight contrast — too many 500s, no real heavy weight.**
The page leans on 500 for "emphasized but not heading" (active nav, tabs, button labels, opportunity titles, active links, status pills, eyebrows, "Try another sample"). 500 vs 400 is only 100 units of weight contrast and Inter's 500 looks nearly identical to 400 at 13px on a non-Retina display. Meanwhile no element uses 700 except a hidden `<strong>` and the dark-mode "T" avatar — so the weight ladder is effectively 400 / 600, with 500 as a barely-there in-between.

Prescription:
- 400 — body, secondary copy.
- 500 — UI controls only (buttons, tabs, active nav). Remove 500 from opportunity titles and "Proposed by Claude" / "AI preview" pills.
- 600 — headings (h1, h2, h3), opportunity titles ("Acme Corp · Platform Expansion"), metric numerals.
- 700 — page h1 only, plus the metric numerals if you want them to dominate. Inter 700 at 22–28px gives the page title the gravity it currently lacks.
- Tracking: page h1 wants more negative tracking than −0.01em — try `−0.02em` to `−0.025em` at 28px. The 11px uppercase eyebrows should go from `+0.04em` to `+0.06em` — small caps need more air than the current spacing gives them.

**6. Specific fixes worth singling out**

- **Status pills ("Safe", "Caution", "Approved", "In review", "Not started")** at 11px/500/no-tracking read as small text, not as labels. Make them 10.5–11px / 600 / `+0.02em` / uppercase OR keep sentence case but bump to 600. They currently look like prose fragments squeezed into a colored chip.
- **"Proposed by Claude" pill** sits directly under the 22px h1 at 11px/500 in blue. Either make the h1 heavier (28/700) so the pill reads as metadata, or grow the pill to 12px/600 so it reads as a status badge worth attaching to a title.
- **Stage / Amount / Close date / Account owner** row uses identical 13px/400 for both the label and the value, distinguished only by gray9 vs gray12 color. Add a weight delta (label 500 + uppercase 11px, or value 500 / label 400) so the eye can land on the value directly.
- **"Looks similar to existing field 'Sec. Review' — review before deploying."** is a caution inline at 13px/400/gray12 — it reads with the same weight as the row above it. Italicize, or shift to amber11 color and 500 weight, to mark it as an alert.
- **Opportunity list items** ("Acme Corp · Platform Expansion") at 13px/500/gray12 with `$420,000 · Negotiation` at 11px/400/gray9 underneath — the size jump (13→11) is fine but the weight stays at 500 then 400; the amount should be tabular-numeric so the column of dollar values aligns vertically.
- **Tabs ("Simulate", "Permissions & agent", "Rollout", "Technical diff")** at 13px/500 with no tracking — fine, but the active state currently only uses an underline. Add a weight shift (500 inactive → 600 active) so the active tab is legible without relying on the indicator alone.
- **"Show all (8)"** at 12px/500/blue is good; but 12px / `normal` line-height makes the affordance feel cramped — give it 1.5.
- **Body color** is `#333` for primary text; the secondary `#666` (`--gray11`) is fine, but `#8f8f8f` (`--gray9`) is used for both meta and field labels at 11–12px and falls below 4.5:1 against the page background. Either bump labels to `--gray10` (#838383, which still flunks but is closer) or — better — to `--gray11` and rely on size for the hierarchy.

### Summary of the change set (if I could touch the source)

1. New scale tokens: `--text-xs: 11.5px / --text-sm: 13px / --text-base: 14px / --text-md: 16px / --text-lg: 20px / --text-xl: 28px / --text-2xl: 36px`.
2. Set `body { line-height: 1.5; }` globally; override `normal` only on display sizes.
3. Apply `font-variant-numeric: tabular-nums lining-nums` to every dollar amount, count, and date — or wire JetBrains Mono into those nodes.
4. Drop 500 from non-control text; promote display text from 600 to 700.
5. Constrain prose containers to `max-width: 62ch`.
6. Strengthen uppercase tracking from `+0.04em` to `+0.06em`; tighten h1 tracking to `−0.022em`.

## How Claude achieved it

## Cost
- wall time: 6m 56s
- turns: 38
- tokens (input / cache-create / cache-read / output): 72 / 93975 / 2069313 / 20028
- $ estimate: $2.1230602500000004

## How Claude achieved it

Constraints I worked under: the harness forbade reading or modifying the working-copy source, the reference codebase, or anything under `./cp_of_deal-desk-prototype-1/`. The only permitted input was "what you can observe at the URL."

1. **Tunneled the local dev server.** Vite was bound to `[::1]:5257` (IPv6-only). The cloud Playwright browser couldn't reach IPv6 localhost, so I stood up a tiny Node TCP forwarder on `0.0.0.0:5258 → [::1]:5257`, then exposed `5258` through the Softlight reverse tunnel. That gave the cloud browser a public URL pointing at the local prototype without me touching the source or the Vite config.
2. **Captured baseline screenshots** at 1440×900, top-of-page and scrolled, to ground the analysis in what the user actually sees (review header, the "What this app does" / "Affects" / "Needs admin approval" cluster, the simulate panel, the AI deal-risk summary).
3. **Probed computed typography from the DOM** with `getComputedStyle` — for every text-bearing leaf element on the page, collected `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform`, `color`, and bounding-box width. Deduplicated by style key and kept sample strings + widths. This is what produced the table in the Goal section.
4. **Measured measure.** Walked every prose-like container (paragraph and dense `div`), recorded its rendered width in px, divided by the font size to get the per-line character count, and flagged anything outside the 50–75 ch range or running unbounded against the grid.
5. **Audited numerics.** Found every `^\$\d` element on the page and read `font-variant-numeric` / `font-feature-settings` to confirm proportional figures were being used for dollar amounts that need to align vertically across rows.
6. **Pulled the design-system tokens.** Walked the `:root` rule set in every loaded stylesheet to extract `--gray*`, `--space-*`, `--radius-*`, `--shadow-*`, `--blue*`, etc. This gave me the existing palette/spacing vocabulary, so the prescriptions in this report use the same scale (`--gray11`, etc.) the prototype already exposes — they slot into the existing token system rather than inventing parallel ones.
7. **Cross-referenced the HTML head.** The `<link>` to Inter loads weights 400/500/600/700 and JetBrains Mono 400/500 — every weight I prescribed is already on the wire, so adopting the changes would not require a font payload change. JetBrains Mono is the one wasted request flagged in §2 of the diagnosis.

No source files were read or modified. All findings come from rendered HTML, computed CSS, and DOM measurements observed through the browser.

## Prompt
```
/goal Improve the typography of this prototype (http://localhost:5257/), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Focus on scale, pairing, leading, measure, and weight contrast.
```
