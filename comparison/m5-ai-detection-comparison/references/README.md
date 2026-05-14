# Human-designed reference pool — `m5-ai-detection-comparison`

Five 1440×900 PNGs of real, human-designed CRM surfaces — flat full-screen app UI (sidebar + header chrome + substantial main content), no marketing framing. The harness samples one per run, randomly assigns the prototype's `after.png` and the chosen reference to `image-A.png` / `image-B.png`, records the ground truth in `comparison-key.json`, and grades the agent against the key.

## The active 5

| filename | surface |
|---|---|
| `ref-01.png` | companies table (sidebar + clean table — baseline view) |
| `ref-02.png` | companies table with record side-panel open (3-column dense view) |
| `ref-07.png` | opportunities kanban pipeline (matches deal-desk prototypes most directly) |
| `ref-10.png` | record with email inbox tab (sidebar + record fields + emails list) |
| `ref-17.png` | record with activity timeline tab (sidebar + fields + timeline) |

Selection criterion: each must look like a full app screenshot — visible left nav sidebar, top header chrome, real seed data in the main content area, no cursor annotations, no isolated-popover or modal-only framing, no docs-style side-by-side comparisons.

## Why these images

The prototypes are mocks of *features built into twenty*. The most honest "what a human designer at twenty would produce" baseline is *twenty itself*. The active five come from two sources, both real flat app UI:

- **`ref-01`, `ref-02`, `ref-07`, `ref-10`** — sourced from `grounding/twenty/packages/twenty-docs/images/user-guide/`, the in-product documentation captures.
- **`ref-17`** — sourced from a PR review screenshot on github.com/twentyhq/twenty (PR #19800). PR screenshots are casual development captures — full window, real seed data — not curated for marketing.

Earlier we tried `grounding/twenty/packages/twenty-docs/images/releases/`, but those are marketing-formatted release-notes screenshots — cropped, padded, often shown floating on solid backgrounds. They mismatch the prototype `after.png` (a flat playwright capture of a dev-server window), so the judge could distinguish on framing alone. Both sources used here match the prototype framing.

The m5 prompt explicitly forbids the judge from reverse-image-searching or identifying artifacts, so using real twenty surfaces is permitted — the judge must evaluate on craft signals alone.

## `extra/` — held back from sampling

`extra/` contains 20 additional references that were collected during scouting but did not meet the full-screen-UI bar (close-up fragments, missing-sidebar modals, cursor-annotated docs shots, etc.). They're preserved in the codebase for future experiments or to swap into the active pool, but the harness's `ref-*.png` glob in this directory does not see them. Each has the same TSV format in `extra/_provenance.tsv`.

## Provenance

`_provenance.tsv` has one row per reference, three tab-separated columns:

| Column | Meaning |
|---|---|
| `ref-NN.png` | the local filename |
| source | either a path inside `grounding/twenty/...` (for user-guide refs) or a `https://github.com/twentyhq/twenty/pull/N` link (for PR-screenshot refs) |
| description | one line, what the surface shows |

Renaming to `ref-NN.png` is deliberate: filenames are visible to anything that touches the file system and would otherwise be a glaring identification leak.

## Why commit them (not gitignore)

Same logic as `experiment/*/cp_of_*`: each judgement is only interpretable if the exact reference it was scored against is preserved alongside. `grounding/` is re-cloned by `bin/init` and could change pinned-commit over the project's lifetime, so deriving the references on the fly would silently invalidate old runs. Committing the actual PNGs decouples the reference pool from grounding-pin drift.

## Adding or regenerating a reference

Each ref is brought to 1440×900 with `sips -z 900 1440 --cropToHeightWidth 900 1440`. Source can be either a local grounding path or a github.com/user-attachments URL pulled from a twentyhq/twenty PR.

```bash
# From grounding/:
cp grounding/twenty/.../source.png comparison/m5-ai-detection-comparison/references/ref-26.png

# Or from a twenty PR screenshot:
curl -sL -o comparison/m5-ai-detection-comparison/references/ref-26.png \
  https://github.com/user-attachments/assets/<uuid>

# Then crop to 1440×900 in place:
sips -z 900 1440 --cropToHeightWidth 900 1440 \
  comparison/m5-ai-detection-comparison/references/ref-26.png \
  --out comparison/m5-ai-detection-comparison/references/ref-26.png
```

Add a row to `_provenance.tsv` and `git add` both the new `ref-NN.png` and the TSV change.

## Coverage

The active 5 cover three CRM surface families: table list (ref-01, ref-02), kanban pipeline (ref-07), and record detail (ref-10 emails tab, ref-17 timeline tab). If a prototype only ever shows a single surface (e.g. just a kanban), the reference set will sometimes pair it against a non-kanban surface — that's fine: the judge is grading craft, not surface match.

## Sizing

Source captures are 1600×1000, 1914×966, or 1920×972 (twenty's docs target). Each was processed with `sips --cropToHeightWidth 900 1440` — resize-to-fit then center-crop — to exactly match the prototype `after.png` viewport (1440×900). On the 1.97-aspect captures this trims ~340px off the width: the sidebar and central app region survive, the far-right gutter is lost.

## Adding more references

1. Drop a 1440×900 PNG into this directory named `ref-NN.png`.
2. Append a row to `_provenance.tsv` with source + description.
3. Re-runs of `m5-ai-detection-comparison` will start sampling it automatically.

## Per-experiment override

If a specific prototype needs a hand-picked reference (e.g. you want to force the judge to compare two kanbans), drop the override at `comparison/m5-ai-detection-comparison/overrides/<experiment-name>.png`. The harness will use that exact file instead of sampling from the pool, and `comparison-key.json` will record the override path.
