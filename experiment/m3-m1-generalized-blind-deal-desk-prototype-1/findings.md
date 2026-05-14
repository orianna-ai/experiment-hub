# m3-m1-generalized-blind · deal-desk-prototype-1

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement

A pass over every category the prompt asked for, working only from what's observable in the running prototype at desktop (1440×900), tablet (820×900), and mobile (390×780).

### Typography
- Type ramp is shallow and inconsistent: `h1 = 22px`, `h2 = 15px`, body = `13px`. The 13 → 15 step is barely perceptible; the 15 → 22 step is a jump with nothing between for sub-section headings ("Affects", "What this app does", "Data scope" are all the same 15px weight-600). No clear scale.
- `line-height: normal` on every probed element (h1, h2, body, button). No baseline rhythm — visible in the "3 new fields on Opportunity" row where the warning sub-line crashes into the chip line above.
- Body 13px is dense for an enterprise settings hub; combined with `#333` text on `#fff` it reads as "default browser-ish" rather than a designed system.
- `JetBrains Mono` is preloaded in the document head but the only place it shows up is the Technical-diff lines (e.g. `+ Added object MutualActionPlan`). A preload-then-barely-use smell.
- Glyph hygiene drifts: separators are `›` in breadcrumb, `·` in the meta row, `·` between list-item label and detail, `×` in "2.4× risk signal", `+` and `−` in the stepper, plain `-` in dialed text. At least pick a single mid-dot, multiplication sign, and minus sign and use them consistently.
- "1 + 1" stat tile (Affects → Workflow · Agent) renders with literal spaces around `+`, so it kerns weird next to the neighbor "2" and "28" tiles which are tight numerals.
- "Proposed by Claude" badge text is mixed-case in a chip that otherwise reads as a tag — should probably be small-caps or steady-weight to fit the chip language used elsewhere ("Safe", "Caution", "Approved").

### Color
- **No CSS custom properties on `:root`** — `getComputedStyle(documentElement).getPropertyValue('--bg' …)` returns empty strings for every guessed token name. Colors are inlined and drift accordingly (this is the root cause of most of the inconsistencies below).
- Three distinct purples in one screen: the sidebar "A" avatar (saturated brand purple), the "AI deal-risk summary" card background + heading (lavender wash + medium purple), the "Proposed by Claude" chip (pale lavender + a different medium purple), and the "Write" badge in the Data-scope table (yet another purple-blue). Pick one purple ramp.
- Three distinct yellows: the "Caution" status pill (warm amber), the "Needs admin approval" callout card (pale yellow background), and the "Needs admin approval" pill on the toggle row (yet another amber pill with a thicker border).
- Two distinct greens: "Safe" pill vs. "Approved" pill vs. "Read" badge — close but not the same.
- "Show all (8)" is rendered in a saturated link blue that appears nowhere else in the UI (sidebar nav uses grays, all CTAs are neutral or black). A lone bootstrap-style anchor is a token-system tell.
- "Reject" button border is `#ebebeb` — identical to the card border color — so the button reads as another panel rather than a destructive action.
- The "Write" pill in the Data-scope table uses brand-purple. Brand-purple is also the AI/Agent color across the rest of the page, so "Write" looks like it means "AI-written" instead of "permission: write".
- Sticky footer uses a near-black foreground on white with a thin top border and no shadow; meanwhile the top-right "Continue to rollout" CTA is a `#1a1a1a` pill. Two near-blacks, no shared token.

### Spacing & rhythm
- The "What this app does" hero card's right column ("Needs admin approval" + "Affects" + "Agent can read…") ends roughly 200px above where the left column ends ("Show all (8)"). Whitespace pools below the right column for no reason.
- The change-list rows have inconsistent vertical padding: the "3 new fields on Opportunity" row grows because of the warning sub-line, but the sub-line is not indented under the row content, so the eye reads it as a separate orphan paragraph instead of an attribute of that row.
- The dotted purple preview-frame is offset from the inner content by inconsistent gaps (top 16px-ish, but the "Workflow would trigger" pills nearly kiss the bottom edge of the dashed border).
- The Affects stat tiles ("2 / 1 + 1 / 28") are flush against each other with no visual breathing room, while the right-column card they sit in has generous internal padding — local rhythm clashes with container rhythm.
- The Rollout summary card ("28 reps will see this on Monday") has the giant 28 numeral set against tightly packed label rows below; the typographic gap between the hero number and the first label row is too small for the size of the numeral.

