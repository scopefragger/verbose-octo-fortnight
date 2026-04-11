# Patterns Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Emoji characters embedded in `textContent` set via JavaScript
**Severity:** Low
**Lines:** 2043
`'🪦 Graveyard'` and `'✨ Exile'` are set via `textContent`, which is safe and correct. The use of emoji as zone icons is consistent with the rest of the file. No issue here; noted for documentation purposes.
**Action:** No change needed.

### `hidden` CSS class used here, `visible` used for focus panel — inconsistent visibility pattern
**Severity:** Low
**Lines:** 2053
This function removes the `hidden` class to show the modal, while the card focus panel adds the `visible` class. The two modals in the same app use opposite CSS toggle patterns.
**Action:** Standardise on one pattern. The `hidden` class approach (present in HTML markup by default) is more semantic; migrate the focus panel to also use `hidden`/visible via `hidden` attribute or consistent class naming.

### Empty state uses inline style duplicating pattern seen elsewhere
**Severity:** Low
**Lines:** 2052
Same inline `style="color:var(--text-dim);font-size:0.85rem"` empty-state pattern seen in `renderBattlefield()` and `renderPlayHand()`. Three locations in the file repeat this pattern.
**Action:** Extract to a `.zone-empty` CSS class (or similar) and use it consistently.

### `showCardDetail` called with card name — same pattern as deck list and hand simulator
**Severity:** Low (informational)
**Lines:** 2047
`onclick="showCardDetail('...')"` is the same pattern used in the deck list view (line 1310) and hand simulator (line 1424). The pattern is consistent and correct.
**Action:** No change needed. The consistent use of `escapeQuotes()` in all three locations is good.

## Summary
The Graveyard Viewer section follows established patterns but shares the inconsistency of using `hidden` class toggling where other sections use `visible`. The repeated inline empty-state style and the inconsistent modal visibility approach are the primary pattern issues to address.
