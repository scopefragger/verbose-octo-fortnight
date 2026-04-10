# Static Code Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectHandCard` uses raw array index in onclick — stale index risk
**Severity:** Medium
**Lines:** 1988–1989
The hand card index `idx` is embedded directly into `onclick="playHandCardFromFocus(${idx})"` and `onclick="discardFromHand(${idx})..."`. If `playHand` is mutated (e.g., a card is played) while this panel is visible, the index may point to a different card or be out of bounds. There is no re-validation at the time of the onclick.
**Action:** Use a stable card identifier rather than an array index, or re-validate `playHand[idx]` at the top of `playHandCardFromFocus` and `discardFromHand` before acting on it.

### `selectBFCard` calls `renderBattlefield()` after updating panel
**Severity:** Low
**Lines:** 1955
`selectBFCard` ends with `renderBattlefield()` to refresh the selection highlight. `closeFocusPanel` also calls `renderBattlefield()` at line 1962. If a user rapidly opens and closes the panel, this triggers multiple re-renders. This is unlikely to be a performance issue but is an implicit contract.
**Action:** Document this in a comment, or consolidate into a single render call pattern.

### `focus-img` src set to empty string when no image
**Severity:** Low
**Lines:** 1937–1938, 1976–1977
When `img` is empty, `focus-img.src` is set to `''` and then hidden via `style.display = 'none'`. Setting `src=""` triggers an additional HTTP request to the current page URL in some browsers. Setting `style.display = 'none'` hides it, but the request is still made.
**Action:** Check if `img` is truthy before setting `src`, only setting it when an image is available.

## Summary
The main concern is the stale index risk for hand cards. The panel is generally well-structured, but using indices instead of stable IDs is fragile when the underlying array can change between render and interaction.
