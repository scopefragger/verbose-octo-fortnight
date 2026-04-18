# Patterns Review — js-graveyard-viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Inline empty-state style
**Severity:** Low
**Lines:** 2052
```js
'<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>'
```
Same inline empty-state pattern observed in `renderBattlefield` and `renderPlayHand`. All three should use a shared CSS class (e.g., `.empty-zone`) for consistency and maintainability.
**Action:** Add `.empty-zone { color: var(--text-dim); font-size: 0.85rem; padding: 4px; }` and use `<div class="empty-zone">Empty</div>` here and in the other locations.

## Summary
No major pattern violations. One minor inline-style issue consistent with the pattern seen elsewhere in the file — consolidating into a shared CSS class would eliminate it across all affected sections at once.
