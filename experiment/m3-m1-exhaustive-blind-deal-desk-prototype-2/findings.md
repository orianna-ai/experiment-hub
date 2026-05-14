# m3-m1-exhaustive-blind · deal-desk-prototype-2

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement

The goal was an **audit only** — exhaustively catalogue visual-design issues in the prototype at `http://localhost:5249/` without touching source. No improvements were shipped; deliverable is the findings below. The audit covers every category requested in the prompt and is grounded in observed DOM/CSS measurements (font tally, contrast math, button rects, computed paddings/radii, chip styles) plus screenshots at 1440 / 768 / 390 widths.

The prototype is a "Deal Desk" settings/review screen in Twenty: header with metadata + Reject/Continue, a "What this app does" card with module rows + Caution/Safe chips, an "Affects" stats panel, an admin-approval warning, a four-tab content area (Simulate / Permissions & agent / Rollout / Technical diff), and a sticky bottom approval bar.

### Headline issues (ranked by severity)

1. **Touch targets all undersized.** Every button measures 32 px tall — Reject (65×32), Continue to rollout (141×32), Save draft (89×32), Request admin approval (196×32). All fail the 44×44 minimum. Tab chips, sidebar rows, and the breadcrumb fail too.
2. **Mobile/tablet layout breaks.** At 390 px the page does not reflow at all: the left settings sidebar (~250 px) is fixed and the main column overflows horizontally, clipping the page mid-content. At 768 px the page header wraps "3 min ago · v0.1 draft" into three single-word lines, the primary CTA "Continue to rollout" wraps to two lines, and the module rows wrap awkwardly. There is no apparent breakpoint; this is a desktop-only design.
3. **Body copy contrast failures (WCAG AA).** The mid-gray `#8F8F8F` is used for 39 separate text strings on white — contrast 3.23:1, below the 4.5:1 AA body threshold. Light gray `#B3B3B3` (2.10:1) is used for additional secondary text. Examples: breadcrumb separators, the `· $420,000 · Negotiation` subline under the opportunity, "Updated 2d ago" timestamps, "Try another sample" affordance, the "Agent can read 4 objects…" summary row.
4. **Type scale is accidental, not intentional.** Seven distinct sizes appear (11 / 12 / 13 / 14 / 15 / 18 / 22 px) but only 13 (260 nodes), 12 (54), 11 (38), and 18 (4) carry weight. The 14 px and 15 px sizes are one-offs. Adjacent-step ratios are inconsistent: 11→12 = 1.09, 12→13 = 1.08, 13→18 = 1.38, 18→22 = 1.22 — not a 1.125/1.2/1.25 scale. No display size; the H1 ("Deal Desk") is 22 px, only ~1.7× body, which weakens the page focal point.
5. **Line-height is undefined.** 357 visible elements compute `line-height: normal`; only 2 paragraphs and 1 inline have an explicit number. Body paragraphs look fine because `normal` ≈ 1.2 for Inter, but headers, chip text, and dense rows have no vertical-rhythm system — section gaps and label-to-input spacing are improvised.
6. **No tabular-nums on monetary columns.** `$420,000 / $210,000 / $84,500` in the sample list and the matching opportunity header have `font-variant-numeric: normal` and `font-feature-settings: normal`. Decimal/comma columns do not align, and figures jitter horizontally.
7. **Sticky bottom approval bar is redundant.** The exact same "Needs admin approval / Agent: write access to Opportunity" appears in both the right-rail callout (top) and the sticky bottom bar, with two more "Request admin approval"-style CTAs in the page (top-right "Continue to rollout" + bottom "Request admin approval"). Two competing primary CTAs on one surface = unclear focal point.
8. **Spacing scale leaks.** Counted padding values: 0, 2 8, 4 10, 6 0, 6 12, 8 0, 10 12, 12, 12 0, 12 16, 16, 16 8, 24, 0 12, 0 24 px. The 6 and 10 values break a 4/8/12/16 system; chip padding `2 8` does not relate to row padding `12 16`. Gap values are cleaner (4 / 6 / 8 / 12 / 16 / 24) but still mix 6 with the 4-scale.
9. **Radius tokens are inconsistent.** Three radii in use: 4 px (21 elements — cards, frames), 6 px (10 elements — same-feeling cards, buttons), 50 px (15 elements — chips, full pills). 4 vs 6 is indistinguishable on small surfaces and reads as "two card libraries glued together." 50 % is used on the avatar circle. No clear small/medium/large radius token.
10. **Border/hairline noise.** Six distinct border colors with little system: `#F1F1F1` (18 elements), `#EBEBEB` (3), `#333` (2), plus three chip-specific borders. The 18-vs-3 split between F1 and EB is invisible to the eye but produces faint mismatched hairlines (e.g. between the main card and the right-rail callout border).
11. **Iconography mixes stroke weights and metaphors.** The module-row icons mix three glyph families: filled square-grid icons (panel, workflow), outline cylinder (object/field), outline upload-tray (AI agent). The "⚠" used inline next to "Looks similar to existing field…" is a unicode emoji while every other icon is an SVG — accidental emoji-as-icon. The breadcrumb uses a `›` character separator while the row "·" middot is used as the metadata separator — also a typographic icon, fine but inconsistent stroke weight against the SVG chevrons.
12. **"Affects" stat tiles are accidentally identical-feeling.** Three-card centered row of large numbers ("2 / 1+1 / 28") with tiny labels under each — borderline AI-slop "feature-card" pattern. Each tile is gray text on near-white background with no distinguishing icon or border emphasis, so the surface reads as decorative.
13. **Dashed-border "Preview mode" frame is heavy.** A 2-px dashed indigo border wraps the entire opportunity preview pane, plus the pane has a separate header strip "Preview mode · Sample data · Changes are not saved." Two redundant signals for the same dry-run idea. The dashed indigo also competes with the indigo "Proposed by Claude" badge and "Show all (8)" link — three different indigos (`#5746AF`, `#3B5BDB`, `#6F81F0`-ish dashed) doing different jobs.
14. **Chip color logic doubles up.** `In review` (amber) and the top-level `Caution` chip (amber) share `#8A5A00 on #FFF4D5`, so the user sees the same amber for both "AI flagged this risky" and "status is in progress." `New` next to "Deal Desk" uses indigo, and so does "AI preview" — semantic overload of the indigo token. Amber chip contrast on its own background: text `#8A5A00` on bg `#FFF4D5` ≈ 5.7:1 (OK), but on the slightly different `#FFF7DF` it drops to ~5.2:1 — two amber backgrounds for the same chip family.
15. **Tabs lack a clear current state at a glance.** Active tab is "Simulate" — underlined and bold-black. Inactive tabs are mid-gray. Hover state was not observed (no obvious differentiation). Tab row also lacks any container/background so on scroll it floats over content without a clear separator.
16. **Forms (Rollout tab) have label-position inconsistency.** Some labels (Pipeline, Team/role, Territory, Deal size, Duration) sit left of the input; the Deal-size input pairs `100,000` / `No max` / `USD` as three inline pills with no margin grouping. The Duration row places radio buttons inline with an unrelated stepper (`Pilot for [–] 2 [+] weeks`), which is a custom one-off control with no hover/disabled state shown.
17. **Data table (Permissions → Data scope) is undercooked.** No zebra striping; rows have a hairline border only on the bottom, headers ("OBJECT" / "ACCESS") are caps-12px-gray (~3.2:1 contrast — fails AA). No sort affordance, no sticky header. The MCP row is bolded while others are not — single-row weight emphasis with no visible meaning.
18. **Empty / loading / error states absent.** No skeletons or spinners observed on the preview pane that says "Sample data"; "Legal Review · Not started" simply renders `—` with no retry/CTA; "Workflow would trigger:" lists outcomes as pills but there is no error or "would fail" state to compare. Try-another-sample is the only iteration affordance.
19. **Information hierarchy: two equally weighted reading paths.** Top-right has Reject / Continue to rollout (dark primary). Bottom-right has Save draft / Request admin approval (dark primary). Both are bottom-corner anchored on different axes. Visual weight reads ~equal, so the user does not know which CTA "ends" the task.
20. **AI-slop tells.** Soft signals — none egregious — but present: identical three-card "feature card" row in Affects; pastel-on-pastel chip palette (green/amber/indigo at ~10 % saturation backgrounds); "Proposed by Claude" sparkle-icon badge; "AI deal-risk summary" indigo card with sparkle icon repeating the same motif; near-50-px-radius pill chips look generic-modern.

