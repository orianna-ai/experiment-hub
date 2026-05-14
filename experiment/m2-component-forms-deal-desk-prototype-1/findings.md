# m2-component-forms · deal-desk-prototype-1

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
Reworked the Rollout form (the main multi-field form in the prototype) to match
the patterns used in `grounding/twenty/packages/twenty-front/src/modules/ui/input`:

**Label position**
- Switched from left-stacked `.filter-row` (`grid-template-columns: 160px 1fr`)
  to top-positioned `.field` labels using the twenty `InputLabel` recipe
  (11px, uppercase, semibold, light color, stacked above the control).
- Every field now has a real `<label htmlFor>` bound to its input, including
  the chip-inputs and the deal-size range.

**Validation**
- Required marker (red asterisk) on Pipeline; helper text "At least one pipeline
  is required." Optional fields use neutral helper text instead of fake
  placeholder commitments (e.g. Territory says "Leave empty to apply to all
  territories.").
- Deal size now parses min/max numerically and shows a live inline error
  ("Minimum must be less than maximum.") with red border + red focus ring on
  both inputs and `aria-invalid` on each one.
- Pilot duration validates `>= 1` and disables the decrement button at 1.
- Sticky-footer primary button (`Request admin approval`) is now disabled while
  any field error is unresolved, with a `title` explaining why.

**Affordances**
- Chip-inputs are now actually inputs — the fake `<span class="placeholder">`
  was replaced with a real `<input>` so users can type to add a pipeline /
  team / territory. The whole container now shows a blue focus ring when
  the inner input is focused (`:focus-within`).
- Chip remove (`×`) became a real `<button>` with `aria-label`.
- Deal size inputs gained a `$` left adornment (twenty `leftAdornment`
  pattern) so the currency context is visible inside the field.
- The pilot stepper +/- are real `<button>`s with `aria-label`s; decrement is
  disabled at 1; the entire stepper greys out when "Permanent" is selected
  so the disabled relationship is visible rather than implied.
- The Days/Weeks toggle was a single clickable pill that gave no hint that it
  could toggle. Replaced with a proper segmented control (two tabs, the
  active one elevated on a white pill) — clearly bistate, keyboard-focusable,
  follows `role="tablist"`.
- Radios are now real `<input type="radio">` wrapped in `<label>` so they're
  keyboard-operable and screen-reader-labelled; visible blue focus ring on
  the radio dot.
- Toggle component on the Permissions tab became a `<button role="switch"
  aria-checked>` with `aria-label`, replacing the inert `<span onClick>`.
- Added consistent focus-visible outlines (blue, 3px halo) on text inputs,
  chip inputs, stepper, segmented control, toggle, and buttons.

## Cost
- wall time: 5m 58s
- turns: 53
- tokens (input / cache-create / cache-read / output): 93 / 140064 / 4482100 / 22455
- $ estimate: $3.67829

## How Claude achieved it
1. Read `App.tsx` / `App.css` to inventory the forms: a Rollout filter form,
   a Permissions toggle list, and a Simulate sample-selector.
2. Read the live twenty codebase for the form primitives the prototype is
   supposed to converge with — `TextInput.tsx`, `InputLabel.tsx`, and
   `InputErrorHelper.tsx` in `packages/twenty-front/src/modules/ui/input/components/`.
   Captured the canonical patterns: top labels (11px uppercase semibold light),
   red-asterisk required marker, red border + helper text for errors,
   blue focus border, `leftAdornment`/`rightAdornment` for unit-bearing inputs.
3. Reworked the Rollout form in `App.tsx`:
   - Replaced 2-column `.filter-row` with stacked `.field` blocks.
   - Replaced `<span class="placeholder">` chip-input fakes with real
     `<input>` elements + state hooks (`pipelineDraft`, `teamDraft`,
     `territoryDraft`).
   - Wrapped deal-size inputs in a new `.adorned-input` with `$` adornment;
     added live `dealSizeError` computed from parsed min/max.
   - Promoted radios, stepper buttons, and the unit toggle to real
     interactive elements with `aria-label`s; converted the unit pill to a
     segmented control. Disabled controls cascade off the "Permanent" radio.
   - Wired `hasErrors` into the sticky-footer primary CTA.
4. Updated `App.css` with the new `.field` / `.field-label` / `.field-help` /
   `.field-error` / `.adorned-input` / `.segmented` / focus-visible rules.
   Kept the existing tokens; no new colors introduced.
5. Promoted `Toggle` (permissions tab) from `<span onClick>` to
   `<button role="switch" aria-checked aria-label>` and passed labels at each
   call site so the switches are keyboard- and screen-reader-accessible.
6. Verified the project still typechecks cleanly with `pnpm exec tsc --noEmit`.
   (Could not visually verify in-browser — the playwright session in this
   environment cannot reach the local dev server on `localhost:5233`; the
   harness handles the final screenshots.)

## Prompt
```
/goal Improve the forms of this prototype (http://localhost:5233/), which is a mock of a future feature built into twenty (live codebase is at ../../grounding/twenty for reference to use as a baseline to adhere to). Focus on label position, validation, and affordances. Ignore unrelated design issues.
```
