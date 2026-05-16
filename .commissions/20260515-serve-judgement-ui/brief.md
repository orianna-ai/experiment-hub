### TASK BRIEF: Serve Judgement UI (20260515-serve-judgement-ui)

**Requester**: Miles McCrocklin (orianna-ai / Softlight)
**Date**: 2026-05-15
**Repo(s)**: `experiment-hub`
**Requester's branch when /commission ran**: `main`

**Outcome**: Replace the local-only `bin/exp-ui.js` workflow with a hosted service so non-technical users (team members and hired consultants) can review AI design experiments and write judgements in a browser, without cloning the repo, installing pnpm, or running anything locally. Feature parity with the current Overall + Judgement tabs of `bin/exp-ui.js` is the MVP target; judgements collected through the hosted UI must be visible to the rest of the team.
**Why now**: Consultants are being onboarded to write judgements on **hundreds of experiments over the next month**. Current `bin/exp-ui.js` requires a checked-out repo and `pnpm`, which is a hard blocker for non-technical reviewers — every day this isn't hosted is a day consultants can't be put on the work.
**Acceptance check**: Send the hosted URL + a sign-in to someone who has never opened this repo. They sign in, judge one experiment end-to-end, save it. The judgement is visible to the requester from a different browser/account.
**Stakes**: The whole research program assumes humans-in-the-loop judging at scale. Without a hosted UI in the next month, consultant onboarding stalls and the experiment backlog (already 27+ unlabeled in `experiment/`) grows unjudged.

### Tried so far

`bin/exp-ui.js` (54KB single-file Node HTTP server, committed 2026-05-13) is the existing attempt. It works locally — launches a Vite dev server per experiment on `:6100+` and serves a two-tab UI on `:5050` (Overall = compare grid, Judgement = labeling workflow with autosave to `experiment/*/judgement.md`). The README documents the UX in §"The UI (`bin/exp.sh ui`)" (line 87+) and the data model in §"judgement.md" (line 161+). Failure mode: requires the repo on disk and a working pnpm install — non-technical users can't get past step 0. No hosted version has been attempted.

### Why human + AI (vs AI alone)

Architectural judgment + codebase taste / convention adherence. The non-trivial call: `bin/exp-ui.js` launches a Vite dev server per experiment to serve live `cp_of_*/` working copies. That doesn't translate to a hosted environment — running dozens of long-lived dev servers in production is not the move. The supplier has to choose between pre-built static bundles per experiment, pre-rendered screenshots only, on-demand build-and-cache, a sandbox runtime, or something else, and the choice has long-tail implications for storage cost, build time, deploy size, and how new experiments roll out. That's not a call to delegate to an AI agent alone. On top of that, `CLAUDE.md` encodes research-harness conventions (read-only `cp_of_*` / `origin/` / `grounding/`, blind-mode silence for `m3-*`) that a generic AI agent won't infer from best-practices.

### Constraints

- **Surfaces (codebase areas)**:
  - `bin/exp-ui.js` — current local UI; canonical behavior spec
  - New top-level directory for the hosted app — name and location TBD by supplier (e.g. `web/`, or a sibling repo in `orianna-ai`)
  - Data inputs (read): `experiment/*/judgement.md`, `experiment/*/state.json`, `experiment/*/meta.json`, `experiment/*/cost.json`
  - Static assets to serve in production: `experiment/*/cp_of_*/` working copies and `origin/*` — this is the hard part of the architecture
  - `README.md` and `CLAUDE.md` will likely need a "hosted UI" section once shipped
