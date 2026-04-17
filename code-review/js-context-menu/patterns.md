# Patterns Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Sequential `if` instead of `switch` or dispatch map in `ctxAction()`
**Severity:** Low
**Lines:** 2011–2015
Five consecutive `if` statements with no `else if` chaining evaluate every branch unconditionally. A `switch` or a lookup map (`const ACTIONS = { tap: tapCard, hand: returnToHand, ... }`) would be more conventional, prevent fall-through evaluation, and make it easier to add new actions.
**Action:** Refactor to `switch (action) { case 'tap': tapCard(ctxTarget); break; ... }` or a dispatch map: `const dispatch = { tap: tapCard, hand: returnToHand, top: putOnTop, grave: sendToGrave, exile: sendToExile }; dispatch[action]?.(ctxTarget);`.

### Magic pixel constants for viewport clamping
**Severity:** Low
**Lines:** 2002–2003
`160` and `180` are hard-coded estimates of the menu's rendered dimensions. These do not correspond to any CSS variable or named constant, and will silently produce incorrect clamping if the menu's CSS is changed.
**Action:** Extract to named constants (`const CTX_MENU_WIDTH = 160; const CTX_MENU_HEIGHT = 180;`) at minimum, or replace with a dynamic calculation using `menu.offsetWidth`/`menu.offsetHeight` after `display = 'block'`.

### `style.display = 'block'` / `style.display = 'none'` pattern instead of CSS class toggle
**Severity:** Low
**Lines:** 2001, 2009, 2020
Menu visibility is controlled by directly manipulating `style.display`. The rest of the codebase uses CSS class toggles (`.hidden`, `.visible`) for modal/panel visibility (e.g. `card-focus-panel` uses `classList.add('visible')`). Mixing patterns makes the code less consistent and harder to apply global transitions (e.g. fade-in/out) via CSS.
**Action:** Adopt a consistent visibility pattern — either add a `.ctx-menu--visible` class to the stylesheet and toggle it with `classList`, or standardise all modals on `style.display` toggling.

### Comment section label is minimal — no description of the trigger mechanism
**Severity:** Low
**Lines:** 1996
The `// === CONTEXT MENU ===` comment gives no indication of how the menu is triggered. Given that the trigger is missing (dead code), this absence is especially confusing.
**Action:** Expand the comment to document the intended trigger (e.g. `// Triggered by right-click / long-press on battlefield cards via showCtxMenu(e, id)`) and note the current status (wiring pending / removed).

### `ctxAction()` does not provide any feedback on unknown action strings
**Severity:** Low
**Lines:** 2008–2017
If an unrecognised `action` string is passed (e.g. a typo in a future HTML edit), all five `if` conditions fail silently. The function hides the menu and resets `ctxTarget` but takes no action and gives no warning.
**Action:** Add a `console.warn` or `else` branch for unrecognised actions to aid debugging: `else { console.warn('Unknown ctxAction:', action); }`.

## Summary
The patterns issues are all low severity: sequential `if` chains instead of a dispatch map, magic dimension constants, inconsistent visibility-toggle style versus the rest of the codebase, and a minimal section comment that leaves the trigger mechanism undocumented. All would be straightforward to fix if the context menu is retained.
