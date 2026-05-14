# Experiment: goal-skill-call-p1

## Original prompts

1. `Start this prototype on 7777`
2. `/goal Improve the spacing/aesthetic of this prototype (http://localhost:7777/), which is a mock of a future feature built into twenty (live codebase is at ../twenty for reference to use as a baseline to adhere to).`

Prototype mock of a "Deal Desk" app review/rollout screen for Twenty, used to test how Claude Code follows a `/goal` directive that requires understanding Twenty's design baseline.

## Stack

- Vite 8 + React 19 + TypeScript
- Single `src/App.tsx` + `src/App.css`, no UI library
- Dev server: `pnpm vite --port 7777`

## What the prototype is

A four-tab settings page (`Simulate`, `Permissions & agent`, `Rollout`, `Technical diff`) describing a hypothetical AI-generated workspace app. Includes:

- Twenty-style left rail + settings sidebar
- Breadcrumb topbar
- Summary card (changes list + trust signals: policy banner, stat tiles, MCP disclosure)
- Tabs with mock record preview, capability toggles, rollout filters, and a diff table
- Sticky footer with approval CTA

## Goal worked

> Improve the spacing/aesthetic of this prototype, using `../twenty` as design baseline.

## Twenty design tokens used as reference

Read from `twenty/packages/twenty-ui/src/theme/constants/`:

