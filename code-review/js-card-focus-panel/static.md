# Static Code Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectHandCard` uses numeric array index as DOM onclick argument
**Severity:** Medium
**Lines:** 1988
`onclick="playHandCardFromFocus(${idx})"` and `onclick="discardFromHand(${idx});closeFocusPanel()"` use the raw hand array index. If the hand array is modified between when the panel is opened and when the user clicks a button, the index could point to the wrong card.
**Action:** Consider using a stable card identifier (e.g., a generated `id` field on each hand card object) rather than a positional index. At minimum, validate the index on click before acting.

### `selectBFCard` calls `tapCard(id)` on double-click but there is no true double-click detection
**Severity:** Low
**Lines:** 1930–1931
Re-clicking an already-selected card taps it. This simulates a double-click via sequential single-clicks, which may be confusing — the user may intend to deselect rather than tap.
**Action:** Consider adding a dedicated "tap" button to the focus panel (which already exists on line 1947) and changing re-click to deselect/close the panel instead.

### `closeFocusPanel` resets both `selectedBFId` and `selectedHandIdx`
**Severity:** Low
**Lines:** 1958–1963
Closing the focus panel clears both selection state variables. This is correct behavior but is not immediately obvious — if `closeFocusPanel` is called in a BF context, it also clears `selectedHandIdx` unnecessarily (it should already be `null`). The reverse is also true.
**Action:** This is acceptable; document that `closeFocusPanel` is a general reset. No code change needed.

### `focus-img` src set even when there is no image
**Severity:** Low
**Lines:** 1937
`document.getElementById('focus-img').src = img;` is called even when `img` is `''`. This causes the browser to issue a request for an empty URL or show a broken image. The `style.display` is then set to `'none'`, but the erroneous request has already been sent.
**Action:** Only set `src` when `img` is truthy: `if (img) { el.src = img; el.style.display = ''; } else { el.style.display = 'none'; }`

## Summary
The focus panel functions are mostly sound. The most actionable issue is the positional index used as a hand card identifier, which is fragile if the hand changes between panel open and button click. The empty src assignment also causes unnecessary browser requests.
