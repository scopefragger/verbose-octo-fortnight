# Patterns Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Magic numbers for menu offset margins
**Severity:** Low
**Lines:** 2002–2003
The values `160` and `180` are hard-coded magic numbers used to keep the menu inside the viewport. They represent the approximate pixel width and height of the context menu, but there is no comment or constant explaining them. If the menu grows (e.g. a new item is added), these numbers become stale silently.
**Action:** Replace with named constants (`MENU_APPROX_WIDTH = 160`, `MENU_APPROX_HEIGHT = 180`) or, better, compute the actual dimensions dynamically using `menu.offsetWidth` and `menu.offsetHeight` after setting `display: block`.

### Position clamping could use `getBoundingClientRect` for accuracy
**Severity:** Low
**Lines:** 2002–2005
Using `e.clientX` / `e.clientY` with a fixed offset is a reasonable approximation, but computing menu dimensions dynamically would be more robust. The current approach also sets `display: block` before computing clamped coordinates, so the menu briefly flashes at its previous position before being repositioned (a one-frame flicker). A common pattern is to position off-screen first (`left: -9999px`), then measure, then position correctly.
**Action:** Move position calculation before or immediately after `display: block`, and use `menu.offsetWidth` / `menu.offsetHeight` for accurate clamping.

### `if` chain instead of lookup table or `switch`
**Severity:** Low
**Lines:** 2011–2015
Five consecutive `if` statements checking the same `action` variable is a minor code-style inconsistency. Other parts of the file use more idiomatic dispatch patterns. A `switch` statement or a lookup object (`const actions = { tap: tapCard, hand: returnToHand, ... }`) would be more readable and easier to extend.
**Action:** Replace the `if` chain with a `const actionMap = { tap: tapCard, hand: returnToHand, top: putOnTop, grave: sendToGrave, exile: sendToExile }` lookup and a single `actionMap[action]?.(ctxTarget)` call.

### Missing comment explaining why `e.stopPropagation()` is needed
**Severity:** Low
**Lines:** 1998
`e.stopPropagation()` prevents the global click listener (line 2019) from immediately closing the menu that was just opened. This is a subtle interaction that is not explained by a comment, making the code less maintainable.
**Action:** Add a brief comment: `// Prevent the global click listener from immediately dismissing the menu we just opened`.

## Summary
The context menu code is concise and functional but uses magic numbers for positioning, an `if` chain where a lookup table would be cleaner, and lacks a comment explaining the critical `stopPropagation` call. None of these are blocking issues, but addressing them would improve maintainability.
