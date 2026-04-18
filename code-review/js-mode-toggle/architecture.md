# Architecture Review — js-mode-toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode` conflates UI switching with game initialisation
**Severity:** Medium
**Lines:** 1540
`setMode('play')` both switches the UI panels *and* calls `startGame()` if conditions are met. These are two distinct responsibilities: navigation/view management and game lifecycle. If someone needs to switch the view without starting the game, or start the game without switching the view, neither is possible.
**Action:** Move `if (isPlay && playLibrary.length === 0 && deckLoaded) startGame()` to the call site (the Play button's onclick handler) so `setMode` only manages layout visibility.

### Mixed DOM manipulation strategies
**Severity:** Low
**Lines:** 1536–1538
`stats-panel` and `hand-panel` are hidden via `style.display`, while `play-area` uses a CSS class (`active`) and `.layout` uses `sidebar-collapsed`. Mixing inline-style toggling with class toggling makes it harder to understand the full set of states from CSS alone.
**Action:** Convert `stats-panel` and `hand-panel` to class-based visibility (e.g., `.hidden` or a `display:none` utility class) to keep all visibility logic in CSS.

## Summary
The primary architecture concern is `setMode` doing two things at once — view switching and conditional game start. Separating these would make both responsibilities independently callable and testable.
