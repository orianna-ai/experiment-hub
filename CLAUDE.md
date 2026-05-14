# CLAUDE.md

Guidance for Claude Code (and any agent) working in this repo. Read this before touching anything.

## What this repo is

A research harness for judging how well coding agents catch visual-design nits. The *product* is judgements on AI prompts — not a shippable app. See `README.md` § "Why is so much near-identical code checked in?" for the full rationale.

## Hard rules

1. **Don't clean up `experiment/*/cp_of_*/` trees.** They look like duplicated, stale, or unmaintained code. They are the **primary research artifact** — the literal output an agent produced from a given prompt. Do not refactor, dedupe, "modernize," delete unused files, bump deps, fix lint, or normalize formatting across them. Treat each `cp_of_*` as a frozen snapshot.

2. **`origin/` is read-only.** Never run an agent against it and never edit a file under it. Every experiment works from a fresh `cp_of_<origin>/` scaffolded by `bin/exp.sh new`. The harness needs to dev-serve origin for the before-screenshot, which is the only allowed interaction.

3. **`grounding/twenty` is read-only reference.** It exists so the agent can read a real codebase for context. Don't install its deps, don't build it, don't modify it. `bin/init.sh` re-clones it pinned to a commit; local changes will be blown away.

4. **Bootstrap with `bin/init.sh`. Run experiments with `bin/exp.sh`.** Don't hand-roll `pnpm install` loops, don't `git clone` groundings manually, don't write parallel orchestration scripts. If a workflow is missing, add a subcommand to `bin/init.sh` or `bin/exp.sh` rather than working around them.

6. **Blind experiments (`m3-*`): treat path silence as part of the contract.** The harness already strips `--add-dir cp_of_*` and `--add-dir grounding/` for any id starting with `m3-`, and the blind preamble forbids reading them. Don't undo that elsewhere: do not mention `cp_of_*` or `grounding/` paths in any preamble text, skill output, helper response, or post-hoc note that lands in the agent's context during a blind run. Even unreadable paths prime the agent toward "the answer key lives over there" and corrupt the eval.

7. **`bin/exp.sh run` is unattended and uses `--dangerously-skip-permissions`.** It launches `claude --print` against a working copy with file-system access to `cp_of_*` and `grounding/twenty/`. Treat the script as production-ish: don't add interactive prompts, don't introduce side effects outside the experiment dir, and don't change the preamble logic (especially the `m3-*` blind-mode branch) without understanding what it enforces.
