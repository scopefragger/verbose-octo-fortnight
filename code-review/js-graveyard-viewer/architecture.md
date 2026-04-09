# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `showGraveViewer` handles both graveyard and exile in one function via branching
**Severity:** Low
**Lines:** 2041–2054
A single function handles both graveyard and exile zones by branching on the `zone` parameter. This is a reasonable approach for two similar zones, but if more zones are added (e.g., command zone, face-down exile), the branching will grow. Currently the only difference is which array is used and what the title text is.
**Action:** No immediate action required. If more zones are added, consider passing the zone data directly: `showGraveViewer(cards, title)` instead of resolving zone data from the parameter inside the function.

### Viewer relies on global arrays `playGraveyard` and `playExile` directly
**Severity:** Low
**Lines:** 2042
`showGraveViewer` reads `playGraveyard` and `playExile` directly from module scope. This is consistent with the rest of the file's state management but means the viewer cannot be used with arbitrary card arrays (e.g., for a preview or test without the global play state).
**Action:** Pass the card arrays as parameters for better composability: `showGraveViewer(zone, cards)` or `showZoneViewer(title, cards)`.

## Summary
The graveyard viewer is a small, focused rendering function with no significant architectural issues for a single-file app. The main opportunities for improvement are accepting card arrays as parameters rather than reading global state directly, which would make the function more composable.
