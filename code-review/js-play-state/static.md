# Static Code Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `canAfford` does not account for X-cost spells
**Severity:** Medium
**Lines:** 1593–1604
`canAfford` checks colored costs and generic costs but ignores `cost.X`. A spell with `{X}{R}` has `cost.X = 1`, but `canAfford` will only check that the pool has `1R` without requiring any extra for X. This means spells with X in their cost are treated as cheaper than they actually are.
**Action:** Decide on a policy for X costs (e.g., require at least 1 generic mana for X as a minimum) and add that check to `canAfford`.

### `spendMana` generic drain order hard-coded as `['C','G','R','B','U','W']`
**Severity:** Low
**Lines:** 1614
The order in which colors are drained for generic costs is fixed. This may surprise players who prefer to drain colors in a different order (e.g., preserving colored mana for future casts).
**Action:** This is a UX/design decision rather than a bug, but it should be documented with a comment explaining the chosen drain order.

### `renderManaPool` calls `renderPlayHand()` unconditionally
**Severity:** Low
**Lines:** 1634
Every time mana changes, the entire hand is re-rendered. If the hand is large this is an unnecessary repaint on every mana update.
**Action:** Consider only re-rendering affordability indicators rather than full hand HTML, or debounce the call if performance issues arise.

### `getLandMana` fallback always returns `{ C: 1 }` for non-basic lands
**Severity:** Low
**Lines:** 1577
Non-basic lands that lack `produced_mana` data and don't match basic land subtypes return `{ C: 1 }`. This may be incorrect for dual lands, shock lands, etc. However the primary path (Scryfall `produced_mana`) should handle this for cards fetched via the API.
**Action:** Add a code comment noting this limitation so future maintainers understand the fallback behavior.

## Summary
The mana system is logically sound for straightforward cases. The main gap is handling of X-cost spells in `canAfford`, which could mislead players. The drain order for generic costs and the full hand re-render on every mana update are minor concerns.
