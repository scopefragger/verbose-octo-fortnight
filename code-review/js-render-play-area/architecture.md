# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` is a render helper mixed into a section with orchestration functions
**Severity:** Low
**Lines:** 1882–1903
`bfCardHTML` is a pure template function (no DOM side-effects) but is defined between `renderBattlefield` (DOM mutation) and `renderPlayHand` (DOM mutation). Mixing render helpers with orchestration functions makes the section harder to scan.
**Action:** Define `bfCardHTML` and `tokenColorClass` before `renderBattlefield` since they are called from within it, or group all template helpers together in a dedicated section.

### `renderPlayArea` does not call `renderManaPool`
**Severity:** Low
**Lines:** 1859–1868
`renderPlayArea()` re-renders the battlefield, hand, counters, and library count, but does not re-render the mana pool display. If mana pool state changes trigger `renderPlayArea` (e.g., after a turn advance), the pool display would be stale.
**Action:** Add `renderManaPool()` to `renderPlayArea()` so the function truly represents the full play area state.

### Full innerHTML replacement on every render
**Severity:** Low
**Lines:** 1873–1874, 1912
Each render call replaces the entire `bf-perms`, `bf-lands`, and `play-hand-cards` innerHTML. This destroys and recreates all DOM nodes on every state change, which loses any event listeners attached to individual card nodes and is inefficient for large battlefields.
**Action:** For the current feature scope this is acceptable. If performance becomes an issue, consider keyed diffing (virtual DOM pattern) or only re-rendering changed cards.

## Summary
The render functions are straightforward HTML-string generators. The main architectural gaps are the missing `renderManaPool` call in `renderPlayArea` and the mixing of template helpers with orchestration functions. Full innerHTML replacement is a known trade-off in single-file vanilla JS apps.
