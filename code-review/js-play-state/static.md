# Static Review — js-play-state
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### No null guard on `mana-pool-pips` element
**Severity:** Medium
**Lines:** 1624
`document.getElementById('mana-pool-pips')` is called without a null check. If `renderManaPool()` is ever called before the DOM is ready or outside play mode (where the element may not be rendered), `pips.innerHTML` will throw a TypeError.
**Action:** Add `if (!pips) return;` after the getElementById call.

### `X` mana cost not evaluated in `canAfford`
**Severity:** Low
**Lines:** 1593–1604
`parseMana` tracks `X` separately, but `canAfford` only checks `MANA_COLORS` and `generic` — `cost.X` is never evaluated. Casting an X-spell therefore always passes the affordability check regardless of current mana, which may mislead players.
**Action:** Document this as an intentional simplification (X = 0) with a comment, or add `if (cost.X > 0 && remaining < 1) return false;` as a minimal guard.

### `produced_mana: []` (empty array) falls through to type-line parse
**Severity:** Low
**Lines:** 1565
`card.produced_mana?.length` is falsy for an empty array. Scryfall sends `produced_mana: []` for lands that tap for no mana (e.g., Wastes or certain utility lands). The fallback type-line parse may then misclassify them.
**Action:** Change the guard to `card.produced_mana && card.produced_mana.length > 0` (same effect, but self-documenting) and add a comment explaining the empty-array edge case.

## Summary
Solid logic for a casual simulator. The main static risk is a missing null guard in `renderManaPool`; the X-mana and empty `produced_mana` issues are edge cases worth documenting rather than fixing urgently.
