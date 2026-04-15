# Patterns Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic strings for element IDs
**Severity:** Low
**Lines:** 1534–1538
Element IDs (`'mode-prepare'`, `'mode-play'`, `'stats-panel'`, `'hand-panel'`, `'play-area'`) are referenced as magic strings. This is consistent with the rest of the file but is a shared anti-pattern.
**Action:** Define ID constants at the top of the JS section (consistent with a global refactor recommendation across all segments).

### Inline `style.display` manipulation vs. CSS class toggle
**Severity:** Low
**Lines:** 1536–1537
`stats-panel` and `hand-panel` are hidden via `style.display`, while `play-area` and `.layout` use CSS class toggles. Mixing these two approaches makes it harder to reason about visibility state.
**Action:** Prefer CSS class toggles throughout (e.g. `.hidden` class with `display: none`) for consistency. Remove `style.display` manipulation from JS.

### `toggleSidebar` naming violates the "do what the name says" principle
**Severity:** Low
**Lines:** 1543
See Static review. This is also a naming pattern issue — functions named `toggleX` in this file are expected to be bidirectional.
**Action:** Rename to `showSidebar()` to match its actual one-way behaviour.

## Summary
The section is small with minimal pattern violations beyond what is pervasive across the file. The mixing of `style.display` and class-based visibility control is the most actionable pattern inconsistency to fix.
