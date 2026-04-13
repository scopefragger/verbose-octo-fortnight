# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `showGraveViewer` handles both graveyard and exile zones in one function
**Severity:** Low
**Lines:** 2041–2054
A single function handles two logically distinct zones by branching on the `zone` parameter. This is a reasonable simplification for a small codebase, but the function's name (`showGraveViewer`) only implies graveyard, not exile. The two zones have different semantics in MTG (exile is not accessible in most cases; graveyard cards can be returned).
**Action:** Rename to `showZoneViewer(zone)` to make the dual purpose explicit, or create two thin wrappers that call an internal `_showZoneViewer`.

### `showGraveViewer` fetches display data from module globals (`playGraveyard`, `playExile`)
**Severity:** Low
**Lines:** 2042
The function reads global arrays directly. If the viewer were ever opened for a different game state snapshot (e.g., opponent's graveyard in a future multi-player mode), the function would need to be refactored.
**Action:** Acceptable for current single-player scope. No immediate change needed.

### Clicking a graveyard card calls `showCardDetail` — coupling between viewer and card detail
**Severity:** Low
**Lines:** 2047
The graveyard viewer directly references `showCardDetail`. This creates a coupling between the graveyard viewer feature and the card detail panel feature. If `showCardDetail`'s signature changes, both must be updated.
**Action:** For the current single-file architecture this is acceptable. Document the dependency.

## Summary
The function is appropriately small and focused for the current use case. The main improvement would be renaming it to reflect that it serves both graveyard and exile, and optionally accepting the card array as a parameter rather than reading globals directly.
