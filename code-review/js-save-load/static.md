# Static Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `apiFetch` referenced but not declared in this section
**Severity:** Low
**Lines:** 1464, 1480, 1502, 1522
`apiFetch` is called throughout but defined elsewhere in the file. As long as it remains globally scoped this works, but it creates an implicit dependency. If the function is moved or renamed, all four calls here will silently break at runtime rather than at parse time.
**Action:** No immediate fix needed, but document the dependency or import it explicitly if the file is ever modularised.

### Empty `catch` blocks discard error detail
**Severity:** Medium
**Lines:** 1494, 1514, 1526
Three `catch` blocks catch an exception and immediately discard it (`catch { ... }`). This makes silent failures impossible to diagnose — the real error (network timeout, JSON parse failure, 4xx/5xx body) is never surfaced to the console or any monitoring system.
**Action:** At minimum, add `console.error(err)` (or a call to the app's `logError` helper) inside each bare catch block so failures are traceable.

### `throw new Error()` in error path loses HTTP response body
**Severity:** Low
**Lines:** 1481, 1503, 1523
When `res.ok` is false, a generic `new Error()` is thrown with no message. Unlike `saveDeck()` (line 1468, which correctly reads `await res.text()`), the other three callers lose the server-provided error reason before throwing.
**Action:** Replace bare `throw new Error()` with `throw new Error(await res.text())` (or equivalent) so the server error message reaches the catch handler and can be shown to the user.

### `loadDeckFromSaved` calls `importDecklist()` without guarding for its existence
**Severity:** Low
**Lines:** 1513
`importDecklist()` is called without a null/existence check. If it is ever conditionally defined or renamed, this will throw a ReferenceError at runtime.
**Action:** Add a guard: `if (typeof importDecklist === 'function') await importDecklist();` or ensure a definitive module-level declaration exists.

### `tokens: []` hardcoded in `saveDeck`
**Severity:** Low
**Lines:** 1466
The save payload always sends `tokens: []`, ignoring any tokens the user may have configured for this deck. The database schema explicitly has a `tokens` column (JSONB).
**Action:** Collect the current token state from `state` (or wherever tokens are stored) and include it in the payload, or document clearly that token saving is not yet implemented.

## Summary
The save/load section is mostly clean and follows consistent async patterns. The biggest practical issues are the bare `catch` blocks that suppress diagnostic information and the incomplete token save. The inconsistent error-handling (one function reads `res.text()`, three others do not) should be unified.
