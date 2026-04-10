# Static Code Review — js-mode-toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `playLibrary` referenced before declaration
**Severity:** Medium
**Lines:** 1540
`setMode()` at line 1540 reads `playLibrary.length`, but `playLibrary` is declared with `let` at line 1548 — seven lines later. In JavaScript, `let` declarations are not hoisted in a usable state (temporal dead zone). However, because `setMode` is only ever called from user interaction (after the full script has parsed), this does not cause a runtime error in practice. It is still a dangerous pattern: if `setMode` were ever called during script initialisation before line 1548 is reached, a `ReferenceError` would be thrown.
**Action:** Move the `playLibrary` declaration (and other play-state variables) above `setMode()`, or restructure so all play-state variables are declared in one block at the top of the script.

### `toggleSidebar` only removes, never adds `sidebar-collapsed`
**Severity:** Low
**Lines:** 1543–1545
`toggleSidebar` unconditionally removes `sidebar-collapsed` but never adds it. This makes it a one-direction toggle (always open sidebar), not a true toggle. The name implies bidirectional behaviour.
**Action:** Rename to `openSidebar()` to accurately describe its behaviour, or implement a real toggle with `classList.toggle('sidebar-collapsed')`.

### No guard for unknown mode values
**Severity:** Low
**Lines:** 1532–1541
`setMode` accepts any string. Passing an unrecognised mode (e.g., `setMode('prep')`) silently treats it as "prepare" (because `isPlay` is `false`). There is no validation.
**Action:** Add a guard: `if (mode !== 'play' && mode !== 'prepare') return;` or use an explicit check for both valid values.

## Summary
The section is small and mostly correct. The main concern is the ordering dependency with `playLibrary` declared in the next section, and the misleadingly named `toggleSidebar` which only opens the sidebar.
