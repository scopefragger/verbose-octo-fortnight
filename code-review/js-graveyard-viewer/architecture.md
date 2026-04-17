# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Viewer serves both graveyard and exile zones — implicit dual-purpose
**Severity:** Low
**Lines:** 2041–2053
`showGraveViewer(zone)` handles both the graveyard and exile zones with a single ternary-driven branching strategy. This is a reasonable design for two similar zones, but it means the function couples together two distinct game concepts (graveyard = cards that were destroyed; exile = cards removed from the game) into one viewer. If these zones ever need different display logic (e.g. exile showing the exile reason), the function will require more complex branching.
**Action:** The current approach is acceptable for identical display logic. Add a comment documenting the intentional dual use: `// Shared viewer for graveyard and exile — both display a list of cards with the same layout`.

### Close logic split between HTML inline `onclick` and JS — inconsistent modal lifecycle
**Severity:** Medium
**Lines:** 1002–1004, 2040–2054
The graveyard viewer is the only modal in the file that has no corresponding JS close function. Every other modal uses a JS function (`closeModal`, `closeTokenModal`/`hideTokenModal`) to manage its close lifecycle. Here, the viewer is closed entirely via raw inline JS in the HTML (`document.getElementById('grave-viewer').classList.add('hidden')`), duplicated in two places in the HTML markup.
**Action:** Add `function closeGraveViewer() { document.getElementById('grave-viewer')?.classList.add('hidden'); }` and update the HTML onclick attributes to call it. This makes the lifecycle consistent with other modals and enables programmatic close.

### `showGraveViewer` reads directly from global `playGraveyard` / `playExile`
**Severity:** Low
**Lines:** 2042
The function resolves the zone data from global arrays rather than accepting the card list as a parameter. This couples the viewer to the global play-state variables. A render function that accepts `cards` and `title` as parameters would be more reusable (e.g. for showing a deck list or search results in a similar layout).
**Action:** Consider refactoring to `showGraveViewer(zone, cards, title)` to decouple the viewer from global state, with the call site passing `playGraveyard` or `playExile` explicitly.

### `showCardDetail` called from graveyard viewer — cross-module dependency
**Severity:** Low
**Lines:** 2047
The graveyard viewer triggers the card detail modal (`showCardDetail`) on click. This creates a dependency from the graveyard viewer section to the Card Detail section. While unavoidable in a single-file app, it means refactoring `showCardDetail` (e.g. renaming it) requires finding and updating this call site.
**Action:** No structural change needed for a single-file app. Document the dependency with a comment.

## Summary
The most significant architectural issue is the inconsistent modal lifecycle — the graveyard viewer is the only modal without a JS close function, with close logic embedded as duplicated inline HTML. Adding `closeGraveViewer()` would align it with the rest of the codebase. The function's direct access to global state rather than accepting card arrays as parameters is a secondary concern.
