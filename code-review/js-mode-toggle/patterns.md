# Patterns Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic string `'play'` repeated without a constant
**Severity:** Low
**Lines:** 1533, 1540
The string `'play'` is used as the canonical mode identifier in `setMode` and in its conditional check. If the mode name ever changes, it must be updated in multiple places (including the HTML `onclick` attribute on line 781).
**Action:** Define a constant at the top of the script (e.g. `const MODE_PLAY = 'play'`) and reference it throughout.

### `toggleSidebar` does not actually toggle
**Severity:** Low
**Lines:** 1543–1545
The function name implies bidirectional behaviour, but the implementation only ever removes the collapsed class. This is misleading to future maintainers.
**Action:** Rename to `showSidebar()` or `expandSidebar()` to match the actual behaviour.

### Missing comment on the `playLibrary.length === 0 && deckLoaded` guard
**Severity:** Low
**Lines:** 1540
The compound condition on line 1540 encodes non-obvious business logic: "only auto-start a game if switching to play mode AND the library hasn't been initialised yet AND a deck is loaded." A brief inline comment would make this intent clear.
**Action:** Add a comment: `// auto-start on first switch to play mode`.

## Summary
Patterns are generally consistent with the rest of the file, but the magic string, misleading function name, and unexplained guard condition are minor quality issues worth addressing.
