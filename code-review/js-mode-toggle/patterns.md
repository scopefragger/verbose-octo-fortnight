# Patterns Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic string `'play'` used as the sole mode value
**Severity:** Low
**Lines:** 1533, 1540
The string `'play'` is the only mode value ever checked; `'prepare'` is implied by its absence. There is no constant or enum guarding against typos. Passing `setMode('Play')` (capitalised) would silently fail without error.
**Action:** Define a small constant object `const MODE = { PREPARE: 'prepare', PLAY: 'play' }` and use it at all call sites to get a single source of truth and catch typos at development time.

### `toggleSidebar` naming mismatch with behaviour
**Severity:** Low
**Lines:** 1543–1545
As noted in static review, the function only removes the class, never toggles it. The naming convention used elsewhere (`toggleSidebar`, `toggleSidebar-collapsed`) implies bidirectionality.
**Action:** Rename to `showSidebar()` to match the actual behaviour.

### No comment explaining the `playLibrary.length === 0` guard
**Severity:** Low
**Lines:** 1540
The condition is not immediately obvious. A brief inline comment explaining why an empty library triggers `startGame()` (i.e. the game hasn't been initialised yet) would aid readability.
**Action:** Add an inline comment: `// only auto-start if game has not been initialised yet`.

## Summary
The segment is short and mostly clean. Two naming/constant issues and a missing comment are the main pattern concerns; none are critical.