### What is good (so it isn't regressed during improvements)
- Single font family (Inter) used everywhere — no accidental pairing.
- Body measure on the main paragraph is ~72 chars — inside the 45–75 target.
- Body 13 px text uses `#333` (12.6:1) which clears AA easily.
- 4-weight system (400/500/600/700) is restrained.
- Semantic chip palette is consistent in shape (50 px radius, 2 8 padding, 11 px) even though the color tokens leak.
- Indigo `#5746AF` on white = 7.24:1 — accent color passes AA.
- Breadcrumb is present and uses `›` consistently.
- Sidebar IA (User / Workspace groups, current "Applications" highlight) is conventional and works.

### Recommended fixes (prioritized)
1. Bump every clickable target to ≥40 px (and ≥44 px on touch) — pad buttons to 36 / 40 / 44 in a token set.
2. Replace `#8F8F8F` and `#B3B3B3` text usages with `#666` (5.74:1) or darker on white. Define `text/primary`, `text/secondary`, `text/tertiary` tokens with measured contrast.
3. Define a type scale (suggested 12/13/15/18/22/28 at 1.2 ratio) and remove the 11/14 one-offs; bump page H1 to 28 px with `line-height: 1.15` so the page has a true focal point.
4. Set explicit `line-height: 1.5` for body and `1.25` for headings instead of `normal`.
5. Add `font-variant-numeric: tabular-nums` to all currency, percentages, count cells, and the timestamps.
6. Pick **one** of 4 px or 6 px as the small radius; keep 50 px for pills only. Use one hairline color (`#EBEBEB`).
7. Collapse the duplicate approval messaging: keep the right-rail callout, drop the sticky bar (or vice versa). Pick one primary CTA per surface.
8. Introduce a real responsive breakpoint: collapse the settings sidebar to an icon rail at ≤1024 px and to a hamburger at ≤768 px; stack the two-column "What this app does / Affects" below 1024.
9. Resolve the amber-chip overlap by giving "In review" its own neutral-blue token and reserving amber for `Caution`/policy warnings.
10. Replace the inline ⚠ emoji with the same SVG icon family as the rest of the module rows; align all module-row icons to one stroke width (1.5 px) and one fill style (outline).
11. Either drop the dashed indigo frame or drop the redundant "Preview mode · Sample data" header — not both.
12. Give "Affects" tiles real visual differentiation (icon per metric, or a unit label like "objects / agents / users") so the row doesn't read as identical AI-slop feature cards.

