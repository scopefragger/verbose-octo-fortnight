# Static Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### saveDeck always POSTs — no update path for existing deck
**Severity:** Medium
**Lines:** 1464–1468
`saveDeck()` always sends `POST /api/mtg/decks`, even when a deck was loaded from saved state. If the user loads a deck, edits it, then clicks Save, a second copy is created rather than the existing record being updated. There is a `PUT /api/mtg/decks/:id` endpoint (noted in SEGMENTS.MD supporting files) but it is never called from the UI. This leads to unbounded deck duplication.
**Action:** Track the loaded deck's ID in a variable (e.g. `currentDeckId`). When set, issue a `PUT` instead of `POST`.

### `tokens: []` hardcoded in save payload
**Severity:** Low
**Lines:** 1466
`saveDeck()` always sends `tokens: []` regardless of any tokens configured in state. If token data is ever populated on the client, it will be silently discarded on every save.
**Action:** Pass the actual token state (e.g. `currentTokens` or similar) rather than an empty array literal.

### Empty `catch` swallows errors silently in `loadSavedDecks` and `deleteSavedDeck`
**Severity:** Low
**Lines:** 1494, 1526
Several `catch` blocks have no bound error variable, so the original error message is lost. The `loadSavedDecks` catch replaces the list with a static string, and `deleteSavedDeck` shows a generic toast. Debugging failures in production is significantly harder.
**Action:** At minimum log the error to the console: `catch (err) { console.error(err); ... }`.

### `res.ok` check in `loadDeckFromSaved` and `deleteSavedDeck` throws an Error with no message
**Severity:** Low
**Lines:** 1503, 1522
`throw new Error()` with no argument produces an empty error message. The toast will display "Failed to load deck" without any diagnostic info.
**Action:** Include a descriptive message: `throw new Error('Server returned ' + res.status)`.

## Summary
The Save/Load section has a significant functional bug where saving a previously-loaded deck always creates a new record instead of updating the existing one. Error handling is present but swallows error details in several catch blocks. The `tokens: []` hardcoding will silently discard token data when/if that feature is wired up.
