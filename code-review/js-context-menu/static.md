# Static Code Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxAction` uses chained `if` instead of `else if` or `switch`
**Severity:** Low
**Lines:** 2011–2015
Five consecutive `if` statements check the `action` string. Once a match is found, the remaining `if` checks still execute (they all fail, but they are evaluated). This is a minor inefficiency and readability issue.
**Action:** Use `else if` chains or a `switch` statement so only one branch is evaluated.

### Magic strings for action names (`'tap'`, `'hand'`, `'top'`, `'grave'`, `'exile'`)
**Severity:** Low
**Lines:** 2011–2015
Context menu actions are identified by plain string literals. Any typo in the HTML `ctxAction(...)` call or in the comparison will silently fail (no action taken, no error).
**Action:** Define an `CTX_ACTIONS` constant object (`{ TAP: 'tap', HAND: 'hand', ... }`) and reference it in both the HTML onclick attributes and the `ctxAction` handler. At minimum add a final `else` that logs an unknown action warning.

### `ctxTarget` is not cleared if `ctxAction` is called with `ctxTarget === null`
**Severity:** Low
**Lines:** 2010
If `ctxAction` is called when `ctxTarget` is null, the function returns early without hiding the menu. The menu is hidden on line 2009 before the null check, so this is actually fine. However the early return after hiding means `ctxTarget = null` on line 2016 is not reached, leaving `ctxTarget` unchanged (it was already null). No bug.
**Action:** No code change needed, but the control flow is slightly confusing — add a comment explaining that `ctxTarget = null` on line 2016 is only reached on success.

### Global click listener hides menu on ANY click, including ones that open it
**Severity:** Low
**Lines:** 2019–2021
The global `document` click listener fires whenever the user clicks anywhere. If the same click that calls `showCtxMenu` bubbles up to the document, the menu would be immediately hidden. The `e.stopPropagation()` in `showCtxMenu` (line 1998) prevents this, but the dependency is implicit — removing `stopPropagation` would break the menu silently.
**Action:** Add a comment in the global listener noting that `showCtxMenu` must call `e.stopPropagation()` to prevent the menu from closing immediately.

## Summary
The context menu logic is straightforward. The main concerns are magic action strings that could silently fail on typos, chained `if` instead of `switch`, and an implicit dependency between `stopPropagation` and the global click dismissal.
