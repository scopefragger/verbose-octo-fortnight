# Code & Pattern Review — Save / Load

Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent error-throw pattern across the four functions
**Severity:** Low
**Lines:** 1468, 1481, 1503, 1523
`saveDeck` (line 1468) correctly throws `new Error(await res.text())` on a non-ok response, preserving the server message. The other three functions throw `new Error()` (no message) or nothing at all for non-ok responses. This inconsistency makes the section harder to read holistically and produces inferior user-facing error messages for three out of four operations.
**Action:** Standardise all four non-ok paths to `throw new Error(await res.text())` to match the existing `saveDeck` pattern.

### Inline HTML template in `loadSavedDecks` is a multi-line string with mixed concerns
**Severity:** Low
**Lines:** 1484–1492
The `decks.map(d => \`...\`)` template literal spans eight lines and mixes structure, display formatting, event wiring, and escaping in one place. This is common in vanilla-JS single-file apps but makes the template hard to scan, especially when security-relevant escaping rules must be checked line by line.
**Action:** Extract to a named `renderSavedDeckItem(d)` function (aligns with the architecture finding). At minimum, break the template into clearly commented sections (structure / meta / actions).

### Date formatting uses `toLocaleDateString()` without a locale argument
**Severity:** Low
**Lines:** 1487
`new Date(d.updated_at).toLocaleDateString()` produces a locale-dependent string that varies by browser locale settings. Across different users or system locales, the same date may display as `4/12/2026`, `12/04/2026`, or `12.04.2026`, causing confusion in a shared family context.
**Action:** Pass an explicit locale and options: `new Date(d.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })` (or whichever locale matches the family's region), or define a shared `formatDate()` utility used consistently across the file.

### `saveDeck` hardcodes `tokens: []` — magic empty array with no comment
**Severity:** Low
**Lines:** 1466
Hardcoding `tokens: []` is a magic value with no explanation. A future developer cannot tell whether this is a placeholder, intentional, or a bug.
**Action:** Replace with a comment: `tokens: [] // tokens are not persisted at save time — managed separately in play mode` or resolve the actual intent (see static review).

### `loadSavedDecks` loading spinner is an inline HTML string
**Severity:** Low
**Lines:** 1478
The loading state is set via `el.innerHTML = '<div class="empty-saved"><span class="loading-spinner"></span></div>'`. The same `empty-saved` class and `loading-spinner` pattern likely appears elsewhere in the file. If the class names change, all occurrences must be updated manually.
**Action:** Define a shared constant `const LOADING_HTML = '<div class="empty-saved"><span class="loading-spinner"></span></div>';` at module scope and reference it wherever a loading placeholder is needed.

### `deleteSavedDeck` parameter named `name` shadows no outer variable but is ambiguous
**Severity:** Low
**Lines:** 1519
The function signature `deleteSavedDeck(id, name)` is clear, but the `name` parameter is used both in the `confirm` dialog and in the success toast without any indication of where it came from. Callers pass it as a literal string from the `onclick` attribute (which came from `escapeQuotes(d.name)`), meaning the displayed name in the toast may differ from what the server actually deleted if the name was truncated or transformed during escaping.
**Action:** After a successful delete, prefer refreshing the list and letting `loadSavedDecks` re-render rather than echoing the client-side name in the toast. Alternatively, use the server response to confirm the deleted name.

## Summary
The section follows the project's general patterns reasonably well, but there is meaningful inconsistency in how non-ok HTTP responses are handled across the four functions. Several minor patterns — the hardcoded `tokens: []`, locale-free date formatting, and the repeated loading-spinner HTML string — would benefit from named constants or shared utilities to improve maintainability and consistency with the rest of the file.
