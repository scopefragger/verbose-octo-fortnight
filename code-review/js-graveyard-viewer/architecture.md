# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Calls `showCardDetail` (prepare-mode function) from play-mode context
**Severity:** Medium
**Lines:** 2047
`showCardDetail` is defined in the prepare-mode section and fetches card data from Scryfall by name. The graveyard viewer is a play-mode feature that already has card objects in memory (`playGraveyard` and `playExile` contain full card data). Calling `showCardDetail` from here crosses the prepare/play mode boundary and makes an unnecessary network request.
**Action:** Create a `showPlayCardDetail(card)` function that populates the focus panel from an already-loaded card object, or refactor `showCardDetail` to accept either a name (triggers Scryfall fetch) or a card object (uses cached data).

### Single function handles both graveyard and exile zones
**Severity:** Low
**Lines:** 2041–2053
`showGraveViewer` handles both zones via a string parameter. The title and card list are the only differences. This is a reasonable pattern for small functions, but if graveyard and exile need different action menus in the future (e.g., graveyard has "Cast from graveyard", exile has different rules), the function will become more complex.
**Action:** No immediate change needed. Document the zone parameter contract.

### Viewer has no close button visible in the rendered HTML
**Severity:** Low
**Lines:** 2040–2054
The function renders card content but doesn't add a close button in JS. The close mechanism must exist elsewhere (backdrop click or a static HTML close button). This split makes the viewer harder to understand in isolation.
**Action:** Verify a close button exists in the HTML template for `grave-viewer` and add a reference comment in the JS function.

## Summary
The main architectural concern is the cross-mode boundary call to `showCardDetail` from play mode. This creates an unnecessary Scryfall network dependency and breaks the separation between prepare-mode (fetch-first) and play-mode (use-cached-data) patterns.
