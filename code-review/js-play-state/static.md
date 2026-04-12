# Static Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` calls `renderPlayHand` unconditionally — circular risk
**Severity:** Medium
**Lines:** 1634
`renderManaPool()` always calls `renderPlayHand()` at the end to refresh affordability indicators. If `renderPlayHand()` itself triggers any code path that calls `renderManaPool()`, this creates an infinite call loop. There is no guard here and no comment explaining the dependency contract. At minimum a comment is needed; ideally this coupling should be broken.
**Action:** Audit `renderPlayHand()` to confirm it never calls `renderManaPool()`. Add a comment documenting the one-way dependency. If the call chain can close, add a re-entrancy guard.

### `renderManaPool` does not guard against `pips` being null
**Severity:** Medium
**Lines:** 1624
`document.getElementById('mana-pool-pips')` returns `null` if the DOM element does not exist (e.g. before the play view is rendered). The next line then unconditionally accesses `pips.innerHTML`, which would throw a `TypeError`.
**Action:** Add a null guard: `if (!pips) return;` immediately after the `getElementById` call.

### `getLandMana` returns `{ C: 1 }` for all non-basic lands
**Severity:** Low
**Lines:** 1577
The fallback branch returns one colorless mana for any land that has no `produced_mana` and is not a recognised basic land subtype. For non-mana-producing lands (e.g. utility lands, manlands before they animate) this over-counts available mana.
**Action:** Document the limitation with a comment. Consider returning `null` or `{}` and handling the absence of mana production at the call site.

### `spendMana` does not verify that the mana pool can actually cover the cost
**Severity:** Medium
**Lines:** 1606–1621
`spendMana()` deducts mana without first calling `canAfford()`. If called directly (e.g. from a context menu action) when the pool is insufficient, `manaPool` values go to zero via `Math.max(0, ...)` for colored but the generic loop silently under-spends — the cost is partially paid and no error is signalled.
**Action:** Add a guard at the top: `if (!canAfford(manaCost)) return false;` (or `throw`) and return `true` on success so callers can react.

### `parseMana` hybrid handling is lossy
**Severity:** Low
**Lines:** 1588
Hybrid symbols like `{W/U}` are treated as a single generic mana. A card with two hybrid symbols (e.g. `{W/U}{W/U}`) is counted as costing `{2}`, which overstates generic requirements and may cause `canAfford` to return false incorrectly.
**Action:** Add a comment acknowledging the approximation. A more accurate implementation would pick the cheaper colour for each hybrid pip based on the current mana pool.

## Summary
The section is mostly clean and readable. The main static risks are the missing null guard on `pips`, the unchecked `spendMana` call path, and the tight coupling between `renderManaPool` and `renderPlayHand`. These are correctness issues that could surface at runtime without being caught during normal play.
