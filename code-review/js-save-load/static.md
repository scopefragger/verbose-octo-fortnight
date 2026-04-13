# Static Code Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `loadSavedDecks` silently swallows all errors
**Severity:** Low
**Lines:** 1494–1496
The catch block is bare (`catch {`), which means any error (network, JSON parse, DOM issues) produces the same "Failed to load saved decks." message with no differentiation. This makes debugging harder.
**Action:** At minimum log the error to console: `catch (err) { console.error('loadSavedDecks:', err); ... }`.

### `loadDeckFromSaved` silently swallows all errors
**Severity:** Low
**Lines:** 1514–1516
Same pattern as above — bare `catch {}` with no logging. If `importDecklist()` throws, the toast says "Failed to load deck" but there's no trace of what actually failed.
**Action:** Add `console.error` in the catch block.

### `deleteSavedDeck` also uses a bare catch
**Severity:** Low
**Lines:** 1526–1528
Consistent with the pattern above but the same concern applies.
**Action:** Add `console.error` in the catch block.

### `tokens: []` hardcoded in `saveDeck`
**Severity:** Low
**Lines:** 1466
When saving a deck the tokens array is hardcoded to an empty array rather than using any in-memory token state. If the user has added custom tokens to the play area they are silently discarded.
**Action:** Decide whether tokens should be persisted; if so, collect them from the relevant play state variable before saving.

### `loadDeckFromSaved` response shape assumptions
**Severity:** Low
**Lines:** 1504–1510
The function expects `saved.cards` to be an array but does not guard against null/undefined. If the server returns a deck with a null `cards` field, `saved.cards.map(...)` will throw.
**Action:** Add `const cards = saved.cards || [];` before using it.

## Summary
The save/load functions follow a consistent pattern but universally suppress errors without logging, making production debugging impossible. A minor data-loss risk exists with hardcoded `tokens: []` and no guard on `saved.cards`.
