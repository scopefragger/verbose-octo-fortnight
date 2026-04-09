# Static Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxAction` uses repeated `if` statements instead of a dispatch map
**Severity:** Low
**Lines:** 2011–2015
`ctxAction(action)` tests each action string with separate `if` statements rather than a switch or dispatch object. All five branches will be evaluated on every call (no early return). This is harmless given the small number of actions, but the pattern is inconsistent with how more complex dispatch is handled elsewhere.
**Action:** Replace with a `switch (action)` or a dispatch object: `const actions = { tap: tapCard, hand: returnToHand, ... }; actions[action]?.(ctxTarget);`.

### Global `click` listener added in the context menu section conflicts with autocomplete
**Severity:** Medium
**Lines:** 2019–2021
A `document.addEventListener('click', ...)` listener hides the context menu on any click. The autocomplete section (lines 2093–2097) also adds its own `document.addEventListener('click', ...)` listeners. Multiple global click listeners on `document` can interact unexpectedly — e.g., opening the context menu and then clicking an autocomplete item may dismiss both simultaneously. The order of listener invocation is not guaranteed to be safe.
**Action:** Consider consolidating all global click-dismissal logic into a single `document` click handler that dispatches to each subsystem.

### `ctxTarget` is set in `showCtxMenu` but only cleared in `ctxAction`
**Severity:** Low
**Lines:** 1999, 2016
If the user opens the context menu and dismisses it by clicking elsewhere (which hides the menu via the global click listener), `ctxTarget` is not cleared. The next call to `ctxAction` could act on the stale target from the previous invocation. However, in practice this is harmless since the menu is hidden and `ctxAction` is only callable via the menu buttons.
**Action:** Clear `ctxTarget = null` in the global click dismissal handler, not only in `ctxAction`.

## Summary
The context menu section is small and mostly correct. The primary concerns are multiple conflicting `document` click listeners across the file, a stale `ctxTarget` when the menu is dismissed without selecting an action, and an inefficient repeated-`if` dispatch pattern that could use a switch statement.
