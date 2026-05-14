# m3-m1-generalized-blind · deal-desk-prototype-2

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement

Observation-only audit (no source touched). The prototype is a "Deal Desk" app-review settings page styled to match Twenty: left settings nav, breadcrumb, four numbered sections (What changes / Try it on a sample deal / What the AI agent can do / Who gets it), and a sticky approval footer. The build already has a reasonably coherent token system — explicit 4/8/12/16/20/24/32 spacing scale, named radii (xs/sm/md/pill), shadow tokens, semantic color ramps for blue/green/yellow/red, and one font family (Inter). It is not crawling with AI slop: no centered hero, no 3-card grid, no gradient overuse, no rainbow palette, no emoji icons standing in for real ones, no "Built by AI" watermark (the "Built by Claude" sub-label is in-fiction copy, not a slop tell). Body copy contrast hits AA on `#333` over white. The work that remains is mostly polish, token discipline, and one genuinely broken state (responsive) — not a redesign.

The full nit list, by category:

### Typography
- **Nine distinct font sizes in use** — 10, 11, 12, 13, 14, 15, 16, 18, 20px. That is two too many steps; 11 and 13 collide visually with 12, and 15 collides with 14/16. A 6-step scale (11 caption / 12 chip / 13 meta / 14 body / 16 subhead / 20 title) would lose nothing.
- **Pill text sizing is inconsistent.** "Negotiation" (status pill on the opportunity card) is 12px with 2/8 padding; "In review", "Awaiting docs", "Not started", "Needs admin approval" pills are 11px with 1/6 padding; "AI preview" tab is 10px uppercase + 0.4px tracking. Three sizes of the same component.
- **Three weights actually used (400/500/600).** Reasonable. Sub-labels like "Built by Claude" sit at 500 next to a 600 H1 — fine.
- **Mixed uppercase treatments.** Section meta labels (AFFECTS, NEW SURFACES, OPPORTUNITY, DEAL DESK, READS/WRITES/ACTS, PIPELINE, TEAM/ROLE, etc.) and pills (AI PREVIEW, ADDED BY APP) all use uppercase but with at least two letter-spacing settings and two sizes. Pick one "eyebrow" style and stick to it.
- **Measure is fine on body** (~75ch on the description) but the AI risk summary paragraph runs ~95ch at 1440 — overlong line length for comfortable reading.

### Color
- **One off-token amber.** The "Negotiation" pill is `bg #fef3c7 / text #92400e / border #fde68a` — none of those match the declared yellow tokens (`--color-yellow-bg #fffbeb`, `--color-yellow-11 #9c6f0c`, `--color-yellow-border #f5d76e`). Every other warning-ish surface (AI preview, Needs admin approval, Awaiting docs) does map to the yellow tokens. So this is a literal hardcoded one-off.
- **Two semantically different yellows next to each other.** "Pending review" (status dot + pill), "Conflict", "AI preview", "Awaiting docs", "Needs admin approval" all use the same amber palette — but they mean five different things (review state / data conflict / inference disclosure / user-action-needed / governance hold). Conflict in particular reads like warning, not danger; with `--color-red-*` tokens already defined, conflict belongs in red.
- **Indigo (`#4f46e5`) does triple duty:** primary CTA, link color, and accent (numbered-step dot, toggle-on, app icon tile). Fine as a brand, but using the same hue for an inert accent shape and an active CTA flattens hierarchy. Numbered-step circles could be neutral.
- **Grays are neutral and well-stepped.** No tint drift, AA contrast on body, AA-large on metadata. Good.
- **Pastel-on-pastel:** "Preview — no changes are saved" pill (indigo on light indigo) and the "ADDED BY APP" pill (indigo on light indigo) sit on a white card on a `#fafafa` page — the chip-on-card-on-page sandwich is low contrast and slightly muddy.

