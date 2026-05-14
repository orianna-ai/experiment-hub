# softlight-judge

Local harness for evaluating how well a coding agent catches visual design nits across prototypes — and a UI to compare, judge, and label the results.

## What's here

```
origin/                       prototypes (read-only baselines)
  deal-desk-prototype-1/
  deal-desk-prototype-2/
grounding/                    reference codebase the prototypes live inside
  twenty/
experiment/                   one dir per run — auto-managed by bin/exp.sh
  <id>-<origin>/
    .env                      PORT=<allocated port>
    prompt.md                 substituted prompt sent to claude
    cp_of_<origin>/           agent's working copy (it edits here)
    screenshots/before.png    captured from origin
    screenshots/after.png     captured from the working copy
    findings.md               agent narrative + cost section
    judgement.md              human verdict (autosaved from the UI)
    state.json                {not-started | running | finished | failed}
    cost.json                 wall_ms, turns, tokens, $
    .run.json / .run.err      raw claude headless output
initial-experiments/          one-off explorations, kept for reference
bin/
  exp                         the main runner (subcommands below)
  exp-ui                      the comparison + judgement UI
  run-m2                      batch driver for the M2 sub-experiments
EXPERIMENTS.md                experiment catalog + prompt registry
```

## Why is so much near-identical code checked in?

Every `experiment/<id>-<origin>/cp_of_<origin>/` is a full copy of the prototype with one agent's edits on top. Across the M2 sweep alone that's ~40 mostly-redundant trees in git. **This is intentional.**

The product of this repo is *judgements on AI prompts*, not a shippable application. Each working copy is the **primary research artifact** — the literal output an agent produced from a given prompt, against a given prototype, at a given point in time. Diffing two `cp_of_*` trees is how we compare prompts; rerunning isn't reproducible (non-deterministic agents), so we preserve the run rather than the recipe.

Consequences we accept:
- The repo is large and grows unboundedly. Fine — it's a research log, not a deployable.
- There's no DRY: every `cp_of_*` re-checks-in `src/`, `package.json`, etc. Trying to dedupe would destroy the comparison signal.
- `grounding/` and `node_modules/` are gitignored because `bin/init.sh` re-pulls them deterministically. Working copies are not — they're irreproducible.

If you're tempted to "clean this up," don't. Read this section again.

## Quick start

```bash
# 1. List the experiments registered in EXPERIMENTS.md
bin/exp.sh ids

# 2. Run one end-to-end (unattended — claude -p)
bin/exp.sh run m1-generalized deal-desk-prototype-1

# 3. Open the UI
bin/exp.sh ui                          # http://localhost:5050
```

## What `bin/exp.sh` does

| Subcommand | Purpose |
|---|---|
| `new <id> <origin>` | scaffold `experiment/<id>-<origin>/` — port, working copy, prompt, findings stub |
| `prep <origin>` | snap `origin/<o>/.cached-before.png` once so future runs skip re-snapshotting |
| `before <name>` | capture `screenshots/before.png` from origin |
| `serve <name>` | foreground vite dev server on the working copy |
| `after <name>` | capture `screenshots/after.png` from the working copy |
| `run <id> <origin>` | full unattended pipeline: new → before → vite → `claude --print` → after → cost.json → state=finished/failed |
| `prompt <id>` | print the substituted prompt for any experiment id |
| `ids` | list all experiment ids registered in EXPERIMENTS.md |
| `state <name> <state>` | manual state override (`not-started`/`running`/`finished`/`failed`) |
| `cost <name>` | rebuild `cost.json` from `.run.json` |
| `ui` | launch the side-by-side comparison UI on `:5050` |

