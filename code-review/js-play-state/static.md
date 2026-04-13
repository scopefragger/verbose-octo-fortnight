# Static Code Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `canAfford` does not account for X costs
**Severity:** Medium
**Lines:** 1593–1604
`canAfford` checks colored and generic mana requirements but ignores `cost.X`. Spells with `{X}` in their cost are never reliably affordable — `X` costs require the player to choose a value, so the function should at least consider any `{X}` cost as always requiring further mana beyond what `canAfford` currently computes.
**Action:** Either treat `{X}` as always affordable (the player chooses X=0) or document that X spells are shown as affordable regardless of pool size.

### `renderManaPool` calls `renderPlayHand()` on every mana change
**Severity:** Low
**Lines:** 1634
Every time the mana pool changes, `renderPlayHand()` is called to refresh affordability indicators. If `renderPlayHand` is expensive (iterates all hand cards, builds HTML), calling it from within `renderManaPool` creates a hidden performance concern, especially if `renderManaPool` is called frequently (e.g., per land tap).
**Action:** Consider debouncing `renderPlayHand` from `renderManaPool`, or batching mana changes.

### `spendMana` drain order is hardcoded
**Severity:** Low
**Lines:** 1614
Generic mana is drained from colors in a hardcoded order `['C','G','R','B','U','W']`. This means colorless is spent first, then green, etc., which may not match what the player intends. There is no user control over the drain priority.
**Action:** Document this as a known limitation or let the user choose which color to use for generic costs.

### `getLandMana` returns `{ C: 1 }` as fallback for non-basic lands
**Severity:** Low
**Lines:** 1577
Any non-basic land without `produced_mana` data defaults to producing 1 colorless mana. This is likely incorrect for dual lands, fetch lands, etc. that would have `produced_mana` from Scryfall. However, if Scryfall data is missing, this silent fallback could confuse users.
**Action:** Document the limitation or show a warning when the colorless fallback is used.

## Summary
The mana logic is generally well-structured. The main concern is that X-cost spells are not properly handled in `canAfford`, and the drain order for generic mana is fixed without user input. Both are functional issues that could mislead players during gameplay.