- **Out of scope**:
  - Do not modify content of `experiment/*/cp_of_*/` — frozen research artifact (see `CLAUDE.md` hard rule #1)
  - Do not modify content of `origin/` — read-only (hard rule #2)
  - Do not modify `grounding/twenty` — read-only reference (hard rule #3)
  - For `m3-*` experiments, do not expose `cp_of_*` or `grounding/` paths in any UI text, tooltip, source-view, or error message — the blind-experiment contract (hard rule #6)
  - Do not re-architect `bin/exp.sh` or `bin/init.sh` while building this — they have their own contracts (hard rule #4, #7)
  - Do not add features beyond parity with `bin/exp-ui.js` (Overall + Judgement) for the MVP — defer enhancements
  - **Permitted breakage**: `bin/exp-ui.js` may be broken or removed *if and only if* the hosted replacement ships within ~24h of the breakage. Don't leave the local UI broken for longer than that — it's the current daily-driver.
- **Deadline**: No hard date, but consultants are queued for "within the next month" (so target ~3 weeks out from 2026-05-15, i.e. by ~2026-06-05, to leave a buffer for onboarding the consultants themselves).

### Collaboration model

From Q6 — how this task's collaboration differs from the standard procedure with this customer, plus accelerators the requester offered.

- **Standard from onboarding**: Solo customer (Miles self-reviews + self-merges), async-friendly, no formal CI/checks or branch protection. Decision context lives in this repo (README + CLAUDE.md); no slack/notion/figma channels.
- **Delta for this task**: No delta — standard collaboration applies. Async, drop a PR or a branch when ready, Miles will review and ship.
- **Speed-up accelerators**:
  - `bin/exp-ui.js` is the canonical reference implementation — every feature, layout, and behavior is in that single 54KB file
  - `README.md` lines 87–104 describe the UX in plain English
  - `README.md` lines 161+ describes the `judgement.md` data model
  - Data schema is all file-system (`judgement.md`, `state.json`, `meta.json`, `cost.json`) — trivial to mirror in a DB
  - `CLAUDE.md` "Hard rules" section is short and worth reading before any design call

### External context

- `README.md` §"The UI (`bin/exp.sh ui`)" (line 87+) — current UX in prose
- `README.md` §"`judgement.md`" (line 161+) — data model in prose
- `bin/exp-ui.js` — 54KB canonical spec (the source-of-truth for current behavior)
- `CLAUDE.md` "Hard rules" — non-negotiable constraints; read before scoping
- No external context outside the repo. No slack threads, notion docs, figma files, or related PRs (codebase is self-contained per onboarding).

### Requester effort estimate

**~2–3 days of directed AI work** for an MVP — a Vercel-deployable Next.js (or equivalent) app with parity-of-features vs `bin/exp-ui.js`, basic sign-in, and a single-tenant data store that mirrors the file-system schema. Could blow to ~1 week if RBAC, audit logging, or judgement-history versioning end up in scope. Framed as direction + architecture + verification time, not keystrokes — the architecture call (how to serve `cp_of_*/` static assets in production) is the load-bearing question; everything else is wiring.

### Decomposition (the supplier fills this in during the onboarding pass)

| # | Step | Owner | Effort (h) | Acceptance |
|---|------|-------|------------|------------|
| | | | | |

*(The supplier populates this in `onboard-task-v0.md` before starting work. The decomposition is part of the onboarding-pass delta back to the requester.)*

### Risk & unknowns (the supplier fills this in during the onboarding pass)

*(The supplier populates this in `onboard-task-v0.md`. Captures what's ambiguous in the brief, what's hidden scope the supplier is seeing that the requester may not have realized, what would push back on if I had a moment to think about it.)*

### Effort estimate (the supplier fills this in during the onboarding pass)

- Optimistic: TBD
- Realistic: TBD
- Pessimistic: TBD

### Scoped brief (the supplier writes this during the onboarding pass)

*(One-paragraph statement of work for the supplier to execute against. Generated from the questions above + the supplier's own scoping pass. The scoped brief is the contract the supplier works to.)*

### Auto-detected vs requester-confirmed

- **Primary repo**: auto-detected from `git rev-parse --show-toplevel` (`experiment-hub`)
- **Additional repos**: none — single-repo scope confirmed via Q4
- **Branch**: auto-detected (`main`) — informational only
- **Why human + AI**: drafted from Q1 + discovery (architecture call around live `cp_of_*/` serving + `CLAUDE.md` conventions), requester-accepted via Q2
- **Tried so far**: requester-corrected — script is `bin/exp-ui.js` (not `bin/ui.js` as initially stated, not `comparison/` as auto-suggested); no further attempts beyond the local script
- **Surfaces**: drafted from Glob/Grep + reading `bin/exp-ui.js`, requester-accepted via Q4
- **Out-of-scope items**: drafted from `CLAUDE.md` hard rules + scope-creep patterns; requester edited Q7 to permit breaking `bin/exp-ui.js` as long as the hosted replacement ships within ~24h
- **Collaboration model**: drafted from onboarding (solo / async / self-merge), requester-accepted via Q6
- **External context items**: drafted from README sections + `CLAUDE.md`; no external surfaces flagged
- **Requester effort estimate**: drafted from surfaces + sensitivity, requester-accepted at ~2–3 days via Q9

### Pre-handoff checklist (requester completes before sending to the supplier)

- [ ] No `[REQUESTER: ...]` placeholders in this brief (External context is fully filled — codebase is self-contained per requester)
- [ ] Single-repo, no extra org permissions needed
- [ ] Brief committed (or shared link to the supplier)
- [ ] Speed-up accelerators are deliverable: `bin/exp-ui.js`, README sections, `CLAUDE.md` already in the repo — nothing else to gather

### Handoff

- Brief committed at: `.commissions/20260515-serve-judgement-ui/brief.md`
- The supplier's onboarding-pass response will land at: `.commissions/20260515-serve-judgement-ui/onboarding.md` (the supplier writes; sent back to requester before any code is written)

### Prompt feedback (requester fills after the task is delivered)

After the supplier delivers:

- What in the /commission intake was confusing or missing?
- What would you have wanted to be asked but wasn't?
- Was the question structure (problem → why-human+AI → success → surfaces → urgency → collaboration → out-of-scope → context) the right structure, or did you find yourself wanting to answer something else first?
- Did the drafted answers (Q2-Q8) save you time, or did the drafts mislead you into accepting something wrong?
- One concrete change for the next /commission version.
