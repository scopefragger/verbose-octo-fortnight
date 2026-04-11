# Static Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` calls `renderPlayHand` unconditionally
**Severity:** Medium
**Lines:** 1634
`renderManaPool()` always calls `renderPlayHand()` at the end to refresh affordability indicators. If `renderPlayHand` is not yet defined (hoisting order) or is expensive, this creates a hidden dependency and potential for infinite loops if `renderPlayHand` ever calls `renderManaPool` directly or indirectly.
**Action:** Document the call explicitly with a comment explaining the dependency, and verify there is no circular call chain between these two functions.

### No guard on `document.getElementById('mana-pool-pips')`
**Severity:** Medium
**Lines:** 1624
`renderManaPool()` calls `document.getElementById('mana-pool-pips')` and immediately sets `.innerHTML` without checking if the element exists. If the play UI is not rendered (e.g., before `startPlay()` runs), this will throw a `TypeError`.
**Action:** Add a null guard: `if (!pips) return;` before accessing `.innerHTML`.

### `getLandMana` returns `{ C: 1 }` as a catch-all
**Severity:** Low
**Lines:** 1577
Non-basic lands that have no `produced_mana` field and no matching subtype silently produce 1 colorless mana. This may be intentionally permissive, but it means dual lands, fetch lands, etc., appear to tap for colorless unless Scryfall data is present.
**Action:** Add a comment clarifying the intentional fallback behavior so future maintainers understand it is not a bug.

### `spendMana` does not validate that the mana pool can cover costs
**Severity:** Medium
**Lines:** 1606–1621
`spendMana()` uses `Math.max(0, ...)` to clamp values but does not check `canAfford()` before spending. Callers are expected to check `canAfford()` first, but this is not enforced at the function level, so a bug in a caller could silently over-spend.
**Action:** Add an assertion or early return if `!canAfford(manaCost)` at the top of `spendMana()`, or document clearly that the caller must gate this call behind `canAfford()`.

### `parseMana` treats hybrid costs as generic
**Severity:** Low
**Lines:** 1588
Hybrid mana symbols (e.g., `{W/U}`) are counted as generic cost. This is noted in a comment but may produce incorrect affordability results for hybrid-cost cards (e.g., a card costing `{W/U}` could be paid with any color but here is treated as generic).
**Action:** Consider a more accurate hybrid handling or expand the comment to document the known limitation.

## Summary
The Play State section is generally well-structured with clear variable declarations and logical mana calculation functions. The main risks are the missing null guard in `renderManaPool`, the lack of defensive checks in `spendMana`, and the hidden call dependency from `renderManaPool` to `renderPlayHand`.
