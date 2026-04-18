# Static Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Duplicate `getElementById('focus-img')` calls
**Severity:** Low
**Lines:** 1937–1938, 1976–1977
The `focus-img` element is queried twice in both `selectBFCard` and `selectHandCard`. While this is harmless, it causes two DOM lookups for the same element per call.
**Action:** Cache: `const focusImg = document.getElementById('focus-img');` and use `focusImg.src` / `focusImg.style.display`.

### `selectedHandIdx` not cleared when a battlefield card is selected
**Severity:** Low
**Lines:** 1933
`selectBFCard` sets `selectedBFId = id` but does not clear `selectedHandIdx`. If a hand card was previously selected, `selectedHandIdx` remains set while `selectedBFId` also has a value, creating an inconsistent dual-selection state.
**Action:** Add `selectedHandIdx = null;` after line 1933 in `selectBFCard`.

### `selectHandCard` does not re-render the hand after selection
**Severity:** Low
**Lines:** 1965–1994
`selectBFCard` calls `renderBattlefield()` (line 1955) to update the selected-card highlight on the battlefield. `selectHandCard` has no equivalent call to update the hand display. If hand cards show a selection highlight, it would not update.
**Action:** Call `renderPlayHand()` at the end of `selectHandCard` if hand cards have a visual selected state.

## Summary
Functionally solid focus panel logic. The main static issue is the asymmetry between `selectBFCard` (clears hand selection, re-renders battlefield) and `selectHandCard` (does not clear BF selection explicitly, does not re-render hand).
