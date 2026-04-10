# Static Code Review — js-play-state
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Hybrid mana symbols counted as generic — inaccurate for affordability
**Severity:** Medium
**Lines:** 1588
Hybrid mana symbols (e.g., `{G/W}`) are counted as `generic` in `parseMana()`. This is incorrect: a hybrid pip can be paid with either of two specific colors. Treating it as generic means `canAfford()` may report a card as unaffordable even if the player has the correct colors, or conversely, may approve spending the wrong color.
**Action:** Track hybrid pips separately and update `canAfford()` to check if at least one of the two colors can satisfy each hybrid pip.

### `canAfford` does not account for X mana costs
**Severity:** Low
**Lines:** 1593–1604
`parseMana()` tracks `X` pips, but `canAfford()` only checks colored and generic costs. X costs are silently ignored, so a spell with `{X}{R}` will show as affordable based only on the `{R}` requirement.
**Action:** Either ignore X intentionally and add a comment, or apply a minimum X=0 and note the limitation.

### `mana-pool-pips` element not guarded against null
**Severity:** Low
**Lines:** 1624
`renderManaPool()` calls `document.getElementById('mana-pool-pips')` without checking for null. If this element does not exist in the DOM (e.g., called during wrong mode), it will throw a TypeError.
**Action:** Add a null guard: `if (!pips) return;`.

### Global mutable state scattered across `let` declarations
**Severity:** Low
**Lines:** 1548–1558
All play-state variables are module-level mutable `let` declarations. There is no encapsulation; any function in the file can mutate them directly.
**Action:** This is acceptable for a single-file app, but consider grouping into a `playState` object for easier reset and debugging.

## Summary
The mana logic is mostly sound but has edge-case inaccuracies with hybrid and X mana. The element null guard is missing in `renderManaPool`, and global mutable state is widely scattered.
