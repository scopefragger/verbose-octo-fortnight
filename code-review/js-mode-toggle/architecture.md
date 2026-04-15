# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode()` directly manipulates multiple unrelated UI regions
**Severity:** Medium
**Lines:** 1534–1539
`setMode()` knows about and directly manipulates six distinct DOM elements/classes: mode buttons, stats panel, hand panel, play area, and layout. This makes it a point of tight coupling — any UI restructuring must update `setMode()` as well.
**Action:** Consider a CSS-class-on-body or CSS-class-on-layout approach (e.g. `document.querySelector('.layout').dataset.mode = mode`) and use CSS attribute selectors to show/hide panels, reducing the JS to a single state change.

### `setMode()` conflates mode switching and game initialisation
**Severity:** Medium
**Lines:** 1540
Calling `startGame()` inside `setMode()` means the mode-switch function has a side effect that starts game state. This breaks the single responsibility principle — a caller switching modes does not necessarily expect game initialisation to happen.
**Action:** Move the `startGame()` trigger to the click handler for the play-mode button (in the HTML), keeping `setMode()` purely concerned with UI state.

### `toggleSidebar()` is a near-orphan function
**Severity:** Low
**Lines:** 1543–1545
`toggleSidebar()` is a two-line function that removes a single class. It adds little over an inline call. Its one-directional behaviour (see Static finding) suggests it may be a stub that was never fully implemented.
**Action:** Either fully implement it as a real toggle and use it consistently, or inline the class manipulation at the call site and remove the function.

## Summary
`setMode()` is overloaded — it handles mode UI, panel visibility, layout state, and game initialisation all at once. Separating these concerns (especially moving `startGame()` out) would make the function easier to test and maintain.
