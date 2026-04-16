# Code & Pattern Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic string `'play'` used as the sole mode discriminator
**Severity:** Low
**Lines:** 1533
The string `'play'` is hardcoded as the only named mode. If a third mode is ever added, every conditional in `setMode()` would need updating. There is no constant or enum defining valid mode values.
**Action:** Define a `MODES` constant object (e.g. `const MODES = { PREPARE: 'prepare', PLAY: 'play' }`) and use those constants wherever mode strings appear.

### `toggleSidebar()` misleading name
**Severity:** Low
**Lines:** 1543–1545
The function is named `toggleSidebar` but only ever removes the `sidebar-collapsed` class. This is inconsistent with the standard meaning of "toggle" (flip between two states).
**Action:** Rename to `openSidebar()` if one-directional, or implement true toggle behaviour to match the name.

### Inline `style.display` mixed with class-based toggling
**Severity:** Low
**Lines:** 1536–1537
`stats-panel` and `hand-panel` are hidden/shown via `element.style.display`, while `play-area` and `.layout` use `classList.toggle`. Mixing inline style mutation and class-based toggling for the same show/hide purpose is inconsistent and makes it harder to reason about visibility state.
**Action:** Add a CSS utility class (e.g. `.hidden { display: none; }`) and use `classList.toggle('hidden', ...)` for all visibility switches, removing inline style manipulation.

## Summary
The section is small and readable, but mixes two different show/hide patterns (inline style vs CSS class) and uses an unnamed string literal for the mode discriminator. The misleadingly named `toggleSidebar()` is the most actionable quick fix.
