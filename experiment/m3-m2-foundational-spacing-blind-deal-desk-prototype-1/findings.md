# m3-m2-foundational-spacing-blind · deal-desk-prototype-1

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement

This was a read-only observational pass — the harness instructions forbid modifying the prototype source, so the deliverable is a precise inventory of spacing-and-rhythm issues observable in the running app and a concrete proposal for fixing each. No code was changed.

### Spacing scale (tokens vs. usage)

The prototype declares a clean 4-pt scale (`--space-1…6, 8` = 4, 6, 8, 12, 16, 20, 24, 32). Computed-style audit of every padding/margin/gap on the Simulate page returned this frequency table:

| value | hits | on-scale? |
|---|---|---|
| 8 | 97 | ✅ |
| 12 | 92 | ✅ |
| 6 | 70 | ✅ |
| 4 | 35 | ✅ |
| 2 | 35 | ✅ |
| 16 | 33 | ✅ |
| 24 | 19 | ✅ |
| **10** | **16** | **❌ off-scale** |
| 1 / −1 | 15 | hairline (OK) |
| 32 | 8 | ✅ |
| 20 | 1 | ✅ (almost unused) |

The "10" is a clean break — there is no `--space-` for it, yet it shows up in **six** distinct components, all of them prominent:

- `.tab` — padding `10px 12px`
- `.disclosure` — padding `10px 12px`
- `.btn.sm` ("Try another sample") — padding-x `10px`
- `.side-effect-chip` ("Would create task…", "Would email…") — padding-x `10px`
- `.stable-head` / `.stable-row` (Data scope table on Permissions tab) — padding `10px 16px`

These look hand-eyeballed rather than tokenized. Fix: pick `8` (for chips/small buttons/tabs) and `12` (for table rows) and retire `10`. Also notice the scale itself is missing useful larger steps — `--space-7 (28)`, `--space-10 (40)`, `--space-12 (48)` — which is why page-level spacing reverts to ad-hoc values.

### Vertical rhythm in the summary card

Three different rhythms coexist in one card:

- Card padding: **24**.
- Two-column grid gap: **24**.
- Right column `.trust-stack`: stack-gap **16** between policy banner, Affects block, and disclosure.
- Left column has *no* stack-gap and instead uses per-child `margin-bottom`:
  - `h2` → **mb 12**
  - `p.lede` → **mb 16**
  - `.change-list` → mb 0
  - `.show-all` → mb 0

The h2-to-lede gap (12) and the lede-to-list gap (16) are inverted from the usual convention (heading sits *closer* to its body than the body sits to the next block). It also clashes with the right column's uniform 16 stack. Fix: replace the left column with a flex/grid stack at gap `16` and a `2px–4px` tightening of `h2 → p.lede` via a heading-paired class — or, simplest, drop both margins and use a single `gap: 16` on the column with an 8-row heading wrapper.

### Change-list row rhythm

`.change-row-wrap` uses padding `8px 0` for every row, but actual heights are **48, 66, 36, 36, 36** because the first two rows wrap onto extra lines (multi-chip metadata, conflict-warning subline). The eye reads this as irregular striping. Fix:
- Give each row a fixed minimum height (e.g. `min-height: 40px`).
- Move the conflict warning into a flush sub-row with its own `mt: 4`, not into the row's flow gap.
- Either give every row a 1px bottom hairline or use a consistent `gap: 4` between rows so wrapped rows still feel like the same beat.

### Tabs strip

`.tab` is `padding: 10px 12px; gap: 6; mb: −1` (hairline overlap) — fine mechanics — but the *tablist* has `margin-bottom: 24` and the *card above it* sits 24px above, sandwiching the tabs in identical 24-gaps with no visual anchor. The tabs read as floating. Fix: tighten the gap-above-tabs to **16** (or move the tabs flush against the card with a `border-top` and 0 gap) so the relationship "tabs belong to the panel below" is unambiguous. Also tabs' `10px` vertical should be **8** for a 32-height tab or **12** for a 40-height one — the in-between 38px feels like an accident.

### Stat tiles ("Affects" row)

`.stat-tile` is `padding: 12; height: 63`. With a 21-tall number and a 14-tall label, the inner stack is `12 → 21 → 2 → 14 → 12`. The label hugs the number (gap 2) while the tile pad is 12 — visually the label looks like overflow. Fix: explicit `gap: 4` between number and label, and bump tile padding to **16** for breathing room. Optionally, increase the number's line-height so the tile's vertical centroid lines up with the policy banner's body text on the same row.

### Disclosure row ("Agent can read 4 objects…")

`.disclosure` uses **10px 12px** (off-scale) and a tiny 37px overall height. Sandwiched between the 63-tall stats row and the card's 24-pad bottom, it looks like a button rather than a section disclosure. Fix: take it to `12px 16px` (on-scale), bump height to 40, and either left-align the caret consistently or use a `space-between` row with the chevron at the trailing edge.

### Simulate left panel — sample list

`.sim-opp` items are 57px tall, **stacked with no gap and no divider**. The three opportunity rows read as a single 171-tall block because the alternating-background trick is absent and the per-row padding is identical. Fix: a 1px hairline divider OR `gap: 1` with `--border-light`, plus a 4-px row separator inside the active state. Also `.dryrun-pill` has `margin-bottom: 12` which then leaves the first opportunity row touching it; the rest is `gap: 0`. Replace the per-element margin with a column-level `gap: 8` between header pill and the list.

### Simulate preview pane

