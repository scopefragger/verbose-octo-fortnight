# Static Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### All `getElementById` calls lack null guards
**Severity:** Medium
**Lines:** 1937–1954, 1961, 1976–1993
Both `selectBFCard()` and `selectHandCard()` perform numerous `getElementById` calls (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`, `focus-actions`, `card-focus-panel`) without checking for null. If any element is missing (HTML refactor, future conditional rendering), the first access on null will throw a `TypeError` and leave the panel in a partially-updated state.
**Action:** Add an early guard checking the primary container: `const panel = document.getElementById('card-focus-panel'); if (!panel) return;`. Cache other element references in local variables checked before use.

### `closeFocusPanel()` resets `selectedHandIdx` but `selectBFCard()` never sets it
**Severity:** Low
**Lines:** 1959–1960, 1931–1933
`closeFocusPanel()` resets both `selectedBFId` and `selectedHandIdx`. But `selectBFCard()` only mutates `selectedBFId`, never clearing `selectedHandIdx`. If a hand card is selected (setting `selectedHandIdx`) and then a battlefield card is clicked, `selectedHandIdx` retains its previous value while the focus panel now shows the BF card. Closing the panel then resets both — which is correct — but during the mixed-selection window, `selectedHandIdx` is stale.
**Action:** Add `selectedHandIdx = null;` at the start of `selectBFCard()` (alongside the `selectedBFId = id` assignment), mirroring what `selectHandCard()` does for `selectedBFId`.

### `selectHandCard()` does not call `renderBattlefield()` or `renderPlayHand()`
**Severity:** Low
**Lines:** 1965–1994
`selectBFCard()` calls `renderBattlefield()` at line 1955 to visually highlight the selected card. `selectHandCard()` does not call any render function to update the hand highlight state. If the hand cards display a visual selection indicator (via `selectedHandIdx`), they will not reflect the selection until the next full render.
**Action:** Verify whether `renderPlayHand()` uses `selectedHandIdx` to apply a visual class. If so, add `renderPlayHand()` at the end of `selectHandCard()`.

### `playHandCardFromFocus(${idx})` passes a bare integer index into an `onclick`
**Severity:** Low
**Lines:** 1988
Unlike the battlefield card ID (which uses `JSON.stringify`), the hand card index `idx` is passed as a raw number interpolation: `onclick="playHandCardFromFocus(${idx})"`. While a bare integer is safe, the asymmetry with the `idStr` approach used for `bfc.id` elsewhere is inconsistent. If `idx` ever comes from an external source it would be unsafe.
**Action:** Use `JSON.stringify(idx)` for consistency, or document that hand indices are always safe integers from `Array.map`.

### `focus-img` `src` is set before `display` — redundant flicker risk
**Severity:** Low
**Lines:** 1937–1938, 1976–1977
The `src` attribute is set one line before `style.display` is conditionally set. If `img` is falsy the element is already hidden, but if `img` is truthy the browser may begin fetching the image and then the display is reset to `''` — the sequence is fine functionally but could be reordered (`display` first, then `src`) to avoid a theoretical layout shift on slow networks.
**Action:** Swap the order: set `display` first, then set `src`.

## Summary
The panel functions are well-structured but lack null guards on all DOM element lookups. The stale `selectedHandIdx` when switching from hand to battlefield selection is a subtle state-consistency bug. The `displayconst`/`src` ordering and inconsistent use of `JSON.stringify` for inline onclick indices are minor polish issues.
