# Static Code Review — Play Core
Lines: 1664–1841 | File: public/mtg-commander.html

## Findings

### `playCardToBattlefield` silently allows zero-mana cards with no mana_cost to bypass affordability check
**Severity:** Low
**Lines:** 1708–1714
The condition `if (!isLand && card.mana_cost)` skips the entire affordability/spend block when `card.mana_cost` is falsy (null/undefined/empty string). This is intentional for free spells, but combined with the inner condition `if (!canAfford(card.mana_cost) && cost.X === 0)` it means X-cost spells with no other cost (e.g. `{X}`) are also freely playable — `cost.X > 0` causes the toast guard to be skipped, but `spendMana` is still called on a zero-cost string. Low risk in practice but the logic is confusing.
**Action:** Add a comment clarifying the intent (free spells and X-only spells are intentionally playable regardless of mana pool). Consider separating the "has mana cost" guard from the "can afford" guard for readability.

### `changeLife` does not call `renderPlayArea` or update any counter except `life-counter`
**Severity:** Low
**Lines:** 1684–1687
`changeLife(delta)` mutates `playLife` and directly sets the `life-counter` DOM element. This is an inconsistent pattern — all other state mutations go through `renderPlayArea()`. If the life counter element ID ever changes or does not exist at call time, a silent failure (or uncaught TypeError) occurs.
**Action:** Either route through `renderPlayArea()` (it already sets `life-counter.textContent = playLife`) and remove the direct DOM write, or add a null guard: `const el = document.getElementById('life-counter'); if (el) el.textContent = playLife;`

### `discardFromHand` bounds check is incomplete in practice
**Severity:** Low
**Lines:** 1829
The guard `if (idx < 0 || idx >= playHand.length)` is correct, but `playHand.splice(idx, 1)` can still return an empty array if `idx` equals `playHand.length` (already guarded). The destructuring `const [card] = playHand.splice(...)` would assign `card = undefined` if splice returns `[]` for any reason — then `playGraveyard.push(undefined)` would silently corrupt graveyard state.
**Action:** After splice, guard: `if (!card) return;` before pushing to graveyard.

### `showManaChoicePicker` mutates `selectedBFId` as a side effect without going through `selectBFCard`
**Severity:** Low
**Lines:** 1779–1795
The function conditionally sets `selectedBFId = id` and manually writes to multiple `focus-*` DOM elements directly. This duplicates logic from `selectBFCard()` (defined in Section 18) and could diverge over time if `selectBFCard` gains new responsibilities (e.g. stats tracking).
**Action:** Call `selectBFCard(id)` first (it already sets `selectedBFId` and populates focus panel fields) and then overwrite just `focus-actions` and `focus-name` as needed. Add a comment explaining the override pattern.

### No guard on `playHand[idx]` in `playCardToBattlefield`
**Severity:** Low
**Lines:** 1705–1719
`playCardToBattlefield(idx)` reads `playHand[idx]` directly without checking if `idx` is within bounds. If called with a stale index (e.g. after multiple rapid UI taps), `card` would be `undefined`, causing `getCardType(undefined)` to return `'Other'` and `card.mana_cost` to throw a TypeError.
**Action:** Add a bounds guard at the top: `if (idx < 0 || idx >= playHand.length) return;`

## Summary
The Play Core section is generally readable and correctly scoped. The main static risks are missing null/bounds guards in `playCardToBattlefield` and `discardFromHand`, a direct DOM mutation pattern in `changeLife` that bypasses the standard render path, and subtle side-effect duplication in `showManaChoicePicker`. None are crash-level bugs under normal usage but could cause silent state corruption or hard-to-debug failures.