Env vars for `run`:
- `EXP_MODEL=opus|sonnet|haiku` — model alias (default: claude's session default)
- `EXP_BUDGET_USD=5` — dollar cap per run

Dependencies: `pnpm`, `curl`, `awk`, `jq`, `python3`, `playwright` (auto-installed via `npx`), and the `claude` CLI on `$PATH` for unattended runs.

### Blind mode (M3)

Any experiment id starting with `m3-` runs in blind mode: `--add-dir cp_of_*` and `--add-dir grounding/` are stripped from the claude invocation, and the preamble explicitly forbids reading source. Used to test how much of the agent's output came from codebase access vs prompt alone.

> ⚠️ **The existing `m3-*` runs may not have executed correctly.** Their outputs are suspect — the blind-mode contract may have leaked (path hints in preamble/skill text, descriptions in `meta.json`, or the agent reading paths it was meant to be blind to). Do not draw conclusions from current `m3-*` results until this is resolved: audit the recorded prompts and tool calls, confirm `--add-dir` stripping fired, and re-run any tainted experiments before treating their judgements as load-bearing.

## The UI (`bin/exp.sh ui`)

`http://localhost:5050` — two tabs.

**Overall** — per-origin sections, each with the origin thumbnail (click to open the original in a side panel) and a grid of experiment cards (one per run). Cards show after-screenshot, state badge, cost chips, and the human judgement text if labeled. Compact placeholder cards for `running` / `not-started` states sit at the bottom of each origin block.

Click any card → side panel with:
- header chips (state, origin, port, duration, turns, tokens, $)
- judgement editor (autosaves to `judgement.md`)
- collapsible `findings.md` rendered as markdown
- live iframe of the working copy, with an Original / Finalized toggle
- 1-Hz flicker compare between before.png and after.png

**Judgement** — workflow for labeling. Pick a prototype on the left → list of unlabeled-finished experiments appears → pick one → editor opens with judgement textarea on top, side-by-side iframes of original and finalized in the middle (resizable column splitter + vertical resize handle), flicker compare beneath, and the collapsible findings at the bottom. `save & next →` chains to the next unlabeled experiment.

Each experiment derives its state as `labeled` whenever `judgement.md` has content; otherwise it shows its lifecycle state (`finished`, `running`, etc.). Filters at the top of the overall tab let you slice by state and by prototype.

## Batching across many runs

```bash
# Every M2 sub-experiment, 6-wide pool, against one origin
bin/run-m2.sh deal-desk-prototype-1

# Custom batch — every id starting with m2-, both origins, one at a time
for id in $(bin/exp.sh ids | grep '^m2-'); do
  for o in deal-desk-prototype-*; do
    bin/exp.sh run "$id" "$o"
  done
done
```

`bin/run-m2.sh`:
1. Caches `origin/<o>/.cached-before.png` once
2. Sequentially scaffolds all 18 M2 experiment dirs (avoids port-allocation race)
3. Runs them six at a time via `xargs -P 6`

## File contracts

### `findings.md`

Captures what we learned from running the experiment — not a list of design nits the agent surfaced. Five sections in fixed order:

```markdown
# <experiment-id> · <origin>

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
<Agent's self-assessment of the run: how much of the goal it hit, what it missed, why.>

## Cost
- wall time: <e.g. 14m 22s>
- turns: <n>
- tokens (input / cache-create / cache-read / output): <…>
- $ estimate: <…>

## How Claude achieved it
<Process notes: which tools/skills it leaned on, where it spun, and — most importantly —
what should be built directly into the harness instead of leaning on a skill.>

## Prompt
<The exact prompt sent. Note any deviations from the EXPERIMENTS.md template plus a
one-line take on whether the prompt itself was valuable.>
```

Rules:
- The five headings are fixed and ordered.
- The harness auto-fills Screenshots, Cost, and Prompt. **Goal achievement** and **How Claude achieved it** are both agent-authored — the agent fills them at the end of the run, per the preamble in `bin/exp.sh cmd_run`. Human verdicts live in a separate `judgement.md` (see below).
- M3 blind-mode runs sometimes decompose "Goal achievement" into H3 subsections (Typography / Color / Spacing / …). This is accepted; the contract only fixes the five H2 headings.
- Screenshots: `screenshots/before.png` from origin, `screenshots/after.png` from the working copy, both default 1440×900 viewport. `VIEWPORT=375,812` env override for responsive-scoped runs.

### `judgement.md`

Human verdict on the run, autosaved from `bin/exp.sh ui`. Freeform markdown — no fixed structure. The UI's overall view derives `state = labeled` whenever `judgement.md` has non-empty content; the underlying `state.json` lifecycle is preserved underneath.

### Recovery

Each run also writes `cost.json` (structured) and `state.json` (lifecycle marker). If a run dies mid-flight (rate limit, monitor timeout, etc.) and leaves no `after.png` / `cost.json`, the recovery pattern is:

If a run dies mid-flight (rate limit, monitor timeout, etc.) and leaves no `after.png` / `cost.json`, the recovery pattern is:

```bash
# 1. Find lingering processes for the experiment
ps aux | grep '<experiment-name>'
# 2. Kill the wrapper(s) — its EXIT trap will take down vite
# 3. Briefly relaunch vite on the working copy and snap after.png
bin/exp.sh after <name>
# 4. Mark finished
bin/exp.sh state <name> finished
```

## EXPERIMENTS.md

The experiment catalog. Each `### \`<id>\`` heading owns a `> /goal …` quote block that `bin/exp.sh` extracts and substitutes (`<URL>`, `<GROUNDINGS>` are the only template slots).

### Adding a new experimental prompt

1. **Pick an id.** Format: `m<N>-<slug>` (e.g. `m2-foundational-spacing`, `m5-ai-detection`). The `m<N>-` prefix groups related experiments and is what `bin/run-m2` and friends key off of. Blind-mode runs must start with `m3-` — that prefix triggers the no-source preamble in `bin/exp.sh cmd_run`.

2. **Append a new `### \`<id>\`` block to `EXPERIMENTS.md`.** Put it under the right `## M<N> — …` section, or add a new section if it's a new milestone. Structure:

   ```markdown
   ### `m4-design-debt`

   One-line description of what this experiment is measuring (optional but encouraged — shows in catalog skims, not extracted into the prompt).

   > `/goal` <The prompt body. Use `<URL>` where the working-copy URL should go and `<GROUNDINGS>` for the path to grounding/twenty. These are the only two template slots.>
   >
   > <Multi-paragraph prompts are fine — consecutive `>` lines join with spaces. A bare `>` (empty quote line) is treated as a paragraph break and collapses to a single space.>
   ```

   `bin/exp.sh prompt <id>` extracts only the `>` quote block — descriptions and prose between the heading and the quote are ignored by the runner.

3. **Sanity-check the extraction:**

   ```bash
   bin/exp.sh ids | grep '<id>'        # appears in the registry
   bin/exp.sh prompt '<id>'             # prints the substituted prompt
   ```

4. **Scaffold once, eyeball, then run:**

   ```bash
   bin/exp.sh new  '<id>' deal-desk-prototype-1   # creates experiment/<id>-<origin>/
   cat experiment/'<id>-deal-desk-prototype-1'/prompt.md   # confirm the substituted prompt reads right
   bin/exp.sh run  '<id>' deal-desk-prototype-1   # full unattended pipeline
   ```

5. **Fan out across both prototypes** once the prompt reads cleanly:

   ```bash
   for o in deal-desk-prototype-1 deal-desk-prototype-2; do
     bin/exp.sh run '<id>' "$o"
   done
   ```

Things to keep in mind:

- **Both `<URL>` and `<GROUNDINGS>` are optional.** Omit them if the experiment doesn't need them — but most do.
- **No fenced code, headers, or HTML inside the `>` block.** The extractor strips backticks and joins lines; complex markdown will get flattened.
- **For blind-mode (`m3-*`) prompts**, don't reference file paths or `cp_of_*` in the prompt text — the harness already forbids source access in its preamble; mentioning paths in the prompt undermines the blind condition.
- **Don't re-use an existing id** — `bin/exp.sh new` will refuse if the experiment dir already exists. Pick a new slug.
