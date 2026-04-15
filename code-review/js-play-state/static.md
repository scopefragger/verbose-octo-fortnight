# Static Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` called from `spendMana` before pool state is fully consistent
**Severity:** Low
**Lines:** 1620
`renderManaPool()` is called at the end of `spendMana()`, which also internally calls `renderPlayHand()` (line 1634). If `renderPlayHand` throws, the mana pool display is rendered but the hand isn't. No try/catch guards either call. Failure is silent.
**Action:** Wrap `renderPlayHand()` inside `renderManaPool` in a try/catch, or propagate errors so they surface visibly.

### `canAfford` does not account for X-cost spells
**Severity:** Medium
**Lines:** 1593–1604
`parseMana` tracks `X` separately, but `canAfford` only checks `cost.generic` and colored costs. X-cost spells (e.g. `{X}{R}`) report `X:1, generic:0`. The X amount is never compared against remaining pool mana, so `canAfford` always returns `true` for the X portion regardless of pool size.
**Action:** Decide on a policy for X (e.g. treat X as 0, or require at least 1 mana in pool). Document the decision with a comment. If "X costs 0", add a comment; if "X costs ≥ 1", add `remaining >= cost.generic + (cost.X > 0 ? 1 : 0)`.

### `getLandMana` is not used by `parseMana` or `canAfford`
**Severity:** Low
**Lines:** 1563–1578
`getLandMana` is defined here but its call sites are elsewhere in the file (in the play-core section). The function isn't logically part of mana cost parsing but of land tapping. This is a minor organizational concern but causes no bugs.
**Action:** No immediate code change needed; document with a comment that it belongs to the land-tap flow.

### Mutable global state with no reset guard
**Severity:** Low
**Lines:** 1548–1558
All play-state variables (`playLibrary`, `playHand`, etc.) are module-level `let` declarations. There is no guard against calling game functions before the game is initialized (e.g. `spendMana` before a game starts).
**Action:** Consider a `gameStarted` flag or rely on the existing flow to ensure initialization before use; add a comment documenting preconditions.

## Summary
The play-state section is generally straightforward, but `canAfford` silently ignores X-cost mana requirements, which can mislead the affordability indicator shown in the hand. The remaining issues are low-severity organizational or robustness concerns.
