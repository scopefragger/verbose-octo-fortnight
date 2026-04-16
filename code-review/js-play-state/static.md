# Static Code Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` assumes `#mana-pool-pips` always exists
**Severity:** Medium
**Lines:** 1624
`document.getElementById('mana-pool-pips')` is called without a null guard. If the play-mode panel is not yet rendered in the DOM (e.g. the UI state has not transitioned), `pips` will be `null` and `pips.innerHTML = …` will throw a TypeError.
**Action:** Add `if (!pips) return;` immediately after the `getElementById` call.

### `canAfford` ignores `X` mana cost
**Severity:** Low
**Lines:** 1593–1604
`parseMana` tracks `X` pips, but `canAfford` never checks `cost.X`. A card with only `{X}` in its cost will always appear affordable regardless of the pool. This is a silent logic gap — X costs are typically open-ended, but completely ignoring them can mislead the player.
**Action:** Document the deliberate omission with a comment, or add a UI indicator that X costs are not validated.

### `spendMana` does not validate that the pool can cover the cost
**Severity:** Medium
**Lines:** 1606–1621
`spendMana` modifies `manaPool` regardless of whether `canAfford` was called first. If called independently it can silently over-deduct (clamped to 0 by `Math.max`, so state won't go negative, but the spend is incorrect). No assertion or guard ties the two functions together.
**Action:** Either assert `canAfford(manaCost)` at the top of `spendMana` and throw/return early, or document that callers are responsible for calling `canAfford` first.

### `getLandMana` fallback always returns `{ C: 1 }` for dual/fetch lands
**Severity:** Low
**Lines:** 1570–1578
Non-basic lands (duals, fetches, shocklands) that lack `produced_mana` will be treated as producing a single colourless mana. This is a known limitation but is not commented.
**Action:** Add an inline comment acknowledging the limitation so future maintainers understand it is intentional.

### Global mutable state variables declared with `let`
**Severity:** Low
**Lines:** 1548–1558
`playLibrary`, `playHand`, `playBattlefield`, `playGraveyard`, `playExile`, `playTurn`, `playLife`, `ctxTarget`, `selectedBFId`, `selectedHandIdx`, and `manaPool` are all module-level `let` variables with no encapsulation. Any function in the file can silently mutate them.
**Action:** No immediate fix required (single-file architecture accepts this), but consider grouping them under a single `playState` object to make the shared-state boundary explicit.

## Summary
The play-state section is generally well-structured. The most actionable issues are the missing null guard in `renderManaPool` (can throw at runtime) and the lack of a guard in `spendMana` to prevent logically-incorrect over-deduction. The `canAfford` / X-mana gap is a minor UX concern worth documenting.
