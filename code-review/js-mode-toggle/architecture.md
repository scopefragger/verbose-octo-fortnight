# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode()` mixes view switching with game initialisation
**Severity:** Medium
**Lines:** 1540
The condition `if (isPlay && playLibrary.length === 0 && deckLoaded) startGame()` embeds game-start logic inside a UI-mode-switch function. Switching to "Play" mode should only be responsible for showing/hiding panels; deciding whether to start a game is a separate concern. This coupling means you cannot switch to play view without the risk of inadvertently triggering `startGame()`.
**Action:** Remove the `startGame()` call from `setMode()`. Call `startGame()` explicitly at the call site (e.g. the "Play" button handler), or in a dedicated `enterPlayMode()` function that calls both `setMode('play')` and `startGame()` as needed.

### Hardcoded element IDs couple this function to the HTML structure
**Severity:** Low
**Lines:** 1534–1539
The function queries five different element IDs directly. Any HTML refactoring that changes these IDs will silently break the mode switch. 
**Action:** Consider centralising element references into a top-level `DOM` map at initialisation time, consistent with how other large single-file apps manage DOM references.

## Summary
The primary architectural concern is the mixed responsibility in `setMode()`: UI transition and game initialisation are conflated. Separating them would make both easier to test and reason about.
