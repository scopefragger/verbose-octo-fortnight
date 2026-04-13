# Code & Pattern Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent use of `res.ok` error handling
**Severity:** Low
**Lines:** 1468, 1481, 1503, 1522
`saveDeck` throws `new Error(await res.text())` on failure, capturing the server message. The other three functions throw `new Error()` with no message. This inconsistency means only save errors can provide meaningful feedback; all load/delete failures show generic messages.
**Action:** Standardize: all non-ok responses should throw with `await res.text()` or a structured message.

### Repeated loading toast pattern
**Severity:** Low
**Lines:** 1478, 1500
Both `loadSavedDecks` and `loadDeckFromSaved` show a loading indicator, but they do so in different ways (innerHTML spinner vs toast). The pattern is inconsistent.
**Action:** Decide on one loading indicator approach and apply it consistently.

### `tokens: []` passed as hardcoded literal
**Severity:** Low
**Lines:** 1466
Magic empty array passed in the POST body. The API schema clearly supports tokens (the DB column is `tokens JSONB`), so this should either be a named constant or read from state.
**Action:** Replace with a state variable or explicit comment explaining why tokens are not saved.

### `decks.map(...)` template literal is deeply indented
**Severity:** Low
**Lines:** 1484–1493
The inline HTML template inside `decks.map()` is deeply nested, making it hard to read. No line length or complexity violations per se, but it's harder to review and maintain.
**Action:** Extract to a `savedDeckItemHTML(d)` helper function.

## Summary
Error handling is inconsistent across the four functions — save captures the server error message but the others don't. A minor inconsistency in loading UI patterns also exists. Extracting the template literal to a named helper would improve readability.
