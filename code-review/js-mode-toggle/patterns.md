# Patterns Review — js-mode-toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Misleading function name `toggleSidebar`
**Severity:** Medium
**Lines:** 1543–1545
The function only removes the collapsed class; it never adds it. Naming it `toggleSidebar` violates the principle of least surprise — any reader or future developer will expect bidirectional behaviour.
**Action:** Rename to `openSidebar()` or `showSidebar()` to match actual semantics.

### Inline `style.display` vs CSS class pattern inconsistency
**Severity:** Low
**Lines:** 1536–1537
Other visibility-toggling in the file (e.g., `play-area`, `.layout`) is done with CSS classes. Using `style.display` directly on `stats-panel` and `hand-panel` is an inconsistent pattern that is harder to override from CSS.
**Action:** Use `classList.toggle('hidden', isPlay)` (with a `.hidden { display: none }` utility rule) to match the rest of the file's visibility pattern.

### No feedback when `startGame()` is skipped
**Severity:** Low
**Lines:** 1540
If the user clicks Play but `deckLoaded` is false, the mode switches to play visually but `startGame()` is not called and no toast or message is shown. The user sees an empty play area with no explanation.
**Action:** Add an `else` branch with `showToast('Import a deck first', true)` to provide feedback when the game cannot start.

## Summary
The section has two pattern issues: a misleading function name (`toggleSidebar`) and mixed visibility strategies (inline style vs CSS class). Both are quick to fix and would improve consistency across the file.
