# Static Code Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### No update (PUT) path — saveDeck always POSTs
**Severity:** Medium
**Lines:** 1464–1467
`saveDeck()` always sends a POST request, creating a new deck record every time. If the user loads a saved deck and then saves again (e.g., after editing), a duplicate is created rather than updating the existing record. There is a PUT endpoint available (`PUT /api/mtg/decks/:id`) but it is never called. A `currentDeckId` tracking variable is absent.
**Action:** Track the currently-loaded deck ID in a variable. In `saveDeck()`, if a current ID exists use `PUT /api/mtg/decks/:id`; otherwise POST and store the returned ID.

### `tokens: []` hardcoded in save payload
**Severity:** Low
**Lines:** 1466
The save payload always sends `tokens: []`, discarding any token state that may have been set up by the user during the session.
**Action:** Collect the actual token state from app state and include it in the payload, or document clearly that tokens are intentionally not persisted.

### Silent error swallowed in loadSavedDecks and loadDeckFromSaved
**Severity:** Low
**Lines:** 1481, 1503
`catch` blocks discard the error object entirely (`catch {` with no binding), making debugging impossible. The user sees a generic failure message with no detail.
**Action:** Bind the error (`catch (err)`) and at minimum log it to the console for debugging.

### `saveDeck()` error message exposes raw API response
**Severity:** Low
**Lines:** 1472
`err.message` is set from `await res.text()` which may contain internal server error details. These are shown directly to the user via `showToast`.
**Action:** Show a user-friendly message; log the raw error to the console rather than surfacing it directly.

## Summary
The save/load section is functionally coherent but missing an update path — saves always create new records. Error handling is inconsistently thorough: `saveDeck` captures the error message, while the other three functions silently discard it.
