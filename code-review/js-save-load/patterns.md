# Code & Pattern Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent error handling pattern across the four functions
**Severity:** Low
**Lines:** 1471–1473 vs 1494–1496 vs 1514–1516 vs 1526–1528
`saveDeck` uses `catch (err)` and includes `err.message` in the toast. The other three functions use bare `catch {}` and show only a static message. The inconsistency makes the code harder to reason about and debug.
**Action:** Standardise: all catch blocks should bind the error and `console.error` it, with a user-friendly toast message. Only expose `err.message` to users where appropriate.

### Magic string: `'Enter a deck name first'` and similar toast messages
**Severity:** Low
**Lines:** 1459, 1460, 1469, 1472, 1500, 1515, 1524, 1527
Toast messages are magic strings scattered inline. There is no central message constants object.
**Action:** Acceptable for a single-file app of this scale; low priority. Could be improved with a `MESSAGES` constant object if the file grows further.

### Inline event handlers (`onclick`) instead of event delegation
**Severity:** Low
**Lines:** 1489–1490
The rendered deck list uses `onclick="..."` inline handlers, which is consistent with the rest of the file but makes it impossible to unit test handlers independently. Event delegation on the container would be cleaner and avoids the attribute-injection risk entirely.
**Action:** Future refactor: replace `onclick` attributes with a delegated listener on `saved-decks-list` that reads `data-id` and `data-action` attributes.

### `loadSavedDecks` called after both save and delete — no debounce
**Severity:** Low
**Lines:** 1470, 1525
After successful save or delete, `loadSavedDecks()` is called immediately, which issues another GET request. Under normal usage this is fine, but if multiple rapid saves occur the list refreshes redundantly.
**Action:** Acceptable at current scale. Note as a future improvement if list reload becomes a performance concern.

## Summary
The section is internally consistent with the rest of the file's patterns. The main issue is inconsistent error handling across the four functions. No severe pattern violations; the inline `onclick` handlers are a known trade-off in this single-file architecture.
