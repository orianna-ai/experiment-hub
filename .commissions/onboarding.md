# /commission onboarding — orianna-ai (Softlight)

Persistent customer context for `/commission`. Loaded into model context on every /commission task invocation in this repo. Edit directly anytime; delete to re-run onboarding from scratch.

**Created**: 2026-05-15 by Miles McCrocklin
**Repo this onboarding lives in**: `experiment-hub` (org: `orianna-ai`)

## Supplier

- **Name**: Miles
- **Contact**: github.com/milroc

## Customer

- **Org / team**: orianna-ai (org display name: Softlight)
- **Primary contact**: Miles McCrocklin (miles.mccrocklin@gmail.com)
- **Other contacts**: (none — single contributor on this repo as of onboarding)

## Project context

A research harness for evaluating how well AI coding agents catch visual design nits in UI prototypes, with a UI to compare, judge, and label the results. The `experiment/*/cp_of_*/` trees are the primary research artifact (frozen agent outputs), not dead code.

## Repos in scope

Repos in `orianna-ai` that the supplier is authorized to commit to. Used by `/commission`'s Repo-scope check when a task doesn't obviously fit the current repo.

- `experiment-hub` — this repo; visual-design-nit experiment harness
- *(Other org repos exist and may become in-scope later. Candidates that look related per onboarding scrape: `figma-plugin` (figma plugin for evaluating agent results), `claude-plugin` + `claude-plugin-integration-tests`, `snapdom` (DOM capture engine), `orianna` (monorepo). Add explicitly here when authorizing.)*

## Availability

When the requester is reachable for sync vs. async questions.

- **Standup / sync time**: (blank — no signal in repo; solo project)
- **Slack hours**: (blank — no signal)
- **Sync vs async preference**: (blank — to be filled by requester)
- **Slowest-case response time**: (blank — to be filled by requester)

## Decision context lives at

- **Slack channels**: (none flagged in repo)
- **Docs / wiki**: (none flagged in repo — `README.md` + `CLAUDE.md` carry repo-level guidance)
- **Design tools**: (none flagged)
- **Ticketing**: GitHub Issues on this repo (currently 0 open issues)
- **Other**: `CLAUDE.md` at repo root encodes hard rules — read it before any change

## Review process

- **Reviewer(s)**: (solo — Miles self-reviews)
- **Merge authority**: Miles
- **Required CI/checks**: (none — no `.github/workflows/`, no branch protection)
- **Required approvals**: 0 (no branch protection on `main`)

## Other context

- **Hard rules in `CLAUDE.md` apply unconditionally** — read it before scoping or touching anything. Highlights: `experiment/*/cp_of_*/` trees are read-only research artifacts (never clean up, refactor, dedupe, or "modernize"); `origin/` is read-only; `grounding/twenty` is read-only reference; bootstrap via `bin/init.sh` and run experiments via `bin/exp.sh` (don't hand-roll); `bin/exp.sh run` uses `--dangerously-skip-permissions` and must stay unattended; blind experiments (`m3-*`) strip `--add-dir cp_of_*` and `--add-dir grounding/` — don't mention those paths anywhere that lands in a blind agent's context.
- Repo is private and very young (~4 commits at the time of onboarding); conventions are largely emergent.

## Conventions

(TBD — not captured at first onboarding; will be inferred from codebase per task.)

---

## Maintenance

- This file is **persistent**. Loaded into /commission's model context on every task invocation in this repo.
- Edit directly when conventions, contacts, or repos change.
- Delete the file to force /commission to re-run onboarding from scratch on the next invocation.

## Per-task artifacts

The task-level outputs from /commission live in sibling directories under `.commissions/`:

```
.commissions/
├── onboarding.md                    ← this file
├── YYYYMMDD-<slug>/
│   ├── brief.md                     ← /commission output
│   └── onboarding.md                ← the supplier's onboarding-pass response
```
