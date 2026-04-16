# Static Code Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Silent error swallowing in loadSavedDecks, loadDeckFromSaved, deleteSavedDeck
**Severity:** Medium
**Lines:** 1494, 1514, 1526
Empty `catch` blocks (bare `catch { ... }`) discard the error object entirely, making debugging impossible. The `loadSavedDecks` catch on line 1494 is the most problematic — a network error, JSON parse failure, or unexpected shape of `decks` all produce the same generic message with no log.
**Action:** Change `catch { ... }` to `catch (err) { console.error('...', err); ... }` in all three functions so failures are traceable in the browser console.

### `loadSavedDecks` does not guard against missing `decks` key
**Severity:** Medium
**Lines:** 1482–1483
`const { decks } = await res.json()` will destructure successfully even if the server returns a shape without a `decks` key, leaving `decks` as `undefined`. The subsequent `decks.length` check then throws a TypeError that is silently swallowed.
**Action:** Add a guard: `if (!decks || !Array.isArray(decks)) throw new Error('Unexpected response shape');`

### `loadDeckFromSaved` passes raw API data directly to DOM inputs without validation
**Severity:** Low
**Lines:** 1506–1511
`saved.name`, `saved.commander`, `saved.partner`, and `saved.cards` are assigned directly to form inputs. If any property is `null` or not a string (e.g. `saved.cards` is not an array), subsequent code (`saved.cards.map`) throws.
**Action:** Add null/type guards: `if (!Array.isArray(saved.cards)) throw new Error('Invalid deck data');` before using `saved.cards`.

### `saveDeck` always sends `tokens: []`
**Severity:** Low
**Lines:** 1466
Custom tokens defined on the deck (if any exist in state) are silently dropped on every save — the body hardcodes `tokens: []` rather than reading from the live token state variable.
**Action:** Reference the actual token state variable (e.g. `tokens: deckTokens` or whatever the state variable is) when building the request body.

## Summary
The section is small and readable but silently swallows errors throughout. Missing array/type guards on API responses create latent TypeErrors that are impossible to diagnose in production. Token state is dropped on every save, which is likely a logic bug.