Nesting `pad: 24` (preview-body) → `pad: 16` (panel-body) → `pad: 12 16` (panel-head) introduces three nested paddings of three different sizes. The asymmetric **12/16** on `.panel-head` makes the Deal Desk row's left edge mis-align with its panel-body content (16 vs 16 — same). But the *vertical* 12 vs 16 makes the head feel pinched. The "AI deal-risk summary" purple box inside the panel-body has its own 12-padding on top of the 16, producing nested boxes with declining padding (24 → 16 → 12) that look more "shrinking" than "hierarchical". Fix: pick **two** padding tiers — outer 16, inner 12 — and let radius and background carry the rest. Drop the dotted blue 1px outline; it is decorative and inflates perceived padding without contributing to rhythm.

### Permissions tab — `.cap-row` vs `.stable-row`

`.cap-row`: padding `12 0`, 57–58 row height. `.stable-row`: padding **10 16**, 38–39 row height. They are functionally identical lists in adjacent cards but use *different* vertical rhythms. Fix: unify on `12 16` and a single row template. Side benefit: gets rid of two more `10`s.

### Page-level rhythm and footer

- h1 (`top: 72`) → meta row (`top: 104`) → first card (`top: 146`) gives `26 / 18 / 24 / 6 / 24` cadence: title to meta to card pulses by 6-24-24. The 6px sliver between meta and card edge is below scale (`--space-1-5` = 6 exists for chips, not for block separation). Tighten meta-to-card from 24 to 16 or, conversely, raise it to 32 — but pick one.
- Top of viewport is 72px before h1; the topmost breadcrumb row hides above the scroll start. Either reduce top padding to **40** or move the breadcrumbs into a sticky bar.
- Footer (`64`px) is **pinned and full-width** and overlaps the scroll content (preview body 692px starts at scroll-top ~85px). On a 900-vh viewport this means the Simulate preview pane's bottom 64px is always behind the footer. Fix: add `padding-bottom: 80` to `.page-scroll` (currently it has 80 — good) BUT the simulate preview is using `height: 692` not bottom-relative, so it ends *before* the footer with empty space, then re-flows. Either lift the bottom-bar over a real spacer or convert it to a non-overlapping bottom row.
- The Technical-diff tab demonstrates the rhythm problem most acutely: section labels OBJECTS / FIELDS / WORKFLOWS sit alone above near-empty 38-tall rows that stretch the full content width, with ~24px gaps above each label. Result: large vertical voids on the right of every row. Fix: either right-align the chip + add metadata in the empty space, or constrain rows to a narrower max-width so the row is a unit, not a stripe.

### Proposed canonical scale and rhythm

| step | px | role |
|---|---|---|
| 0.5 | 2 | tag insets, hairlines |
| 1 | 4 | icon ↔ label inline gap |
| 2 | 8 | inline chip padding-y, button-icon gap |
| 3 | 12 | dense table row padding-y |
| 4 | 16 | default stack gap, card-body inner padding |
| 5 | 20 | rarely used — promote or delete |
| 6 | 24 | card padding, two-column gap |
| 7 | 32 | section-to-section spacing |
| 8 | 48 | page-title block separation |

Retire 10 entirely. Reserve 6 for chip internal use only (not block rhythm). Establish a single rule: *every vertical stack uses one of {8, 12, 16, 24} as `gap` rather than per-child `margin-bottom`.* That single rule would fix most of the issues above mechanically.

## Cost
- wall time: 7m 24s
- turns: 54
- tokens (input / cache-create / cache-read / output): 87 / 110678 / 3640335 / 23978
- $ estimate: $3.111789999999999

## How Claude achieved it

1. **Tunnel setup.** The Vite dev server bound only to IPv6 `[::1]:5252` while the playwright browser resolves `localhost` to IPv4. A 10-line Node TCP forwarder (`127.0.0.1:15252 → [::1]:5252`) made the port reachable, then the softlight `start-tunnel` script exposed it through `softlight.orianna.ai/api/tunnel/<id>/`.
2. **Interactive observation.** Opened the prototype at 1440×900, walked all four tabs (Simulate, Permissions & agent, Rollout, Technical diff), scrolled within `.page-scroll`, and took screenshots of each tab in both the above-the-fold and below-the-fold states.
3. **Token discovery via stylesheet inspection.** Iterated over `document.styleSheets[…].cssRules` filtered for `:root` to dump every declared CSS custom property. This surfaced the full design-token system (spacing scale 4-6-8-12-16-20-24-32, radii, shadows, colour ramps) without touching source files.
4. **Scale-violation audit.** Iterated over every element in the body, sampled `padding{Top,Right,Bottom,Left}`, `margin{…}`, `rowGap`, `columnGap` via `getComputedStyle`, and built a frequency histogram of values. This is what surfaced **10px** as an off-scale value used 16 times.
5. **Selector mapping for each off-scale value.** Re-walked the DOM filtering for `cs[prop] === '10px'` to find which components introduce the violation, so each finding could name the offending class.
6. **Vertical-rhythm walk.** Recursive `walk(el, depth)` function that, for each card and sub-stack, printed `tag.class | height pad gap margin-bottom` for up to 5 levels. This made it possible to compare the left column's per-child `margin-bottom` rhythm against the right column's `stack-gap` rhythm side by side.
7. **Geometry probes.** `getBoundingClientRect` on h1, breadcrumb row, first card, tabs, footer to compute the actual page-level cadence (72 / 26 / 6 / 18 / 24 / …).
8. **Synthesis.** Cross-referenced the token system, the histogram, the rhythm walk, and the component map to produce a per-component fix list and a proposed canonical scale that would resolve the issues by construction rather than touch-up.

Tools used: playwright MCP (navigate, screenshot, evaluate, click, resize), a bash-launched Node TCP forwarder for IPv4↔IPv6 bridging, and the softlight `start-tunnel` skill. No prototype source or reference codebase was read.

## Prompt
```
/goal Improve the spacing and rhythm of this prototype (http://localhost:5252/), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Focus on the spacing scale, density, and vertical rhythm.
```
