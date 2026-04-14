# Architecture Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### loadDeckFromSaved triggers full re-import rather than hydrating state directly
**Severity:** Medium
**Lines:** 1510–1513
`loadDeckFromSaved` reconstructs the deck textarea text from saved card objects and then calls `importDecklist()`, which re-fetches all card data from Scryfall. This wastes API calls and resets any in-progress state. The backend already stores the full card JSONB; returning it directly would allow the client to hydrate the deck array without redundant fetches.
**Action:** Extend the GET `/api/mtg/decks/:id` response to include full card data if available, and hydrate `deck[]` directly.

### saveDeck mixes UI validation with API logic
**Severity:** Low
**Lines:** 1455–1473
Reading DOM values (`deck-name`, `commander-input`, `partner-input`) and validating them before making the API call is fine for a single-file app, but it means the save logic cannot be reused without a DOM context. Extracting the payload construction into a pure helper would ease future testing.
**Action:** Extract a `buildSavePayload()` helper that reads from state variables rather than the DOM directly.

### loadSavedDecks() called immediately after save — no debounce or response validation
**Severity:** Low
**Lines:** 1470
After a successful save, `loadSavedDecks()` is called immediately. If the server is slow or returns stale data, the list may not include the newly saved deck. There is no optimistic update.
**Action:** Consider adding the newly saved deck to the list optimistically rather than re-fetching, or add a short loading indicator.

## Summary
The save/load section is appropriately scoped to REST API calls. The main architectural concern is that loading a saved deck re-fetches all card data from Scryfall rather than reusing stored data, which is inefficient and could fail if Scryfall is unavailable.
