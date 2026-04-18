# Patterns Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent `res.ok` error capture pattern
**Severity:** Medium
**Lines:** 1468 vs 1481, 1503, 1523
`saveDeck` uses `throw new Error(await res.text())` — the correct pattern to preserve server error details. The other three functions use bare `throw new Error()`. All four should follow the same pattern so that error toasts and console logs are equally informative.
**Action:** Standardise all `if (!res.ok)` branches to `throw new Error(await res.text())`.

### String concatenation instead of template literal for error message
**Severity:** Low
**Lines:** 1472
`'Save failed: ' + err.message` uses concatenation while the rest of the file favours template literals. Minor style inconsistency.
**Action:** Change to `` `Save failed: ${err.message}` ``.

### No feedback state during `loadDeckFromSaved` fetch
**Severity:** Low
**Lines:** 1500–1516
`showToast('Loading deck…')` is the only loading signal. Unlike `loadSavedDecks` which injects a spinner element into the DOM, this function gives no visual indication while awaiting the fetch + `importDecklist()` chain, which can be slow.
**Action:** Consider setting a loading state on the sidebar or disabling the Load button during the async operation.

### `loadSavedDecks` called fire-and-forget after mutations
**Severity:** Low
**Lines:** 1470, 1525
After save and delete, `loadSavedDecks()` is called without `await`. Any errors thrown inside it (beyond the internal try/catch) would become unhandled rejections.
**Action:** Either `await loadSavedDecks()` inside the outer try/catch, or ensure `loadSavedDecks` never throws (its current try/catch guarantees this, so this is low risk but worth noting).

## Summary
The main pattern issue is inconsistent error capture on `!res.ok` branches — three of four functions silently discard the server error body. Fixing this would make the save/load section uniformly robust and easier to debug in production.
