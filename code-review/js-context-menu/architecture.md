# Architecture Review — js-context-menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxAction` uses sequential `if` statements instead of dispatch table or switch
**Severity:** Low
**Lines:** 2011–2015
Five consecutive `if` statements check `action` against string values. All five execute the check regardless — there is no `else if` or `switch`, so all five conditions are evaluated on every call. This is a minor inefficiency and can obscure intent.
**Action:** Use `switch(action)` or an object dispatch table: `const actions = { tap: tapCard, hand: returnToHand, ... }; if (actions[action]) actions[action](ctxTarget);`.

### Global click listener registered at module level
**Severity:** Low
**Lines:** 2019–2021
The global click dismissal listener is registered directly at script parse time. This is an implicit side effect of loading the script, which makes testing harder and can be surprising to future maintainers.
**Action:** Move the listener registration into an `initContextMenu()` function called from the main `init()` or DOMContentLoaded handler.

### Context menu position capped with magic numbers
**Severity:** Low
**Lines:** 2002–2003
The magic numbers `160` and `180` represent assumed menu width and height for viewport clamping. If the menu grows, these values will need to be updated manually.
**Action:** Use `menu.offsetWidth` and `menu.offsetHeight` at display time: `const x = Math.min(e.clientX, window.innerWidth - menu.offsetWidth);`.

## Summary
The section is small and clear. The main architectural improvement would be replacing sequential `if` blocks with a dispatch table and reading menu dimensions dynamically rather than using magic numbers.
