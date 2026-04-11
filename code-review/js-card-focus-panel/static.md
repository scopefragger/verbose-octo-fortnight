# Static Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `focus-img` element queried twice on consecutive lines
**Severity:** Low
**Lines:** 1937–1938, 1976–1977
`document.getElementById('focus-img')` is called twice in both `selectBFCard()` and `selectHandCard()` — once to set `src` and once to set `display`. This is a minor inefficiency.
**Action:** Store the element in a local variable: `const focusImg = document.getElementById('focus-img');` and reuse it.

### `selectedHandIdx` not cleared in `selectBFCard`
**Severity:** Medium
**Lines:** 1933
`selectBFCard()` sets `selectedBFId` but does not clear `selectedHandIdx`. If a hand card was previously selected, `selectedHandIdx` will still hold a stale value when a battlefield card is subsequently selected.
**Action:** Add `selectedHandIdx = null;` inside `selectBFCard()` alongside `selectedBFId = id;`.

### `idx` passed directly into onclick attribute without type guard
**Severity:** Low
**Lines:** 1988–1989
`idx` is a numeric array index passed directly into onclick attributes. While safe as a number, there is no guard ensuring `idx` is still valid if `playHand` mutates between render and click. This is a general pattern in the file, but worth flagging here.
**Action:** Accept the current pattern but note that functions like `playHandCardFromFocus(idx)` should guard against out-of-bounds access.

### `playHandCardFromFocus` is called without closing the panel
**Severity:** Low
**Lines:** 1988
Unlike other hand actions (e.g., `discardFromHand` on line 1989 calls `closeFocusPanel()`), `playHandCardFromFocus` does not explicitly close the focus panel in the button's onclick. The panel closure presumably happens inside `playHandCardFromFocus`.
**Action:** Verify `playHandCardFromFocus` always closes the panel, or add `closeFocusPanel()` explicitly for consistency with other buttons.

## Summary
The section is logically correct, but `selectedHandIdx` not being cleared in `selectBFCard` is a real bug risk. The repeated `getElementById` calls and the asymmetric `closeFocusPanel()` call are minor quality issues.
