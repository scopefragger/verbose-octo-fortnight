# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool()` calls `renderPlayHand()` — cross-concern coupling
**Severity:** Medium
**Lines:** 1634
`renderManaPool()` calls `renderPlayHand()` at the end to refresh affordability indicators. This means the mana-pool module owns knowledge of the hand-render module, creating a bidirectional dependency chain. `renderPlayHand` in turn likely reads from `manaPool` to compute affordability, making the two tightly coupled.
**Action:** Invert the dependency: have `renderPlayHand()` query `manaPool` and `canAfford()` itself on each render, rather than being triggered by the pool. Alternatively, introduce a lightweight event/signal (e.g. `onManaPoolChanged`) that `renderPlayHand` subscribes to.

### All play state lives as module-level `let` globals
**Severity:** Medium
**Lines:** 1548–1558
`playHand`, `playBattlefield`, `playGraveyard`, `playExile`, `playTurn`, `playLife`, `ctxTarget`, `selectedBFId`, `selectedHandIdx`, and `manaPool` are all declared as bare `let` globals. Any function in the file can read or mutate them directly, making state transitions implicit and hard to audit.
**Action:** Group them into a single state object (`const playState = { hand: [], battlefield: [], ... }`) or at minimum document which functions are the authorised writers for each variable.

### `getLandMana()` placed in play-state section but concerns deck logic
**Severity:** Low
**Lines:** 1563–1578
`getLandMana()` interprets Scryfall card data and returns a mana production map. It does not itself touch any play-state variables — it is a pure data-transformation utility. Placing it inside the play-state section implies it is play-mode-only, but the logic is generically useful.
**Action:** Move `getLandMana()` to the Utilities section (lines 2141–2156) alongside `escapeHtml`, `formatManaCostShort`, etc., or add a comment that it belongs to the mana subsystem.

### `manaPool` state is reset implicitly by `clearManaPool()` but not on game reset
**Severity:** Low
**Lines:** 1637–1640
`clearManaPool()` exists to zero the pool, but there is no evidence it is called from the game-reset flow (`startGame` at line 1664). If a new game starts without clearing leftover mana from the previous session, the pool state will be stale.
**Action:** Ensure `clearManaPool()` (or equivalent inline reset) is called in `startGame()`.

## Summary
The most significant architectural concern is the tight coupling between `renderManaPool` and `renderPlayHand`. The broad use of module-level mutable globals also makes state flow opaque. Grouping state into a single object and inverting the render-trigger dependency would significantly improve maintainability.