- `spacingMultiplicator: 4` → 4px scale (`spacing[6]=24`, `spacing[8]=32`)
- `BORDER_COMMON.radius`: `sm=4`, `md=8`
- `FONT_COMMON.size` against `html { font-size: 13px }` base
- `BACKGROUND_LIGHT`: primary=gray1 (#fff), secondary=gray2, tertiary=gray4 — body uses tertiary, surfaces use primary
- `H2Title`: 13px semibold, `margin-bottom: spacing[4]` (16px)
- `Tag`: `border-radius: sm`, `padding: 0 spacing[2]`, `gap: spacing[1]`
- `SettingsPageContainer`: `padding: spacing[6] spacing[8] spacing[8]`, `gap: spacing[8]`

## Changes made (CSS-only, no structural refactor)

- **Canvas**: page background → `gray3` so white cards visibly pop
- **Cards**: bg → primary white, radius `md` → `lg` (8px), padding standardized at 24px
- **Rhythm**: section gap 24 → 32px; row padding 8 → 12-16px with clean first/last edges
- **Tags**: pill → 4px radius to match Twenty's Tag component
- **Typography**: section titles 13 → 14px with 16px bottom margin; body line-height 1.5
- **Interactive**: hover states on tabs, sim-opps, disclosure, unit-pill, stepper
- **Cleanup**: removed 5 inline `style={{...}}` hacks, replaced with named classes

## Cost: time, edits, tokens

### Wall-clock time

The HMR log on the background Vite task gives a hard timestamp for every edit that hit the file. For the goal phase:

| | Time (local) |
| --- | --- |
| First HMR update after `/goal` | 10:48:43 AM |
| Last HMR update | 10:53:10 AM |
| **Total edit window** | **~4m 27s** |

That's the model-active window for the spacing pass itself. The reading phase before the first edit (Twenty theme constants, settings page, Tag component) added roughly another minute, so call it **~5–6 minutes end-to-end** for the goal directive. Subsequent prompts to write this summary added a few more minutes.

### Edit volume

- **34** HMR updates total (28 to `App.css`, 6 to `App.tsx`)
- Roughly 20 logical `Edit` calls — some HMR updates correspond to single Edit calls, others coalesce
- One `Write` (for this summary file)
- One `tsc --noEmit` to confirm types still passed

## Notes on the session

- Hooks injected ~6 "must read official docs" skill prompts for unrelated patterns (bootstrap, Next.js, react-best-practices). All were inapplicable — pure CSS spacing task on a Vite/React project. Skipped each with brief justification.
- Sandbox auto-classifier denied `vite --host 0.0.0.0`; rebound to localhost-only.
- Playwright MCP runs in an isolated network namespace; could not reach `http://localhost:7777`. Visual verification deferred to user.
- One retry-loop notice fired (3 short tool results in a row from connection probes); was a transient sandbox issue, not a real loop.

## What Claude was actually doing behind the scenes (after `/goal`)

A walkthrough of the harness mechanics that fired during the spacing-pass itself.

### The `/goal` Stop hook

Typing `/goal <text>` installs a session-scoped **Stop hook**. When the model tries to end a turn, the harness evaluates the hook against the condition string ("Improve the spacing/aesthetic …"). If the condition doesn't read as satisfied, the turn is blocked from terminating and a directive is re-injected telling the model to keep working. The hook auto-clears once the condition holds. That's why the user's instruction included "do not pause to ask the user what to do" — pausing would be a no-op anyway.

### Hook-injected "skill suggestions" on every Read

The CLI's `PreToolUse` hook pattern-matched the path of every file I read against a skill manifest:

- `twenty/.../components/SettingsPageContainer.tsx` → `react-best-practices` suggestion
- `twenty/.../pages/settings/SettingsProfile.tsx` → `nextjs` suggestion

Each match injected a "MANDATORY: read these docs before writing any code" `<system-reminder>`. The suggestion is advisory — the model decides whether to actually invoke `Skill(<name>)`. Both were clearly wrong (Twenty is a Vite/React monorepo, not Next.js; the task is pure CSS spacing, not React API churn) so I declined each in one line and continued. The cost is roughly ~300 tokens of injected reminder per false-positive Read.

### Token Optimizer nags

A separate `UserPromptSubmit` / `PreToolUse` hook ran "Token Optimizer" checks. Two notable injections during this phase:

- A **retry-loop warning** after three short tool results in a row (the Playwright connection probes + curl). It was a false positive — same approach, different diagnostic command, not an actual loop.
- Repeated **TaskCreate reminders** ("the task tools haven't been used recently"). I ignored them: the work was linear (read theme tokens → edit CSS), short enough that a TODO list would have added noise rather than structure.

### Sandbox / permission classifier

This phase didn't trigger any new denials, but the classifier was active. Edits to `App.css` and `App.tsx` pass through unchallenged because they're local file writes. If I'd tried to push, restart on a privileged port, or open a network socket, the classifier would have re-prompted.

### MCP playwright isolation

After `/goal` I tried twice to verify the result visually:

1. `mcp__plugin_softlight_playwright__create_session` succeeded.
2. `browser_navigate` to `http://localhost:7777/` failed with `ERR_CONNECTION_REFUSED`, while `curl` from Bash got `200 OK`.

The Playwright MCP server spawns its browser in an isolated network namespace that can't see the host's `localhost`. There's no transparent host-port forwarding. Visual verification got deferred to the user; the type-checker (`tsc --noEmit`) and Vite's HMR log were the only feedback signals I had.

### Background task channel

Vite was already running in the background from before `/goal` (task `bmf7gqpl3`). During the spacing pass, the harness kept appending HMR lines to its output file:

```
10:48:43 AM [vite] (client) hmr update /src/App.css
10:48:50 AM [vite] (client) hmr update /src/App.css
…
```

The system surfaced those modifications as `<system-reminder>` notices on the file. That's the channel by which I confirmed each CSS edit compiled cleanly without re-running the dev server.

### Plain-tool work

The actual edit loop was straightforward and used only foreground tools:

1. `Read` Twenty's theme constants (spacing multiplier, border radius, font scale, background palette, `H1Title` / `H2Title` / `Tag` / `SettingsPageContainer`).
2. ~20 sequential `Edit` calls against `src/App.css` (and a few small ones against `src/App.tsx` to remove inline `style={{…}}` hacks).
3. `pnpm exec tsc --noEmit` once to confirm types still pass.
4. Tail of the Vite background output file to confirm HMR success.

No subagents, no parallel calls, no skills invoked, no memory writes. Linear CSS pass on a single file.