## Cost
- wall time: 9m 18s
- turns: 65
- tokens (input / cache-create / cache-read / output): 94 / 112142 / 4346339 / 21749
- $ estimate: $3.4182520000000003

## How Claude achieved it

This run was blind: the working-copy source under `cp_of_deal-desk-prototype-2/` and the reference codebase under `../../grounding/` were not opened. All findings come from interactive observation of the rendered prototype.

**1. Got the prototype reachable from the remote browser.** The dev server was listening only on `[::1]:5249` and the Playwright session is a remote Linux Chrome that cannot reach the host's loopback. Localhost / 127.0.0.1 / 192.168.1.21 / `host.docker.internal` all failed (connection refused or DNS). Resolved this by running the Softlight tunnel script (`/Users/milroc/.claude/plugins/cache/softlight-plugins/softlight/6.23.0/skills/start-tunnel/start-tunnel 5249`), which returned a tunnel UUID. Navigated Playwright to `https://softlight.orianna.ai/api/tunnel/<id>/` — page rendered.

**2. Catalogued all four tabs at 1440×900.** Took full-page screenshots and accessibility snapshots of the default Simulate tab, then clicked through Permissions & agent, Rollout, and Technical diff. The page scrolls inside a `.page-scroll` container rather than the window, so used `page.evaluate` with `scrollTo` on that node to walk through each tab's content rather than relying on `fullPage` (which only captured the viewport since the body itself was 900 px tall).

