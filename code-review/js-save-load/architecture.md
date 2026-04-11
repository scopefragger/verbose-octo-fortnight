# Architecture Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Render logic embedded inside data-fetch function
**Severity:** Medium
**Lines:** 1484–1493
`loadSavedDecks()` fetches data from the API **and** directly renders HTML into `#saved-decks-list`. This merges two responsibilities: data retrieval and view rendering. It also makes the render output untestable independently of the network.
**Action:** Extract the render portion into a `renderSavedDecks(decks)` helper. `loadSavedDecks` should call it with the fetched data, keeping fetch and render cleanly separated.

### `saveDeck` always sends `tokens: []` — existing tokens discarded
**Severity:** Medium
**Lines:** 1466
`saveDeck` hardcodes `tokens: []` regardless of any tokens the user may have configured during the session. The schema (`db/migrations/023_mtg_decklists.sql`) includes a `tokens JSONB` column, and the service layer supports saving them.
**Action:** Include the current `tokens` state in the payload (collect from the relevant play-state variable) so that a round-trip save/load preserves the full deck state.

### `loadDeckFromSaved` imperatively populates form fields then calls `importDecklist`
**Severity:** Low
**Lines:** 1506–1513
This function writes directly to three DOM inputs then calls `importDecklist()`, which presumably reads those inputs again. This creates an implicit contract between `loadDeckFromSaved` and `importDecklist` through shared DOM state rather than function parameters.
**Action:** Refactor `importDecklist` to optionally accept a deck object directly, avoiding the DOM round-trip and making data flow explicit.

### No update (PUT) path — every save creates a new deck
**Severity:** Medium
**Lines:** 1464–1466
`saveDeck` always issues a `POST`, so saving a deck with the same name creates a duplicate record rather than updating the existing one. The API and service layer support `PUT /api/mtg/decks/:id`, but the UI never calls it.
**Action:** When a deck is loaded from saved state, store its `id`. In `saveDeck`, if an `id` is present, issue a `PUT` to `/api/mtg/decks/:id` instead of a `POST`.

## Summary
The section works for basic save/load but has notable architectural gaps: missing update semantics, token data is silently dropped on save, and render logic is tangled with fetch logic. Separating concerns and threading the loaded deck `id` through state would significantly improve correctness and maintainability.
