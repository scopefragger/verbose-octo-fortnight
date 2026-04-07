# Architecture Review — Main Layout Wrapper
Lines: 785–965 | File: public/mtg-commander.html

## Findings

### Prepare-mode and Play-mode panels co-exist in the same DOM subtree
**Severity:** Medium
**Lines:** 785–965
The root `.layout` div contains panels belonging to two distinct application modes: Prepare mode (`.deck-panel`, `.stats-panel`, `.hand-panel`) and Play mode (`.play-area`). Visibility toggling between modes is handled by JS (`setMode()`, Section 13) adding/removing CSS classes or `display` styles. This means both mode trees are always present in the DOM, with the inactive tree just hidden. Over time this makes the markup harder to reason about — a developer reading any one panel cannot tell at a glance which mode it belongs to.
**Action:** Add a `data-mode="prepare"` / `data-mode="play"` attribute to each top-level panel div as a self-documenting convention. Longer term, consider conditionally rendering the play area only after the user enters Play mode, reducing initial DOM weight.

### Inline event handlers couple view layer directly to global function namespace
**Severity:** Medium
**Lines:** 790–791, 823, 826–827, 834–835, 880–883, 899, 904, 906, 915–919, 923, 944, 952–953
Every interactive element calls a globally scoped function by name via `onclick="..."`. This tightly couples the HTML structure to the JS global namespace — renaming, namespacing, or modularising any of these functions requires a corresponding HTML change. It also prevents event delegation patterns and makes unit testing the handlers impossible without a real DOM.
**Action:** Wire all event listeners in a single `DOMContentLoaded` initialisation block using `addEventListener`. This is low priority for a single-file app but becomes important if the JS is ever split into modules.

### Card Focus Panel is a sibling of the battlefield, not a child
**Severity:** Low
**Lines:** 934–949, 923–932
`.card-focus-panel` is a sibling `div` to `.battlefield` inside `.play-area`, but logically it describes a card selected on the battlefield. Positioning it via CSS (absolute/fixed) rather than DOM nesting means the relationship is implicit. If the battlefield is ever scrolled or the play area is restructured, the panel's visual positioning may need CSS updates in a non-obvious place.
**Action:** Document the intended positioning relationship with a comment, or nest the focus panel inside `.battlefield` if the CSS supports it.

### Grave bar and hand strip are structural children of play-area but unrelated to the battlefield grid
**Severity:** Low
**Lines:** 951–962
`.grave-bar` and `.play-hand-strip` are direct children of `.play-area` alongside `.battlefield`. They are conceptually part of the play surface but are not battlefield zones. This flat structure works but means any future layout change to `.play-area` must account for three distinct child concerns (controls, battlefield, hand/grave chrome) without structural grouping.
**Action:** Consider wrapping `.battlefield`, `.grave-bar`, and `.play-hand-strip` in a `.battlefield-wrapper` div to make the grouping explicit.

## Summary
The most significant architectural issue is that two application modes share a single undifferentiated DOM subtree without annotating which elements belong to which mode. The pervasive use of inline `onclick` handlers is a secondary concern — acceptable in a single-file prototype but will become a maintenance burden if the file grows. Structural grouping of play-area sub-sections would improve future maintainability.