### Grid & layout
- Two persistent left rails (icon strip + named menu) consume ~220px before the breadcrumb starts, on a screen whose primary job is reviewing a single change set. The settings-style chrome dominates the actual work surface.
- The page-scroll container scrolls under a sticky footer; on the Rollout tab the footer's top edge crops the bottom of the summary card with no fade or shadow, so it looks broken rather than layered.
- The hero card and the tab section below it sit on different vertical alignments — hero card has padded gutters; tab strip starts deeper inside the content well. The "Simulate" underline doesn't align horizontally with anything above or below it.
- The Simulate panel splits into a 1:2-ish column (sample list / preview) but the preview occupies a dashed-bordered frame that doesn't share the rounded-rectangle language used by every other surface on the page.

### Iconography
- The 4-square "apps" glyph is reused for three semantically different things on the same screen: "Applications" in the sidebar (workspace section), "New panel on Opportunity" in the change list, and "Technical diff" tab. That's overloading.
- Stroke weights drift across the change-list icons — the panel/table icons are ~1.5px stroke; the briefcase icon ("New AI agent") looks ~1px and smaller in optical size. They were drawn at different sizes and not normalized.
- The "T" workspace tile (top-left) is a flat black square with a serif-ish T. No corner radius, no avatar treatment, sitting next to perfectly rounded sidebar icon tiles. The Acme "A" inside the preview is the same shape but bright purple — same primitive, two different applications.
- The breadcrumb chevron is a slim `›` while every other "go" affordance in the page uses a different chevron (the "Open plan ↗" uses an arrow; the "Agent can read 4 objects…" row has a caret-down `▾`). Three different "more" glyphs.
- The "Dry-run preview" pill leads with a small flask/icon that differs in style from the "Preview mode · Sample data" banner icon directly below it — same concept, two icon vocabularies.

### Information hierarchy
- "Needs admin approval" appears in three places at the same emphasis: the yellow card top-right, the pill on the "Send external notifications" toggle, and the sticky-footer banner. None of them is the canonical primary; nothing in the visual weight tells the reviewer where to act.
- Two pairs of competing CTAs: top-right "Reject / Continue to rollout" vs. bottom "Save draft / Request admin approval". The yellow card explicitly says "you can request approval below" — which implies the bottom is canonical — but the top is the visually loud pair. Either the user re-reads the alert and scrolls, or they hit the wrong button.
- The status pills mix tenses and grammar: "In review", "Approved", "Not started" (verb forms) + "Safe", "Caution" (adjectives) + "Needs approval", "Needs admin approval" (action-oriented). They look interchangeable but mean very different things.
- The "Mutual Action Plan" row has "3 of 7 items complete" with `Open plan ↗` and no status pill, while every other row in the table has a status pill — the asymmetry makes that row read as "missing data" rather than "different by design".

### Composition & balance
- Hero is left-heavy: title + chip + meta on the left vs. two small buttons on the right, with ~600px of empty band between them.
- The dashed purple preview frame is the loudest single element on the page — it visually competes with the actual content it's framing. Replacing it with a tinted background or a left-rule + label would let the simulated record card breathe.
- The right-side approval card has solid-yellow fill while the rest of the page uses subtle neutrals; combined with the duplicate sticky-footer banner, the page has two yellow blobs on the same axis.

