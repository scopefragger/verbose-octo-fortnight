# Static Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard` calls `renderBattlefield()` but not `renderPlayHand()`
**Severity:** Low
**Lines:** 1955
`selectBFCard` updates `selectedBFId` and calls `renderBattlefield()` to re-render selection highlighting. However, if hand state also needs updating (e.g. affordability indicators after mana changes), `renderPlayHand()` is not called here. This is acceptable if the focus panel only affects battlefield selection, but should be documented.
**Action:** Add a comment confirming that `renderPlayHand()` is intentionally omitted here because selecting a battlefield card does not change hand affordability.

### `closeFocusPanel` resets both `selectedBFId` and `selectedHandIdx`
**Severity:** Low
**Lines:** 1958–1963
`closeFocusPanel` resets both selection state variables, which is correct. However, it only calls `renderBattlefield()` and not `renderPlayHand()`. If the hand strip shows a selected state for `selectedHandIdx`, closing the panel won't update the hand strip visually.
**Action:** Check whether `renderPlayHand()` also needs to be called in `closeFocusPanel`. If hand cards don't show a selected-highlight state, this is fine — add a comment confirming.

### `playHandCardFromFocus` called with `idx` as a bare number in onclick
**Severity:** Low
**Lines:** 1988
`onclick="playHandCardFromFocus(${idx})"` uses bare numeric interpolation, which is safe for array indices (always integers). Unlike `bfc.id` (which uses `JSON.stringify`), this is direct number interpolation without quoting. As long as `idx` is always an integer this is safe.
**Action:** For consistency with the `JSON.stringify(id)` pattern used for `bfc.id`, consider wrapping `idx` in `JSON.stringify(idx)` to make the intent explicit and guard against future edge cases.

### `discardFromHand(${idx})` — same bare number pattern
**Severity:** Low
**Lines:** 1989
Same as above. Array indices are safe as bare numbers but inconsistent with the `JSON.stringify` pattern.
**Action:** Same as above.

## Summary
No critical bugs in the focus panel logic. The main static concerns are minor: `renderPlayHand` is not called in `closeFocusPanel` (may leave visual inconsistency), and the onclick parameter injection style is inconsistent between battlefield card IDs and hand card indices.
