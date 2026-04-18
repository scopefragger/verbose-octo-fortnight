# Static Review — js-context-menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Magic numbers for menu boundary clamping
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` assume the context menu is 160px wide and 180px tall. If the CSS menu size ever changes, the clamping breaks and the menu can be cut off by the viewport edge.
**Action:** Replace hardcoded offsets with `menu.offsetWidth` and `menu.offsetHeight` after setting `display: block`: `const x = Math.min(e.clientX, window.innerWidth - menu.offsetWidth)`.

### `if` chain instead of `else if` or `switch`
**Severity:** Low
**Lines:** 2011–2015
Five sequential `if` statements evaluate each condition independently even after a match. Since action strings are mutually exclusive, this wastes comparisons. With five branches it's trivial, but inconsistent with the use of `switch` in other dispatch logic.
**Action:** Convert to a `switch(action)` or an object dispatch map: `const actions = { tap: tapCard, hand: returnToHand, ... }; actions[action]?.(ctxTarget);`.

## Summary
Compact and correct. Two low-severity issues: hardcoded menu dimension offsets and sequential `if` statements that evaluate all branches.
