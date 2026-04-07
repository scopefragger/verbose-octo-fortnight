# Architecture Review — Deck Panel / Sidebar
Lines: 80–93 | File: public/mtg-commander.html

## Findings

### Collapse state encoded as a parent-class toggle on a distant ancestor
**Severity:** Low
**Lines:** 90–93
The collapsed state is applied via `.sidebar-collapsed` on an ancestor element, which hides `.deck-panel` through a descendant selector. This is a reasonable CSS pattern, but it creates an implicit coupling between the JS that toggles `.sidebar-collapsed` and the CSS here — neither location documents the other. In a single-file app this is acceptable, but the toggle logic (in `toggleSidebar()` around line 1545) and the visual outcome here are invisible to each other.
**Action:** Add a short comment on the `.sidebar-collapsed .deck-panel` rule referencing `toggleSidebar()` so the coupling is explicit.

### Visual collapse does not compose with a `display: none` or `height: 0` approach
**Severity:** Low
**Lines:** 88–93
The `transition: opacity 0.2s ease` + `opacity: 0` pattern keeps the panel occupying grid column space even when fully collapsed. Collapsing the grid column width (done in the Layout Grid segment, lines 67–78) is what actually reclaims the space. These two mechanisms must remain in sync. If the grid-column collapse is ever changed or removed independently, the panel will become an invisible but space-consuming block.
**Action:** Document the dependency between this opacity collapse and the grid-column width collapse in the Layout Grid rule or via a shared comment block.

## Summary
The architecture is coherent for a single-file app. The main concern is implicit coupling between the CSS collapse state here and the JS `toggleSidebar()` function, with a secondary dependency on the grid column collapse defined elsewhere. Both are low risk but worth documenting.
