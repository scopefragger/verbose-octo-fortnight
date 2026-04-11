# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `showGraveViewer` serves double duty for graveyard and exile
**Severity:** Low
**Lines:** 2041–2053
A single function handles both the graveyard and exile zones, distinguished by the `zone` string argument. This is compact and reasonable for two similar views, but the conditional logic (line 2042–2043) will grow if the two zones diverge in functionality (e.g., exile having sub-zones or interactable cards).
**Action:** The current approach is acceptable. If graveyard and exile views need to diverge in future, consider splitting into `showGraveyardViewer()` and `showExileViewer()` with a shared `showZoneViewer(title, cards)` helper.

### Close logic lives in HTML, not JavaScript — asymmetric open/close pattern
**Severity:** Low
**Lines:** HTML 1002–1004
`showGraveViewer` opens the modal by manipulating the DOM in JavaScript, but closing it is handled by inline onclick attributes in the HTML. This is the opposite of the token modal pattern where both open and close are in JavaScript.
**Action:** Define a `closeGraveViewer()` function and reference it from the HTML onclick attributes for consistency.

### Image lookup pattern duplicated from `selectBFCard` and `renderPlayHand`
**Severity:** Low
**Lines:** 2046
`card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal` is repeated here for the third time in the play section (also at lines 1935 and 1972). This belongs in a utility function.
**Action:** Create `getCardImageNormal(card)` utility and use it consistently across all three locations.

## Summary
The Graveyard Viewer is well-scoped and compact. The main concerns are the asymmetric open/close pattern and the repeated image URL lookup that should be extracted to a shared utility.