### Spacing & rhythm
- An explicit 4/8/12/16/20/24/32 scale is declared and largely used.
- **Footer overlaps content.** The sticky approval footer (~56px) covers the last visible row above it; at scrollTop=0 the bottom of the "Procurement status / In review" row is clipped by the footer. Needs scroll-padding-bottom on the scroll container.
- **Label-to-input gap differs across sections.** "Sample opportunity" (section 2) uses inline label + select; "Pipeline / Team / Territory / Deal size" (section 4) uses stacked uppercase eyebrow + select; "Time-box this rollout … for [n] [weeks]" (section 4) interleaves inline text with form controls. Three form patterns on one page.
- **Card padding varies.** Section 1 description card has 16/20 internal padding; section 2 opportunity card has tighter row gutters; section 3 agent card has wider gutters around the toggle row. Not catastrophic, but the rhythm wobbles between sections.

### Grid & layout
- No declared 12-column grid; the content column uses a fluid max-width.
- **Section 1's stat grid is a 2×2** ("Affects / New surfaces / New automations / Data scope"). Cell widths align mathematically but the icons in column 1 don't optically anchor to a single x — second-column icons sit ~120px further right than their labels need. A consistent 2-column inner grid would tighten this.
- **Content max-width is generous (~800px) on a 1440 viewport.** Whitespace to the left of the content column (between sidebar and card) is larger than the page gutter on the right — the page reads off-center.

### Iconography
- Outlined line icons, mostly consistent stroke (~1.5px). Single library look.
- **Section "step number" circles** are filled gray on white; they mix metaphors with the **outline checkbox-style circles** in the Mutual Action Plan list — same shape, different roles.
- **Breadcrumb separators** are an icon chevron, fine; but the sidebar back-arrow "Settings" link uses a different chevron weight than the breadcrumb chevrons.

### Information hierarchy
- One clear focal point per section (the section number + title, then the card). Good.
- **Primary CTA is wrong.** The footer's "Resolve 1 conflict" is the only filled indigo button on the page — but it's `cursor: not-allowed; opacity: 0.5` (disabled). The action that needs to happen ("admin approval required for 2 changes") has no corresponding enabled CTA — there's only the muted Discard ghost button up top. The user is shown a disabled primary and a quiet secondary, with no path forward from this surface.
- **Discard is far from the destructive zone.** Top-right ghost link, no border, same weight as a "Show technical details" link — easy to miss-tap, and discards a pending review.
- **Section numbers compete with content.** Big circled "1/2/3/4" + heading + ample whitespace works, but on long sections (section 2 is ~1400px tall) the numbering is unanchored once the user scrolls past it. A sticky section header or rail would help.

