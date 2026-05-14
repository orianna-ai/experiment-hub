# Human-designed reference pool — `m5-ai-detection-comparison`

Sixteen 1440×900 PNGs of real, human-designed CRM surfaces — flat app UI, no marketing framing. The harness samples one per run, randomly assigns the prototype's `after.png` and the chosen reference to `image-A.png` / `image-B.png`, records the ground truth in `comparison-key.json`, and grades the agent against the key.

## Why these images

The prototypes are mocks of *features built into twenty*. The most honest "what a human designer at twenty would produce" baseline is *twenty itself* — every reference here is sourced from `grounding/twenty/packages/twenty-docs/images/user-guide/`, the in-product documentation captures. These are raw app UI: full window chrome, sidebar + main content, no drop shadows or hero framing.

Earlier we tried `grounding/twenty/packages/twenty-docs/images/releases/`, but those are marketing-formatted release-notes screenshots — cropped, padded, often shown floating on solid backgrounds. They mismatch the prototype `after.png` (a flat playwright capture of a dev-server window), so the judge could distinguish on framing alone. The `user-guide/` shots match the prototype framing.

The m5 prompt explicitly forbids the judge from reverse-image-searching or identifying artifacts, so using real twenty surfaces is permitted — the judge must evaluate on craft signals alone.

## Provenance

`_provenance.tsv` maps each `ref-NN.png` → source path inside `grounding/` → one-line description of the surface. Renaming to `ref-NN.png` is deliberate: filenames are visible to anything that touches the file system and would otherwise be a glaring identification leak.

## Why commit them (not gitignore)

Same logic as `experiment/*/cp_of_*`: each judgement is only interpretable if the exact reference it was scored against is preserved alongside. `grounding/` is re-cloned by `bin/init` and could change pinned-commit over the project's lifetime, so deriving the references on the fly would silently invalidate old runs. Committing the actual PNGs decouples the reference pool from grounding-pin drift.

## Adding or regenerating a reference

Each ref is `cp` from the source listed in `_provenance.tsv` then `sips -z 900 1440 --cropToHeightWidth 900 1440` to match `screenshots/after.png` exactly. To add one:

```bash
# add a row to _provenance.tsv, then:
cp grounding/twenty/.../source.png comparison/m5-ai-detection-comparison/references/ref-17.png
sips -z 900 1440 --cropToHeightWidth 900 1440 \
  comparison/m5-ai-detection-comparison/references/ref-17.png \
  --out comparison/m5-ai-detection-comparison/references/ref-17.png
```

Then `git add` the new `ref-NN.png` alongside the `_provenance.tsv` change.

## Coverage

A mix of CRM surfaces matching the prototypes' surface area: main table layout, record detail panel, view menu, navigation bar, command palette, search, kanban pipeline (×3 variants), record-scoped email inbox, notes editor, import wizard, view config, object/field settings, inline new-field affordance, favorites. If a prototype only ever shows a single surface (e.g. just a kanban), the reference set will sometimes pair it against a non-kanban surface — that's fine: the judge is grading craft, not surface match.

## Sizing

Source captures are 1600×1000, 1914×966, or 1920×972 (twenty's docs target). Each was processed with `sips --cropToHeightWidth 900 1440` — resize-to-fit then center-crop — to exactly match the prototype `after.png` viewport (1440×900). On the 1.97-aspect captures this trims ~340px off the width: the sidebar and central app region survive, the far-right gutter is lost.

## Adding more references

1. Drop a 1440×900 PNG into this directory named `ref-NN.png`.
2. Append a row to `_provenance.tsv` with source + description.
3. Re-runs of `m5-ai-detection-comparison` will start sampling it automatically.

## Per-experiment override

If a specific prototype needs a hand-picked reference (e.g. you want to force the judge to compare two kanbans), drop the override at `comparison/m5-ai-detection-comparison/overrides/<experiment-name>.png`. The harness will use that exact file instead of sampling from the pool, and `comparison-key.json` will record the override path.