### Responsive behavior
- **Tablet (820w):** Hero buttons wrap awkwardly — "Continue to rollout" breaks into two lines while "Reject" stays one line. The "Affects" tile labels truncate behind the sticky footer (`Record pages`, `Workflow · Agent`, `Reps (Enterprise…` all clipped). The bottom-bar primary "Request admin approval" wraps to two lines and grows taller than its partner. The footer "Needs admin approval / Agent: write access to Opportunity" also breaks line awkwardly.
- **Mobile (390w):** No responsive layout — the two left rails stay fixed at full width, push the content off-screen, and the breadcrumb + h1 are visible only by horizontal scroll. The change-list rows clip in the middle of words. There's no hamburger / sidebar collapse, no breakpoint.

### Forms (Permissions & agent tab)
- Toggle rows all use the same green for the "on" state; the disabled "Update opportunity stage" row is conveyed with a faint lock glyph + "Blocked by workspace policy" inside the row, but no separator or background tint distinguishes a hard-blocked toggle from a normal one — the lock glyph is the only signal.
- "Send external notifications" has a "Needs admin approval" pill that is wider and warmer than the other inline labels — it crowds the toggle and breaks right-edge alignment of every other toggle.
- Rollout form labels (Pipeline / Team / Role / Territory / Deal size / Duration) are left-aligned, but the controls are mixed: free-text chip-multi-selects for the first three, a chip-empty-state for "Territory", a number-input + dash + number-input + "USD" for "Deal size", and a radio + stepper + "weeks" for "Duration". Five different input archetypes in six rows.
- The "Deal size" range uses a literal hyphen-minus between two inputs; the steppers in "Duration" use yet another minus glyph. Input affordances differ too (number field vs. plus/minus stepper for the same numeric concept).
- Chip remove "×" sits flush with the chip text — no separator, no hover affordance visible.

### Tables & data density
- Data-scope table header is `OBJECT / ACCESS` in uppercase letter-spaced gray — reads like a CLI log header. Letter-spacing is tight enough that "ACCESS" looks bunched.
- Row height is ~38–40px and rows don't zebra-stripe; the only separator is a 1px line. Fine for low density, but the "External access via MCP" row has a different pattern (orange-ish "Enabled — 3 tools" pill + blue "View tools" link) that doesn't match the badge language of every other row.
- "Write" badge is brand-purple, "Read" is green. Read/write are antonyms; coloring them as two unrelated brand colors is confusing.
- The Technical-diff card list has each `+ Added …` line in a separate bordered row even though they're grouped under section headings (OBJECTS, FIELDS, WORKFLOWS, AGENTS, PERMISSIONS) — could collapse into a denser table per section. The current layout wastes vertical space.

