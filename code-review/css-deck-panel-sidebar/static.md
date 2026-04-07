# Static Code Review — Deck Panel / Sidebar
Lines: 80–93 | File: public/mtg-commander.html

## Findings

### No `width` or `min-width` constraint on `.deck-panel`
**Severity:** Low
**Lines:** 81–89
The `.deck-panel` rule has no explicit `width` or `min-width`. Its width is entirely governed by the parent grid column (defined elsewhere at `340px`). If the grid definition changes or is overridden (e.g., by the mobile media query), this panel has no self-contained size constraint, which could cause layout breakage silently.
**Action:** Document the dependency with a comment, or add a `min-width: 0` guard (standard flex/grid child best-practice) to prevent unexpected overflow.

### Collapse handled by opacity only — element remains in layout flow
**Severity:** Low
**Lines:** 90–93
`.sidebar-collapsed .deck-panel` sets `opacity: 0` and `pointer-events: none`, but does not set `visibility: hidden`. Screen readers and tab-order navigation can still reach the collapsed panel's children because `opacity: 0` alone does not remove the element from the accessibility tree.
**Action:** Add `visibility: hidden` alongside `opacity: 0` to fully remove the panel from both pointer and keyboard/accessibility interaction when collapsed.

## Summary
This is a small, well-scoped CSS block with no undefined references or dead rules. The two findings are low-severity edge cases: a missing self-contained width guard and an incomplete accessibility treatment for the collapsed state.
