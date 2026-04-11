# Static Code Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Empty catch blocks swallow error detail
**Severity:** Medium
**Lines:** 1494, 1514, 1526
Three `catch` blocks use anonymous catch (`catch { ... }`) with no reference to the error, losing diagnostic information. `loadSavedDecks`, `loadDeckFromSaved`, and `deleteSavedDeck` all silently discard the underlying exception, making bugs very hard to trace.
**Action:** Change to `catch (err) { console.error(..., err); ... }` so errors are at least logged to the console, matching the pattern already used in `saveDeck`.

### `res.ok` check throws generic Error with no message
**Severity:** Low
**Lines:** 1481, 1503, 1523
`throw new Error()` (no message) is thrown when `res.ok` is false, but the response body (which may contain a server-side reason) is never read. Only `saveDeck` (line 1468) reads the response text before throwing.
**Action:** Replace with `throw new Error(await res.text())` so the server's error message is surfaced in the toast or console.

### `apiFetch` function assumed global — not declared in this section
**Severity:** Low
**Lines:** 1464, 1480, 1502, 1522
All four functions depend on `apiFetch`, which must be defined elsewhere in the file. If the declaration order changes this will silently break at runtime.
**Action:** Add a comment near the top of the section noting the dependency, or consolidate all API helper declarations before this section.

### `importDecklist()` called without awaited result check
**Severity:** Low
**Lines:** 1513
`await importDecklist()` is called after populating the textarea, but any error thrown inside `importDecklist` is caught by the outer `catch {}` block that shows a generic "Failed to load deck" toast, masking the real cause.
**Action:** Let `importDecklist` throw with a descriptive error, and propagate it via the named catch.

## Summary
The Save/Load section is concise and functionally correct, but three empty catch blocks hide errors that would be valuable for debugging. The pattern of silently discarding server error bodies (except in `saveDeck`) is inconsistent and should be unified.
