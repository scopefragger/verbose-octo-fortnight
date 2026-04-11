# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode` conflates view switching with game initialisation
**Severity:** Medium
**Lines:** 1540
`setMode('play')` conditionally calls `startGame()` — mixing view/layout concerns with game-state mutation. A mode-toggle function should only update the UI; game initialisation should be driven by the caller or a dedicated event.
**Action:** Move the `startGame()` call out of `setMode` and into the `onclick` handler of the Play button (line 781), or into a dedicated `enterPlayMode()` wrapper that calls `setMode('play')` then `startGame()` if needed.

### Inline style mutation instead of class-based approach
**Severity:** Low
**Lines:** 1536–1537
`stats-panel` and `hand-panel` are shown/hidden via `style.display` rather than toggling a CSS class. This mixes layout control between JS (`style.display`) and CSS (`classList`) within the same function.
**Action:** Add a CSS utility class (e.g. `.hidden { display: none }`) and use `classList.toggle('hidden', isPlay)` for consistency with how the other panels are handled.

### `document.querySelector('.layout')` queried twice in the same file scope
**Severity:** Low
**Lines:** 1539, 1544
Both functions independently query `.layout`. If the layout element were ever replaced or re-rendered, both queries would need updating.
**Action:** Cache the element reference in a module-level variable (e.g. `const layoutEl = document.querySelector('.layout')`) shared across both functions.

## Summary
The main architectural concern is `setMode` initiating game state (`startGame()`), which conflates two distinct responsibilities. The DOM show/hide inconsistency is a minor layering issue.
