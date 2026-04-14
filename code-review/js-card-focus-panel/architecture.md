# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard` and `selectHandCard` are near-duplicates
**Severity:** Medium
**Lines:** 1926–1956, 1965–1993
Both functions perform the same sequence of operations: find the card, clear the other selection type, populate focus panel fields (img, name, mana, type, oracle), and render action buttons. The only differences are the action button set and a final `renderBattlefield()` call. This is ~30 lines of duplicated DOM-setting logic.
**Action:** Extract the common focus-panel population into a helper function `populateFocusPanel(card)` that takes a card object and sets all the display fields. `selectBFCard` and `selectHandCard` then call `populateFocusPanel` and each handle their own unique action buttons.

### Action buttons are generated as innerHTML strings inside focus functions
**Severity:** Low
**Lines:** 1946–1952, 1986–1991
The action button HTML is assembled inline within the select functions. This makes it hard to change button styling or add new actions without editing multiple places in the code.
**Action:** Consider a factory function `buildBFActions(id)` and `buildHandActions(idx)` that return the button HTML, separating action-set logic from card-selection logic.

### `closeFocusPanel` resets hand selection state even when showing a battlefield card
**Severity:** Low
**Lines:** 1959
`closeFocusPanel` always resets `selectedHandIdx = null`, even when the panel was opened via `selectBFCard` (at which point `selectedHandIdx` was already null). This is harmless but indicates the two selection states are entangled in the close logic.
**Action:** Minor cleanup: only reset the state variable that was active when the panel was opened.

## Summary
The biggest architectural issue is the significant duplication between `selectBFCard` and `selectHandCard`. Extracting a `populateFocusPanel(card)` helper would reduce the section by roughly 15 lines and make future changes (new card fields, new panel styling) require only one edit.
