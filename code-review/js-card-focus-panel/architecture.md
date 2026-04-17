# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard()` conflates selection logic with tap-toggle logic
**Severity:** Medium
**Lines:** 1931
`selectBFCard()` doubles as a tap-toggle: if the already-selected card is clicked, it calls `tapCard(id)` and returns. This mixes two distinct interactions — selection and tapping — inside a function whose name implies only selection. The result is a surprising behaviour (calling `select` triggers a mutation) that is not reflected in the function signature or name.
**Action:** Extract the tap-toggle responsibility into the call site (the `onclick` handler in `bfCardHTML`) or rename the function to `handleBFCardClick()` to accurately reflect its dual role.

### `selectBFCard()` calls `renderBattlefield()` but `selectHandCard()` calls no render
**Severity:** Medium
**Lines:** 1955, 1965–1994
These two sibling functions have different post-selection render behaviour: `selectBFCard` triggers `renderBattlefield()` to show the selection highlight, while `selectHandCard` triggers nothing. This asymmetry means the hand does not visually update on selection and creates an inconsistent pattern between the two selection flows.
**Action:** If `renderPlayHand()` supports a selected-card highlight, call it at the end of `selectHandCard()`. Otherwise document that hand card selection is highlight-free by design.

### Focus panel DOM population duplicated across `selectBFCard()` and `selectHandCard()`
**Severity:** Medium
**Lines:** 1935–1942, 1972–1981
Both functions populate the same six focus-panel elements (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`, `focus-actions`) with near-identical logic for image, name, mana cost, type line, and oracle text. The only meaningful difference is the action buttons block.
**Action:** Extract the shared panel-population logic into a helper function `populateFocusPanel(card)` that fills the display fields, and call it from both `selectBFCard` and `selectHandCard`, keeping only the action-button generation separate.

### `closeFocusPanel()` calls `renderBattlefield()` but not `renderPlayHand()`
**Severity:** Low
**Lines:** 1958–1963
Closing the panel deselects both BF and hand selections (`selectedBFId = null`, `selectedHandIdx = null`) but only re-renders the battlefield. If the hand uses `selectedHandIdx` for visual highlighting, closing the panel leaves the hand highlight stale.
**Action:** Call `renderPlayHand()` in `closeFocusPanel()` if hand highlighting is implemented, or document the intentional asymmetry.

### Focus-panel state is spread across two globals and DOM element visibility
**Severity:** Low
**Lines:** 1933, 1954, 1959–1961
The panel's "open" state is managed via a CSS class on the DOM element, while selection state lives in `selectedBFId` and `selectedHandIdx`. These three pieces must stay in sync manually. There is no single "close panel" source of truth that resets all three atomically.
**Action:** Consolidate into a helper that handles both the CSS class and the globals together — `closeFocusPanel()` already does this, but `selectBFCard()` opens the panel by directly adding the class rather than calling an `openFocusPanel()` helper.

## Summary
The biggest architectural issues are the duplicated DOM population logic across the two `select*` functions and the asymmetric render calls between `selectBFCard` and `selectHandCard`. Extracting a shared `populateFocusPanel(card)` helper would eliminate significant duplication, and aligning the post-selection render calls would improve consistency.
