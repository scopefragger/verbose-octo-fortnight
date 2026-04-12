# Static Code Review — Save / Load

Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Silent error swallowing in `loadSavedDecks`, `loadDeckFromSaved`, and `deleteSavedDeck`
**Severity:** Medium
**Lines:** 1494, 1514, 1526
Three `catch` blocks catch all exceptions but discard the error object entirely (bare `catch {}`). This means any error — including programming mistakes, unexpected data shapes, or network issues — is silently swallowed. Distinguishing a "network offline" condition from a bug becomes impossible without the original error object.
**Action:** Change all three to `catch (err)` and at minimum log `err` to the console (or the project's `logError` utility if accessible from the client) so errors are diagnosable in development.

### `loadSavedDecks` swallows non-ok HTTP status without details
**Severity:** Low
**Lines:** 1481
`if (!res.ok) throw new Error()` throws an anonymous error with no message, losing the HTTP status code and any server-provided error body. The catch block then shows a generic string to the user.
**Action:** Match the pattern in `saveDeck` (line 1468): `throw new Error(await res.text())` or at least `throw new Error(res.status)`.

### `loadDeckFromSaved` does not validate the shape of `saved`
**Severity:** Medium
**Lines:** 1504–1511
After deserialising the API response, the code accesses `saved.name`, `saved.commander`, `saved.partner`, and `saved.cards` without any guard. If the server returns unexpected JSON (e.g., an error envelope), `saved.cards.map(...)` will throw a `TypeError` that is caught silently (see finding above), leaving the UI in a toast-only failure state with no way to diagnose the cause.
**Action:** Add a null guard: `if (!saved || !Array.isArray(saved.cards)) throw new Error('Unexpected response shape');`.

### `saveDeck` always passes `tokens: []`
**Severity:** Low
**Lines:** 1466
The deck payload hardcodes `tokens: []`. If the current state holds any tokens (there is a `tokens` array in the play-state section), they are silently dropped on every save.
**Action:** Determine whether the `tokens` state variable should be included here. If yes, pass it; if tokens are intentionally not persisted at this point, add a comment explaining the decision.

### `deck` module-level variable assumed to be in scope
**Severity:** Low
**Lines:** 1460, 1462
`deck` is referenced without being declared or imported in this section. This is fine given the single-file context, but if this section were ever extracted there would be no indication of the dependency.
**Action:** No immediate action required for a single-file app, but add a brief comment noting that `deck` is the module-level deck state array.

## Summary
The section is functionally clear and consistent in structure, but all three `catch` blocks silently discard error objects, making debugging difficult. The API response from `loadDeckFromSaved` lacks shape validation, and non-ok status paths in two functions lose error detail. These are low-effort, medium-impact fixes.
