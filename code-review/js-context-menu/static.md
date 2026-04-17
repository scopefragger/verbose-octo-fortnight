# Static Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `showCtxMenu()` has no call sites — dead code
**Severity:** High
**Lines:** 1997–2006
A grep of the entire file finds no `oncontextmenu`, `right-click`, or `showCtxMenu(` call sites. The function is defined but never invoked, making it unreachable dead code. The context menu HTML at lines 993–999 can still be triggered by `ctxAction()` calls wired in the HTML, but `showCtxMenu` itself — which positions the menu and sets `ctxTarget` — is never called, so the menu would open at position (0,0) and with `ctxTarget = null`, making every action a no-op.
**Action:** Determine whether context-menu access was intentionally removed or is a regression. If intentional, remove `showCtxMenu()` and the context-menu HTML block. If accidental, wire `showCtxMenu` to the appropriate trigger (e.g. `oncontextmenu` on battlefield card wrappers).

### `ctxTarget` is never reset to `null` when the menu is dismissed via the global click handler
**Severity:** Medium
**Lines:** 2019–2021
The global `document` click listener at line 2019 hides the menu (`style.display = 'none'`) but does not reset `ctxTarget` to `null`. If the menu is dismissed by clicking elsewhere and then `ctxAction` is somehow triggered (e.g. via keyboard or a programmatic call), it would act on a stale `ctxTarget` from the previous menu open.
**Action:** Add `ctxTarget = null;` inside the global click listener alongside the `style.display = 'none'` line.

### `getElementById('card-ctx-menu')` called twice without caching and without null guard
**Severity:** Low
**Lines:** 2000, 2009, 2020
`getElementById('card-ctx-menu')` is called separately in `showCtxMenu`, `ctxAction`, and the global listener — three independent lookups. None of them check for null. If the element is ever missing, all three will throw.
**Action:** Cache the element reference at module level (e.g. `const ctxMenuEl = document.getElementById('card-ctx-menu');`) and use the cached reference with a single null guard at initialisation.

### `ctxAction()` uses sequential `if` statements instead of `switch` or a dispatch map
**Severity:** Low
**Lines:** 2011–2015
Five independent `if` checks are used to dispatch on the `action` string. None of them use `else if`, so all five conditions are evaluated on every call (though only one will match). While the performance impact is negligible, a `switch` statement or dispatch map (`{ tap: tapCard, hand: returnToHand, ... }`) would be more idiomatic and extensible.
**Action:** Replace with a `switch` statement or an action dispatch map.

### Magic number offsets `160` and `180` for menu positioning
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` are hard-coded pixel offsets that approximate the menu's width and height. If the menu's CSS dimensions ever change, these values will be wrong and the menu will overflow the viewport.
**Action:** Read the menu's actual dimensions after making it visible (`menu.offsetWidth`, `menu.offsetHeight`) to compute the clamped position dynamically, rather than using magic constants.

## Summary
The most significant finding is that `showCtxMenu()` appears to have no call sites, making the entire context-menu triggering mechanism dead code. The global click dismissal also fails to reset `ctxTarget`, leaving stale state. Both issues suggest the context menu was partially implemented and the trigger wiring was either removed or never completed.
