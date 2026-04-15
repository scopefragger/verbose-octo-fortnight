# Architecture Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `saveDeck()` always saves a new deck — no update path
**Severity:** Medium
**Lines:** 1464
`saveDeck()` always POSTs to `/api/mtg/decks` (create). There is no logic to detect whether the currently-loaded deck has an existing ID and PUT to update it instead. This means every Save creates a duplicate deck.
**Action:** Track the current saved deck ID in state (e.g. `currentDeckId`). If set, issue a PUT to `/api/mtg/decks/${currentDeckId}` instead of POST. Clear it on New Deck.

### `loadDeckFromSaved()` triggers `importDecklist()` implicitly
**Severity:** Medium
**Lines:** 1513
`loadDeckFromSaved` populates the `decklist-input` textarea then calls `importDecklist()`, which is defined in a separate section (js-import). This creates a hidden coupling — `loadDeckFromSaved` must know about the import pipeline's side effects and state. If `importDecklist` ever changes its expected input format, this breaks silently.
**Action:** Either expose a direct state-loading function (e.g. `loadDeckState(cards, commander)`) that bypasses the textarea, or document this coupling explicitly.

### `loadSavedDecks()` is called both on initial load and after mutations
**Severity:** Low
**Lines:** 1470, 1525
Calling `loadSavedDecks()` after save/delete re-fetches all decks from the server. This is simple but does not use the cache. For larger deck lists this is a network hit after every mutation.
**Action:** Acceptable for current scale. If the deck list grows, consider a local state array that is mutated in-place rather than re-fetching.

### `tokens: []` hardcoded in save payload
**Severity:** Low
**Lines:** 1466
`saveDeck()` always sends `tokens: []`, discarding any tokens the user has associated with the deck. The schema supports `tokens JSONB`, and there is a `COMMON_TOKENS` array defined in the file, but tokens are never persisted.
**Action:** Capture and persist the current token list in the save payload: `tokens: currentTokens` (or equivalent state reference).

## Summary
The most impactful architectural gap is the lack of an update path — every save creates a new deck. The implicit dependency on `importDecklist()` is a tight coupling that should be documented or refactored. Token data is silently dropped on save despite the schema supporting it.