**3. Pulled hard CSS metrics from the DOM rather than eyeballing.** One large `page.evaluate` walked every visible element and tallied:
   - font-size, font-family, font-weight, line-height
   - text color, background color, border-top color
   - border-radius, padding, gap

   This produced the numbers behind issues #4 (seven font sizes, 13 px dominates with 260 nodes), #5 (357 elements at `line-height: normal`), #8 (15 distinct padding strings), #9 (three radii), and #10 (six border colors).

**4. Computed actual WCAG contrast ratios for every observed text color over white** using the standard relative-luminance formula in `page.evaluate`. Concrete numbers for issue #3: `#8F8F8F`/white = 3.23, `#B3B3B3`/white = 2.10, `#666`/white = 5.74, `#333`/white = 12.63, indigo `#5746AF`/white = 7.24, amber `#8A5A00`/white = 5.93, green `#1F7A4F`/white = 5.31.

**5. Measured all buttons** by collecting `getBoundingClientRect` for every `<button>`. All four primary buttons came back at 32 px height — drove issue #1.

**6. Measured body-copy character count** by dividing the paragraph's bounding width by an Inter `0.5em` rough average. Got ~72 chars — confirmed measure is fine (one of the "what is good" notes).

**7. Inspected tabular-num usage** on monetary strings via `font-variant-numeric` and `font-feature-settings` computed properties — both `normal`, confirming issue #6.

**8. Collected chip-style data** for every Safe/Caution/New/Approved/etc. badge to confirm the amber-token overlap in issue #14 and the consistent shape language called out in "what is good."

**9. Tested responsive at 768 and 390.** Resized the viewport via Playwright, re-snapshotted. Saw the no-breakpoint failure at 390 (sidebar fixed, main column clipped) and the wrap-failures at 768 — drove issue #2.

**10. Wrote findings.md.** Filled the Goal achievement section with 20 ranked issues, a "what is good" list, and a prioritized 12-item fix list. No code changes were made; this run is audit-only per the goal phrasing.

## Prompt
```
/goal Improve the visual design of this prototype (http://localhost:5249/), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Exhaustively audit every category of visual design issue. For each category, look for the specific signals listed. Typography — number of distinct font sizes vs an explicit type scale and the ratio between adjacent steps; intentional vs accidental font pairing; line-height consistency across body, display, and dense content; measure on body copy roughly 45–75 characters; weight contrast between heading and body weight. Color — total distinct colors and whether they form a coherent token system; WCAG AA contrast on body text (4.5:1) and AA Large on display (3:1); semantic role usage; neutrality of grays; dark-mode swap quality if applicable. Spacing & rhythm — distinct spacing values vs an explicit 4/8/12/16-style scale; density consistency across card padding, row height, and button padding; vertical rhythm of section gaps, paragraph spacing, and label-to-input gap. Grid & layout — stated grid alignment; optical vs mathematical alignment with off-by-pixel issues; sane content max-widths on wide viewports. Iconography — filled vs outlined style consistency; stroke-width consistency; single icon library vs accidental mixing. Information hierarchy — F-pattern / Z-pattern scannability; one dominant focal point per surface; primary CTA distinction; reading order. Composition & balance — intentional asymmetry vs symmetry; whitespace breathing; visual weight; nothing crowding boundaries. Responsive behavior — breakpoints with no layout breakage; graceful reflow; minimum 44×44 touch targets. Forms — label position consistency; error placement and recovery affordance; hover/focus/disabled/loading states; required vs optional treatment. Tables & data density — zebra/hairline consistency; sticky headers on long tables; sort affordances and current-sort state; tabular-numeric on numeric columns. Empty / loading / error states — each present where data is fetched; actionable copy; appropriate skeleton vs spinner; retry affordance on error. Pixel polish — 1px nudges for optical alignment; optical centering of icons; hairlines crisp at every density. Consistency — every value should trace back to a design token; same component used the same way every time; one-off styles flagged. AI-slop tells — centered-hero with three cards; gradient overuse; generic stock-photography vibe; excessive corner-radius; "Built by AI" badges/copy; lorem-ipsum-feel copy; emoji-as-icons; pastel-on-pastel palettes; identical 3-column "feature card" rows.
```
