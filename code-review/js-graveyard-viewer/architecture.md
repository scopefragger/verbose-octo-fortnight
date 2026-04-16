# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `showGraveViewer` selects data source and renders — two responsibilities in one function
**Severity:** Low
**Lines:** 2041–2054
The function both selects which zone's card array to use (`playGraveyard` vs `playExile`) and performs the full DOM rendering. These are distinct concerns: zone selection is data logic, rendering is UI logic.
**Action:** Extract a `renderZoneViewer(cards, title)` helper that performs the DOM update, and keep `showGraveViewer(zone)` as a thin dispatcher that resolves the data and delegates to the renderer.

### Graveyard viewer card click delegates to `showCardDetail(name)` — requires a second Scryfall fetch
**Severity:** Medium
**Lines:** 2047
Clicking a card in the graveyard viewer calls `showCardDetail(card.name)`, which at line 1435–1436 re-fetches the card from Scryfall by name. However, the full card object is already present in `playGraveyard`/`playExile`. This is an unnecessary network round-trip.
**Action:** Introduce a `showCardDetailFromObject(card)` variant (or extend `showCardDetail` to accept either a name or a card object) so that the already-loaded card data is reused directly.

### `showGraveViewer` tightly coupled to specific DOM element IDs
**Severity:** Low
**Lines:** 2043, 2044, 2053
The function references three specific element IDs (`grave-viewer-title`, `grave-viewer-cards`, `grave-viewer`) directly. Any rename of these IDs in the HTML requires updating this function.
**Action:** Accept an optional container reference parameter, or at minimum cache all three element references at the start of the function so the coupling is explicit and co-located.

### No mechanism to close the graveyard viewer from within this section
**Severity:** Low
**Lines:** 2040–2054
`showGraveViewer` opens the viewer but there is no `closeGraveViewer` function defined here or visible nearby. Close logic presumably lives in the HTML markup as an inline handler. This is an asymmetry worth noting.
**Action:** Define a `closeGraveViewer()` function adjacent to `showGraveViewer` for symmetry and discoverability, even if it is a one-liner.

## Summary
The section is compact but conflates data selection with DOM rendering, and the card-click handler causes a redundant Scryfall re-fetch when the card object is already in memory. Extracting a render helper and a card-detail-from-object function would address both concerns.
