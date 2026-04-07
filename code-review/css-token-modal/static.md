# Static Review — Token Modal
Lines: 733–771 | File: public/mtg-commander.html

## Findings

### `.token-custom` label selector targets all labels, not scoped labels
**Severity:** Low
**Lines:** 755
The rule `.token-custom label` styles all `<label>` descendants of `.token-custom`. Currently no `<label>` elements are present inside `.token-custom` in the HTML (lines 973–988) — the "Custom Token" section header is a `<div>` with inline styles, not a `<label>`. The rule is dead unless labels are added later, creating a silent divergence between the CSS and the HTML.
**Action:** Either add `<label>` elements to the HTML form fields for accessibility, or remove the dead rule until labels are present.

### `#custom-token-color` `<select>` has no corresponding CSS rule
**Severity:** Low
**Lines:** 757–760, 978
`.token-custom input` styles `<input>` elements but the `<select>` in the same row (line 978) uses a fully inlined style block instead of the shared class. The `<select>` is not a child covered by `.token-custom input`, so it receives no class-level styling.
**Action:** Add a `.token-custom select` rule alongside `.token-custom input` and remove the inline style from the `<select>` element.

### No focus style for `.token-custom` select
**Severity:** Low
**Lines:** 761
`.token-custom input:focus` sets `border-color: var(--gold)` on inputs, but there is no corresponding `:focus` rule for the `<select>` element in the same row. The select will fall back to the browser's default focus ring, inconsistent with the input treatment.
**Action:** Add `.token-custom select:focus { outline: none; border-color: var(--gold); }`.

## Summary
The CSS block is clean and internally consistent for inputs, but the `label` rule is dead code (no labels exist in the HTML), and the `<select>` companion element in the custom token row is entirely unstyled by the class — it relies on a duplicated inline style instead. No undefined variable references or null-guard issues exist within the CSS itself.