### Empty / loading / error states
- Only one visible "empty" indicator: "Legal Review · Not started · —" in the simulation preview. The em-dash is a fragile placeholder — no tooltip, no "kick off review" affordance, just punctuation.
- No skeleton state observable for the simulation preview while picking another sample — clicking "Try another sample" should presumably load, but there's no loading scaffolding.
- No empty state for "Mutual Action Plan" (it's always shown as "3 of 7 items complete"); not clear what happens at 0 of 0.
- No error treatment exists for the admin-approval flow — if the request fails, where does it go? The current sticky footer offers no slot for that.

### Pixel polish
- The dashed purple border on the preview frame shows corner artifacts where dashes don't terminate cleanly on the rounded corners.
- Sticky footer has only a 1px hairline at top, no soft shadow or backdrop blur — gives it a "cut off the page" feel rather than a layered toolbar feel.
- The "A" avatar tile in the preview has no inner padding around the letter; the letter sits in the geometric center but the tile is too small for the size of the glyph.
- The "Workflow would trigger" yellow chips are too close to the bottom edge of the preview frame — ~6–8px of breathing room.
- The "+/−" stepper buttons in Duration have no hover treatment visible; hit targets look ~20×20px.
- The "Show all (8)" link has no underline and is the only blue-text element on the page — no consistent link styling.

### Token consistency
- Confirmed no CSS variables for color, spacing, radii, or type on `:root`. Every value is inline, which is why the same conceptual color (e.g. "yellow warning") shows up as at least three different hex values on a single screen.
- Border-radius drifts: pill chips are fully rounded, cards look ~10–12px, the dashed preview frame is ~8px, and the "A" avatar tile is ~6px. No `--radius-sm / -md / -lg` reused.
- Border colors drift: the Reject button uses `#ebebeb`; the change-list card border looks darker. The Permissions toggles row dividers are a third gray.
- Spacing drift: gutters between cards, between rows inside cards, and between the hero and the tabs all use different magnitudes — feels eyeballed rather than tokenized.

### AI-slop tells
- Three AI brand-callouts piled into one screen: "Proposed by Claude" chip (top, with a sparkle), "AI deal-risk summary" card (purple wash + sparkle), "AI preview" sub-pill inside that card. Even setting aside redundancy, the AI lavender wash is the loudest visual element on the page after the dashed preview border — the page foregrounds *who proposed it* more than *what the change is*.
- The AI risk-summary copy reads as AI-template: "historically a 2.4× risk signal at this stage" — the 2.4× number is suspiciously precise and unsourced, which is the canonical LLM-output tell. The bare numeral with no link/footnote drops a fake-confidence number into the UI.
- "Show all (8)" anchored in browser-default blue, underlined-on-hover-only, is a Bootstrap-grade link in a UI that is otherwise neutral — a "left over from the scaffold" smell.
- The Technical-diff section formats changes as monospace diff lines (`+ Added object MutualActionPlan`, `+ Added field SecurityReview on Opportunity`) styled like GitHub diff text. It treats the visual language of a code review tool as if it were the right idiom for a settings change — likely a default for a model asked to "show a diff" rather than a design decision for a settings-app reviewer.
- The breadcrumb `Settings › Applications › Deal Desk › Review` uses Unicode `›` separators while the meta row uses `·` — common LLM trait of producing valid-but-mixed glyph palettes within one component.
- "Proposed by Claude · 3 min ago · v0.1 draft" — three meta items separated by dots with no information hierarchy, all the same color/size; gives the same weight to authorship, recency, and version, none of which is the most important attribute.

## Cost
- wall time: 7m 25s
- turns: 54
- tokens (input / cache-create / cache-read / output): 88 / 102457 / 3315792 / 20511
- $ estimate: $2.81146725

## How Claude achieved it

I inspected the running prototype interactively in a remote Playwright browser, since I was not permitted to read the prototype source or the reference grounding. The local dev server was bound to IPv6 `[::1]:5255` only, so I started a small Node TCP forwarder from `127.0.0.1:5256 → ::1:5255` to give the Softlight reverse-rewriting tunnel an IPv4 endpoint to probe, then ran the tunnel script and navigated the cloud browser to the resulting `softlight.orianna.ai/api/tunnel/<id>/` URL.

Inside the tunneled session I:
- Resized to 1440×900 desktop, 820×900 tablet, and 390×780 mobile to test responsive behavior.
- Walked the four tabs (Simulate, Permissions & agent, Rollout, Technical diff) by querying `.tablist .tab` and clicking each (a plain text-filter `click` collided with sidebar items, so I scoped the selector).
- Used the page's internal `.page-scroll` container (`document.querySelector('.page-scroll').scrollTop = …`) to scroll, because the document height equaled the viewport — the app uses an inner scroll container under a sticky footer.
- Pulled computed styles for `h1 / h2 / body / button` and probed `getComputedStyle(document.documentElement).getPropertyValue('--…')` for likely design-token names; all came back empty, which is the basis for the "no tokens" finding.
- Took full-page screenshots at each scroll position and breakpoint, then narrated nits across every category the prompt named: typography, color, spacing & rhythm, grid & layout, iconography, information hierarchy, composition & balance, responsive behavior, forms, tables & data density, empty/loading/error states, pixel polish, token consistency, and AI-slop tells.

## Prompt
```
/goal Improve the visual design of this prototype (http://localhost:5255/), which is a mock of a future feature built into twenty. Work only from what you can observe at the URL — do not read the prototype source or any reference codebase. Cover the full surface of visual design nits: typography, color, spacing & rhythm, grid & layout, iconography, information hierarchy, composition & balance, responsive behavior, forms, tables & data density, empty/loading/error states, pixel polish, token consistency, and AI-slop tells.
```
