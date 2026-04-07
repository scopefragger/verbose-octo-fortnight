# Code & Pattern Review — Deck Panel / Sidebar
Lines: 80–93 | File: public/mtg-commander.html

## Findings

### Transition property targets `opacity` only — no `visibility` transition
**Severity:** Low
**Lines:** 88, 91–92
The `transition: opacity 0.2s ease` animates the fade-out correctly, but because `visibility: hidden` is not present in the collapsed state (see Static review), there is no paired `visibility` transition (e.g., `visibility 0s 0.2s`) to defer the accessibility removal until after the fade completes. If `visibility: hidden` is added later without the matching transition delay, the panel will snap-disappear before the opacity animation finishes.
**Action:** When adding `visibility: hidden`, use `transition: opacity 0.2s ease, visibility 0s 0.2s` to sequence the transitions correctly.

### `overflow-x: hidden` alongside `overflow-y: auto` — potential scroll chaining side-effect
**Severity:** Low
**Lines:** 86–87
Setting both `overflow-y: auto` and `overflow-x: hidden` on the same element creates a new block formatting context and can cause unexpected scroll chaining or clipping of absolutely-positioned child elements (e.g., dropdown menus, tooltips). This is a known browser quirk — `overflow-x: hidden` implicitly promotes the element to a scroll container on the cross-axis.
**Action:** Verify that no child elements (e.g., autocomplete dropdowns in the Import pane) rely on overflowing the `.deck-panel` bounds. Consider using `overflow-x: clip` (where supported) instead of `hidden` to avoid creating an unintended scroll container.

### No section comment separating `.deck-panel` from preceding rules
**Severity:** Low
**Lines:** 80
The `/* === DECK PANEL === */` comment is present and follows the established `=== ... ===` naming convention used throughout the file. This is consistent and correct — no issue here.

## Summary
The patterns in this segment are consistent with the rest of the file. The two low-severity findings relate to a missing `visibility` transition pair (relevant only if the accessibility fix is applied) and the browser side-effect of combining `overflow-x: hidden` with `overflow-y: auto`, which could clip child popups in the sidebar.
