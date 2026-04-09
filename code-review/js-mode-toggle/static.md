# Static Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `toggleSidebar` only removes `sidebar-collapsed`, never adds it
**Severity:** Medium
**Lines:** 1543–1545
`toggleSidebar()` unconditionally calls `classList.remove('sidebar-collapsed')`, meaning it always opens the sidebar but can never close it. The function name implies a toggle (open/close) but it is one-directional. This means there is no way for the user to re-collapse the sidebar after opening it via this function.
**Action:** Change to `classList.toggle('sidebar-collapsed')` to give it true toggle behavior, or rename the function to `openSidebar()` if one-directional is intentional.

### `setMode` guard on `startGame` uses `deckLoaded` without null-checking `playLibrary`
**Severity:** Low
**Lines:** 1540
The condition `if (isPlay && playLibrary.length === 0 && deckLoaded)` relies on `playLibrary` being an initialized array. `playLibrary` is declared as `let playLibrary = []` at line 1548, so it is always an array — but this relies on declaration order. If `setMode` were ever called before the play-state block is parsed (e.g., in an HTML `onload` that fires early), this would throw.
**Action:** No immediate action needed given the current single-file structure, but document the initialization dependency.

## Summary
The mode toggle section is small and mostly correct. The primary bug is `toggleSidebar` always removing (not toggling) the `sidebar-collapsed` class, making the sidebar permanently unreclosable once opened. The `startGame` guard condition is sound given the current initialization order.
