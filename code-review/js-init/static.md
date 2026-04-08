# Static Review — Init
Lines: 1050–1055 | File: public/mtg-commander.html

## Findings

### `loadSavedDecks` called before auth check
**Severity:** Low
**Lines:** 1052
`loadSavedDecks()` is called unconditionally on DOM load, including when `secret` is empty. If the API returns 401, the call will fail silently with no user feedback. `loadSavedDecks` is defined in section 12 (js-save-load).
**Action:** Check for a non-empty `secret` before calling `loadSavedDecks()`, or ensure `loadSavedDecks()` surfaces errors to the user when auth fails.

## Summary
The init block is minimal and correct. The single finding is that `loadSavedDecks` fires without a prior auth guard — a consequence of the broader unauthenticated-secret issue identified in js-url-secret.
