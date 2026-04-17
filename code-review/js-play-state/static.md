# Static Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool()` dereferences `pips` without null guard
**Severity:** Medium
**Lines:** 1624, 1626, 1628
`document.getElementById('mana-pool-pips')` can return `null` if the element does not exist in the DOM (e.g. during testing, future HTML restructuring, or if called before DOMContentLoaded). Subsequent `.innerHTML` access on `null` will throw a `TypeError`.
**Action:** Add a null guard: `if (!pips) return;` immediately after the `getElementById` call.

### `spendMana()` silently over-spends when mana pool is insufficient
**Severity:** Medium
**Lines:** 1606–1621
`spendMana()` is called independently of `canAfford()` — callers at line 1714 do check `canAfford` first, but there is no internal guard. If called directly (e.g. via future bot/LLM tooling or a bug at a call site), it will drive pool values below zero before `Math.max(0, …)` clamps colored mana, but the generic drain loop does not clamp — `manaPool[c]` can go negative if `generic` is never fully satisfied.
**Action:** Clamp each spend in the generic drain loop: `manaPool[c] = Math.max(0, manaPool[c] - spend)`.

### `getLandMana()` assumes `produced_mana` entries are always valid MANA_COLORS members
**Severity:** Low
**Lines:** 1567
`card.produced_mana` comes from the Scryfall API. Scryfall can return values such as `'S'` (snow) or `'P'` (Phyrexian) which are not in `MANA_COLORS`. These would be written into `result` with arbitrary keys, silently ignored by mana logic but potentially causing confusion when the result is passed to `canAfford` or `spendMana`.
**Action:** Filter `produced_mana` entries to `MANA_COLORS` members before accumulating, or normalise unknown symbols to `'C'`.

### Hybrid mana counted as generic loses information
**Severity:** Low
**Lines:** 1588
Hybrid costs (`{W/U}`, `{2/W}`) are counted as a single generic pip. A card with `{W/U}` could be paid with one blue — but the current logic demands one generic from the total pool. This is not a crash bug but produces incorrect affordability results.
**Action:** Document the limitation with a comment, or implement proper hybrid resolution (try each half of the hybrid as colored before falling back to generic).

## Summary
The segment is generally well-structured, but `renderManaPool` lacks a null guard on its DOM lookup, `spendMana` can produce negative pool values in the generic drain path, and API-sourced `produced_mana` values are not sanitised against the known color set.