### Composition & balance
- Layout reads top-down; balanced.
- **Right-side weight is empty.** The opportunity preview card has all its data on the left half (Owner/AE/Pipeline/Source rows truncate well short of the card's right edge). Lots of dead space; either tighten the card width or use the right half for the Deal-Desk-panel context.
- **The "AI preview" yellow dashed box** is the only dashed border in the UI — and the "AI preview" label tab sits half-overlapping the top-right corner of the dashed box, which reads more like a Figma overlap accident than an intentional tab.

### Responsive behavior
- **Broken at narrow widths.** At 390px the fixed sidebar keeps its full ~220px width and the main content gets ~150px; the description wraps one word per line ("Adds / a / Deal / Desk / workflow / …"). No collapse, no hamburger, no breakpoint.
- At 768px the layout holds but the footer's "Admin approval required for 2 changes." wraps to two lines and the "Resolve 1 conflict" button still fits the same row, producing a misaligned bottom edge.
- **Touch targets:** the sidebar nav rows are ~32px tall and "Show technical details" / "Advanced" links are 16px tall — both under the 44×44 minimum.

### Forms
- **Three label patterns.** Inline left-of-input ("Sample opportunity"), stacked uppercase ("PIPELINE/TEAM/ROLE/TERRITORY/DEAL SIZE"), and inline-with-running-text ("Time-box this rollout for [2] [weeks]"). Pick one default and use the others only when justified.
- **Required treatment is a bare red asterisk** ("Procurement status *", "Security review *", "Legal review *") — fine, but there's no legend telling the user red-star means required, and the same `*` doesn't appear on the "Deal size" amount input which is also presumably required.
- **No visible focus state in the default render.** I couldn't trigger focus rings on the selects/inputs in a static capture, but the resting state offers no hint of `:focus-visible` styling beyond the browser default — this matters because the page lives inside a settings shell that otherwise looks bespoke.
- **Disabled state is opacity-only.** The "Resolve 1 conflict" button reads as enabled-but-tinted; should pair with a token-driven disabled bg/text, not just `opacity: 0.5`.

### Tables & data density
- No real tables. The opportunity card's "Owner / AE / Pipeline / Source / Procurement status / …" is a key-value list with hairlines, which works. Numbers like "$250,000 ARR", "$100,000", "47 opportunities", "14 reps" are not tabular-numeric — set `font-variant-numeric: tabular-nums` on the data column so digits align.
- Side-effects list (Create task / Post Slack / Workflow step / Draft email) reads like a 4-row table; the "View payload" link sits flush-right with hairlines top/bottom — clean. Sort/sticky-header concerns don't apply here.

### Empty / loading / error states
- No empty or loading states surfaced. The sample-opportunity selector switches inline and there's no skeleton/spinner affordance.
- **Conflict state is shown but not actionable.** "Data scope · Opportunities in Enterprise pipeline · [⚠ Conflict]" — clicking the conflict chip is the only path to resolve, but the chip is rendered the same as the inert "Negotiation" pill; no "Resolve" affordance, no tooltip, no explanation surface visible.
- **Footer error/warning is mixed with primary action.** The amber "Needs admin approval" badge + amber-bordered explanatory text + disabled primary CTA all share the bottom bar; an error-recovery layout would lead with the affordance.

### Pixel polish
- **Half-rounded radius detected.** The page enumerates a `border-radius: 8px 0px 0px` value — almost certainly a single corner styled in isolation rather than a deliberate shape. Worth chasing.
- **Section number circles** are mathematically centered but the digit "1" optically reads ~1px right-heavy inside its circle; "4" is fine. Optical-centering nudge worth checking.
- **AI preview tab/label** overlaps its container border by ~6px on top — possibly intentional "tab" style, but the cut is uneven on the right side.
- **`rgb(253, 230, 138)` border on the Negotiation pill** is a one-off hardcoded color (the token border is `rgb(245, 215, 110)`); this is the same finding as the off-token amber above, but visible at the pixel level.

### Token consistency
- The token system is fairly disciplined: spacing, radii, shadows, font, and three color ramps are declared. The leak points are:
  - The Negotiation pill (off-token amber).
  - 9 font sizes vs a stated lack of an exposed font-size token (font sizes are not in the `--*` map).
  - The `8px 0px 0px` radius (off-token shape).
  - Two raw `rgb()` shadows on the body alongside the three declared shadow tokens.
- No design-token coverage for typography sizes or line-heights is exposed via CSS variables; everything is set in component CSS. The next obvious step is `--text-xs/sm/md/lg/xl` tokens to lock the 6-step scale.

### AI-slop tells (specifically checked)
- ✗ Centered-hero with three cards — **not present.**
- ✗ Gradient overuse — **not present.** The only gradient-ish surface is the indigo app icon tile, which is flat.
- ✗ Generic stock photography — **not present.**
- ✗ Excessive corner-radius (>12px on small elements) — **not present.** Radii are 2/4/8/pill.
- ✗ "Built by AI" badges/watermarks — **not present.** "Built by Claude" is in-fiction copy describing the app's author within the Deal Desk surface; it is not a slop watermark.
- ✗ Lorem-ipsum-feel copy — **not present.** Copy is specific (SIG-Lite, SOC 2 + DPA, MSA, Aug 25 auto-revert, Maya Patel, deal-desk@acme.example).
- ✗ Emoji icons standing in for real iconography — **not present.**
- ✗ Pastel-on-pastel palette — **partially present:** indigo-on-light-indigo "Preview" and "Added by app" pills are the only pastel-on-pastel surfaces.
- ✗ Identical 3-column "feature card" rows — **not present.**

### Priority order to act on (if a follow-up pass were allowed)
1. Fix the responsive break at <900px (sidebar collapse + breakpoint).
2. Make "Resolve 1 conflict" the actual recovery affordance, or replace the disabled CTA with a real action.
3. Pull the Negotiation pill and the half-radius onto tokens; add a `--text-*` token set; consolidate the 9 font sizes to 6.
4. Disambiguate the five different things that share the amber palette (re-color Conflict to red, leave "Pending review" / "Needs admin approval" / "Awaiting docs" amber).
5. Add scroll-padding-bottom so the sticky footer stops clipping the last row.
6. One pill component, one eyebrow component, one form-label pattern — picked and applied across all four sections.

## Cost
- wall time: 6m 40s
- turns: 44
- tokens (input / cache-create / cache-read / output): 78 / 106683 / 2797074 / 20461
- $ estimate: $2.5772207500000004

## How Claude achieved it

Worked entirely from the rendered URL — no source files read, no reference codebase opened.

1. **Reached the dev server.** The Vite process was bound only to `[::1]:5247` (IPv6 localhost), so the remote Playwright sandbox couldn't reach it. Started a tiny Node HTTP/upgrade proxy listening on `127.0.0.1:15247` that forwards to `[::1]:5247`, then opened a Softlight reverse tunnel against the IPv4 port.
2. **Navigated the surface** at 1440×900, captured the full snapshot tree, then scrolled the inner `.page-body` container (the page itself has `overflow:hidden` on `main` — only that inner div scrolls) at three offsets to screenshot every section: section 1 (What changes), section 2 (Try it on a sample deal — opportunity card, mutual action plan, AI risk summary, side effects), section 3 (DealDeskAssistant capabilities), section 4 (Who gets it / rollout).
3. **Extracted the live design tokens** by reading `:root` custom properties through `getComputedStyle` — confirmed an explicit spacing scale (4/8/12/16/20/24/32), radii (2/4/8/pill), shadow tokens, indigo brand, and semantic green/yellow/red ramps.
4. **Inventoried actual usage** with a sweep over every element: collected the distinct set of `font-size`, `font-weight`, `color`, `background-color`, `border-color`, `border-radius`, and `box-shadow` values. That surfaced 9 font sizes, 3 weights, 10 text colors, 13 backgrounds, 10 border colors, 6 radii (including a `8px 0px 0px` one-off), and 2 raw shadows alongside the declared shadow tokens.
5. **Probed key components** individually (`Discard`, `Resolve 1 conflict`, `Show technical details`, `Advanced` buttons; `Negotiation`, `In review`, `Awaiting docs`, `Not started`, `AI preview`, `Needs admin approval`, `Preview — no changes are saved` pills) to compare paddings, sizes, weights, and computed colors against the token map. That's how the off-token Negotiation amber, the disabled-primary-CTA hierarchy bug, and the three different pill treatments showed up.
6. **Tested responsive behavior** at 1440, 768, and 390 viewport widths. The 390-wide view is the most damning evidence: the fixed sidebar keeps its full width and the content column collapses to per-word line wraps.
7. **Cross-referenced against the AI-slop checklist** from the prompt and explicitly noted what is *not* present (centered hero, gradients, emoji icons, 3-card row, oversized radii, lorem-ipsum copy) alongside what is (one pastel-on-pastel pair).
8. Wrote the findings here without editing any prototype source.

## Prompt
```
/goal Improve the visual design of this prototype (http://localhost:5247/), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Cover the full surface of visual design nits: typography, color, spacing & rhythm, grid & layout, iconography, information hierarchy, composition & balance, responsive behavior, forms, tables & data density, empty/loading/error states, pixel polish, token consistency, and AI-slop tells.
```
