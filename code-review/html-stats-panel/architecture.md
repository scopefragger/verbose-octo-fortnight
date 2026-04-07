# Architecture Review — Stats Panel
Lines: 847–873 | File: public/mtg-commander.html

## Findings

### Stats panel is a peer of the sidebar panes, but behaves as a separate content area
**Severity:** Low
**Lines:** 847–873
The stats panel sits inside the same `#main-layout-wrapper` as the sidebar import/deck-list/saved-decks panes (lines 796–843), implying it is a sidebar tab. However, `renderStats()` (JS segment 8, lines 1196–1287) writes dynamic bar charts and pip elements directly into IDs within this panel. The panel's role — content tab vs. persistent dashboard widget — is ambiguous from the markup alone, making future layout changes harder to reason about.
**Action:** Add a `data-panel="stats"` attribute (or a semantic role) and ensure the tab-switching logic treats this panel consistently with the other sidebar panes.

### Chart containers have no minimum height or placeholder structure
**Severity:** Low
**Lines:** 861, 865, 869
`#mana-curve`, `#color-pips`, and `#type-breakdown` are empty divs whose structure is entirely determined at runtime by `renderStats()`. There is no skeleton, `aria-label`, or minimum dimension declared in the HTML. This couples the visual contract of the panel entirely to the JS render function — if that function is called with partial data or not at all, the containers collapse to zero height with no visible indicator.
**Action:** Add `aria-label` attributes to the container divs and consider a CSS `min-height` on each chart container so the layout is stable before data arrives.

## Summary
The panel structure is straightforward, but its role as a sidebar tab versus a standalone content panel is architecturally ambiguous. The three chart containers have no structural or accessibility scaffolding independent of the JS renderer, creating tight coupling between markup and runtime state.
