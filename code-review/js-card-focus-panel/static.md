# Static Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectHandCard` does not guard against out-of-range index
**Severity:** Low
**Lines:** 1965–1966
`selectHandCard(idx)` reads `playHand[idx]` and returns early if `!card`. This guards against `undefined`, but the function is called from `onclick="selectHandCard(${i})"` where `i` is a loop index frozen at render time. If the hand changes between render and click (e.g., another card is drawn), the index could point to a different card. The early-return handles the out-of-range case but silently succeeds for the wrong-card case.
**Action:** Consider using a stable card ID rather than a positional index for hand card selection.

### `closeFocusPanel` resets both `selectedBFId` and `selectedHandIdx`
**Severity:** Low
**Lines:** 1958–1963
`closeFocusPanel()` clears both `selectedBFId` and `selectedHandIdx` regardless of which was active. This is correct behavior but could lead to unexpected state if `selectBFCard` and `selectHandCard` don't clean up the opposite selection on entry. Checking the code: `selectBFCard` does not reset `selectedHandIdx` on entry, and `selectHandCard` does reset `selectedBFId` to `null` (line 1970), making the teardown asymmetric.
**Action:** In `selectBFCard`, also reset `selectedHandIdx = null` for symmetry with `selectHandCard`.

### `selectBFCard` calls `renderBattlefield()` at end, `closeFocusPanel` also calls it
**Severity:** Low
**Lines:** 1955, 1962
Both `selectBFCard` (line 1955) and `closeFocusPanel` (line 1962) call `renderBattlefield()`. When a hand card is selected and then deselected via `closeFocusPanel`, the battlefield re-renders unnecessarily. This is harmless but adds latency.
**Action:** No critical action required; document as a known minor inefficiency.

## Summary
The card focus panel section is mostly well-written. The main issues are: positional index used for hand card selection (stale index risk), asymmetric cleanup of `selectedHandIdx` vs `selectedBFId`, and unnecessary battlefield re-renders when closing from hand-card context.
