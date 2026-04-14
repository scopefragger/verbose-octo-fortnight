# Static Code Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `toggleSidebar` only removes `sidebar-collapsed` — it cannot re-collapse
**Severity:** Low
**Lines:** 1543–1545
`toggleSidebar()` unconditionally removes the `sidebar-collapsed` class. Despite the name "toggle", it can only expand the sidebar, never collapse it. If the function is wired to a button the user presses repeatedly, subsequent presses are silently no-ops.
**Action:** Use `classList.toggle('sidebar-collapsed')` instead of `classList.remove(...)`, or rename the function to `showSidebar()` to match what it actually does.

### `setMode` references `playLibrary` and `deckLoaded` from outer scope without null-guarding
**Severity:** Low
**Lines:** 1540
The condition `if (isPlay && playLibrary.length === 0 && deckLoaded)` is safe because `playLibrary` is always initialized as an array and `deckLoaded` is a boolean, but if the variable declarations are ever reorganized the dependency on initialization order is invisible from within this function.
**Action:** No immediate action needed, but a comment noting the dependency on module-level state would be helpful.

### No guard against unknown `mode` values
**Severity:** Low
**Lines:** 1532
If `setMode` is called with a value other than `'play'` or `'prepare'` (e.g., `setMode('edit')` from a future feature), `isPlay` becomes `false` and the UI silently resets to prepare-mode without any warning.
**Action:** Add an early-return guard: `if (mode !== 'play' && mode !== 'prepare') return;` or log an error for unexpected values.

## Summary
A small, focused section. The main issue is that `toggleSidebar` is misleadingly named — it is a one-way operation that only expands the sidebar. The remaining findings are minor defensive-programming concerns.
