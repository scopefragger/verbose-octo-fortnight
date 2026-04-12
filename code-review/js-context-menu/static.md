# Static Code Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `showCtxMenu` is defined but never called
**Severity:** High
**Lines:** 1997
`showCtxMenu(e, id)` is declared but there is no invocation of it anywhere in the file. The `bf-menu-btn` CSS class is styled (lines 638–645) and the `.bf-wrap` hover rule shows it, but no `bf-menu-btn` element is ever rendered in the battlefield card templates (lines 1889–1903). The context menu is therefore inaccessible via the intended entry point, making the entire `showCtxMenu` function dead code in the current state.
**Action:** Either add a `bf-menu-btn` button to the `renderBFCard()` template with `onclick="showCtxMenu(event, ${idStr})"`, or remove the function and CSS if the focus-panel action buttons (lines 1947–1951) are the intended replacement.

### Global click listener hides menu but does not null `ctxTarget`
**Severity:** Low
**Lines:** 2019–2021
The `document` click listener hides the menu visually but does not reset `ctxTarget` to `null`. If a user opens the menu, then clicks elsewhere to dismiss it (triggering the global listener), `ctxTarget` retains the last card's id. A subsequent programmatic call to `ctxAction()` would still operate on the stale target.
**Action:** Add `ctxTarget = null;` inside the global click listener callback.

### `ctxAction` uses a chain of `if` statements instead of a guard-and-dispatch pattern
**Severity:** Low
**Lines:** 2011–2015
If `action` is an unrecognised string (e.g. a future typo), all five conditions silently fail with no feedback. There is no `else`/`default` branch.
**Action:** Use an `else if` chain or a lookup object so that an unrecognised action is at least logged to the console during development.

## Summary
The most critical static issue is that `showCtxMenu` is never called — the context menu cannot be opened in the current code. The global dismiss handler also leaves `ctxTarget` stale. The logic itself is otherwise straightforward and correct.
