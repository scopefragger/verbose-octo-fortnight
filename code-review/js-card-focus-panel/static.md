# Static Code Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectHandCard` does not re-render the hand after selecting
**Severity:** Low
**Lines:** 1965–1993
`selectBFCard` calls `renderBattlefield()` at the end (line 1955) to show the selection highlight. `selectHandCard` does not call `renderPlayHand()`, so the hand cards do not show a selection highlight even if one is expected by the CSS.
**Action:** If hand selection highlighting is desired, add `renderPlayHand()` at the end of `selectHandCard`. If no highlight is intended for hand cards, document this intentional asymmetry.

### `closeFocusPanel` resets both `selectedBFId` and `selectedHandIdx` — always rerenders battlefield
**Severity:** Low
**Lines:** 1958–1963
`closeFocusPanel` calls `renderBattlefield()` unconditionally even when the panel was opened for a hand card (where the battlefield selection was already null). This is a minor unnecessary repaint.
**Action:** Conditionally call `renderBattlefield()` only when `selectedBFId` was non-null before closing.

### `selectHandCard` accepts a numeric index that could be stale
**Severity:** Medium
**Lines:** 1965–1966
The `idx` parameter passed to `selectHandCard` is a positional index into `playHand`. If the hand array is mutated between when the button is rendered and when it is clicked (e.g., another action draws or discards a card), `playHand[idx]` may refer to the wrong card or be undefined. The `if (!card) return` guard prevents a crash but silently fails.
**Action:** Consider using a unique card ID rather than an array index, or refresh the hand display immediately on any mutation that changes hand order.

### `playHandCardFromFocus` is called with raw index, same stale-index risk
**Severity:** Medium
**Lines:** 1988
`onclick="playHandCardFromFocus(${idx})"` — the same stale-index issue applies. If `playHand` is reordered between render and click, the wrong card may be played.
**Action:** Same as above — prefer a card ID over a positional index.

## Summary
The focus panel functions are well-structured but share a common vulnerability: using positional array indices to reference hand cards, which can become stale if the hand changes between render and interaction. The missing hand re-render after `selectHandCard` is a minor inconsistency with `selectBFCard`'s behaviour.
