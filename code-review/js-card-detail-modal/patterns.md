# Patterns Review — Card Detail Modal
Lines: 1434–1452 | File: public/mtg-commander.html

## Findings

### `showCardDetail` named inconsistently with other show* functions
**Severity:** Low
**Lines:** 1435
Other "show" functions in the file (`showCtxMenu`, `showTokenModal`, `showGraveViewer`) do not make network requests — they show existing state. `showCardDetail` is different because it fetches data first. This inconsistency in naming convention could mislead developers expecting it to be synchronous.
**Action:** Consider renaming to `openCardDetail(name)` or `loadAndShowCard(name)` to signal the async/fetch nature.

### `closeModal` name is generic but only handles `card-modal`
**Severity:** Low
**Lines:** 1448–1452
`closeModal` is named generically but only operates on `card-modal`. Other modal close functions (`closeTokenModal`, etc.) are named specifically. The generic name suggests a reusable utility but it is not.
**Action:** Rename to `closeCardModal` for consistency with `closeTokenModal` and other specific close functions.

### `card.oracle_text || card.card_faces?.[0]?.oracle_text` — DFC fallback pattern
**Severity:** Informational
**Lines:** 1444
The DFC fallback pattern (`card.oracle_text || card.card_faces?.[0]?.oracle_text`) is used here and in `renderHand`. This pattern should be consistently applied wherever oracle text or image URLs are accessed.
**Action:** Consider extracting `getOracleText(card)` and `getCardImageUrl(card)` helpers (similar to `getCardCMC`, `getCardColors`, `getCardType`).

## Summary
The modal JS is clean and minimal. Patterns findings: `showCardDetail` naming is misleading for an async function, `closeModal` is generically named but modal-specific, and DFC fallback patterns are repeated without a helper.
