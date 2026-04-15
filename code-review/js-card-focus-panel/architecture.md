# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Duplicate focus panel population logic in `selectBFCard` and `selectHandCard`
**Severity:** Medium
**Lines:** 1935–1942, 1972–1981
Both `selectBFCard` and `selectHandCard` independently populate the same focus panel DOM elements (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`) with the same field access patterns. The only difference is the action buttons rendered into `focus-actions`. This is ~10 lines of duplicated DOM-mutation code.
**Action:** Extract a `populateFocusPanel(card)` helper that sets the common fields (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`), then have `selectBFCard` and `selectHandCard` each call it before rendering their own action buttons.

### Image URL fallback logic duplicated three times
**Severity:** Medium
**Lines:** 1935, 1972
The pattern `card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ''` appears here again (also in `renderPlayHand`, line 1913). This is now the third occurrence of this fallback logic across the file.
**Action:** Extract a `getCardImageUrl(card, size = 'normal')` utility function in the Utilities section and use it in all three locations.

### `selectBFCard` mixes selection state mutation, DOM population, and re-render
**Severity:** Low
**Lines:** 1926–1956
`selectBFCard` performs three distinct operations: (1) updates `selectedBFId` state, (2) populates the focus panel DOM, and (3) calls `renderBattlefield()`. These could be separated into a state mutation step and a render step, but for a single-file app this coupling is acceptable.
**Action:** No immediate change required. Add a comment describing the function's responsibilities for future reference.

## Summary
The key architectural concern is the duplicated focus panel population code between `selectBFCard` and `selectHandCard`. Extracting `populateFocusPanel(card)` and `getCardImageUrl(card, size)` helpers would eliminate ~20 lines of duplication and create a single maintenance point.
