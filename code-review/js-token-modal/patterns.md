# Code & Pattern Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unused `pt` variable
**Severity:** Low
**Lines:** 2027
`const pt = t.power != null ? \` ${t.power}/${t.toughness}\` : '';` is computed but never used in the template string. This is dead code.
**Action:** Remove the `pt` declaration entirely. If P/T display in the button label is desired, add `${pt}` to the button template.

### Flying indicator uses emoji airplane (`✈`) rather than an MTG-standard symbol
**Severity:** Low
**Lines:** 2028
`const fly = t.keywords?.includes('Flying') ? ' ✈' : '';` uses ✈ (airplane emoji) for Flying. The rest of the app uses text or game-appropriate symbols. This is cosmetically inconsistent.
**Action:** Consider using a more appropriate indicator: a text label `(Flying)`, a wing symbol `⟁`, or a CSS badge.

### `showTokenModal` re-generates all preset buttons on every open
**Severity:** Low
**Lines:** 2025–2030
The entire `presets` innerHTML is rebuilt each time the modal opens, even though `COMMON_TOKENS` is static and never changes at runtime.
**Action:** Generate the preset buttons once on first open (or at startup) and cache them, rather than regenerating on every call.

### No keyboard shortcut or `Escape` key handler for closing the modal
**Severity:** Low
**Lines:** 2034–2037
The graveyard viewer and other modals may support `Escape` to close. The token modal only closes on backdrop click. If a keyboard handler is added to close it on `Escape`, it should be consistent with other modals.
**Action:** Add an `Escape` key listener within `showTokenModal` and remove it in the close function, consistent with any other modal `Escape` handling in the file.

## Summary
The token modal is very small (16 lines) and mostly correct. The main pattern issues are a dead `pt` variable, re-generation of static content on every open, and lack of keyboard accessibility for closing the modal.
