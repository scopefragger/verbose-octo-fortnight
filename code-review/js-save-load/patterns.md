# Patterns Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent error handling — some catch blocks swallow the error silently
**Severity:** Low
**Lines:** 1494, 1514, 1526
`loadSavedDecks`, `loadDeckFromSaved`, and `deleteSavedDeck` all have bare `catch` blocks with no parameter, discarding the error entirely. `saveDeck` at line 1471 does log `err.message`. Consistent error handling (at minimum a `console.error`) would aid debugging.
**Action:** Use `catch (err) { console.error(...); showToast(...); }` uniformly across all four functions.

### Magic string `'Load a deck first'` vs existing deck-state guard pattern
**Severity:** Low
**Lines:** 1460
The guard `if (!deck.length)` checks the raw `deck` array but there is a separate `deckLoaded` boolean defined at line 1036. Mixing the two state checks for "is a deck loaded" creates inconsistency.
**Action:** Prefer `deckLoaded` as the canonical check, or document that `deck.length > 0` is the single source of truth and remove `deckLoaded`.

### `loadSavedDecks` uses a loading spinner injected via innerHTML
**Severity:** Low
**Lines:** 1478
Injecting a spinner via `el.innerHTML = '<div class="empty-saved">...'` is consistent with the rest of the file's pattern. No issue with the approach itself, but the spinner element `<span class="loading-spinner"></span>` is only used here — it would benefit from a comment noting this CSS class must remain defined.
**Action:** Add a CSS comment near `.loading-spinner` indicating it is used in `loadSavedDecks`.

## Summary
The section is broadly consistent with the rest of the file. The main pattern gap is inconsistent catch-block handling — some functions log errors, others silently discard them. Mixed use of `deck.length` vs `deckLoaded` for the "deck is ready" guard is a minor inconsistency worth resolving.
