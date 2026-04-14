# Security Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### XSS via deck name in onclick attribute (deleteSavedDeck)
**Severity:** High
**Lines:** 1490
The deck `name` is passed as a JS string literal inside an `onclick` attribute:
```html
onclick="deleteSavedDeck('${d.id}', '${escapeQuotes(d.name)}')"
```
`escapeQuotes` replaces `'` with `\'` and `"` with `&quot;`. However a name containing `)` followed by `;` and injected JS (e.g., `x');alert(1)//`) will break out of the string and execute arbitrary JavaScript. `escapeQuotes` does not escape `)`, `;`, or backticks.
**Action:** Do not embed user-supplied strings as JS arguments in inline handlers. Use `data-*` attributes on the element and read them in a delegated event listener, or use `JSON.stringify` + `escapeHtml` on the stringified value.

### UUID passed unsanitised as part of the fetch URL (loadDeckFromSaved, deleteSavedDeck)
**Severity:** Low
**Lines:** 1502, 1522
The `id` parameter is appended directly to the URL string (`'/api/mtg/decks/' + id`). UUIDs from the server are trustworthy, but if `id` ever originates from user input, path traversal or injection is possible.
**Action:** Validate `id` matches UUID format before use, or use `encodeURIComponent(id)`.

### `showToast('Save failed: ' + err.message, true)` may leak server internals
**Severity:** Low
**Lines:** 1472
`err.message` is derived from `await res.text()` which may contain raw server error messages (stack traces, SQL errors). These are shown directly to the user in the toast.
**Action:** Inspect `res.status` and show a generic client-facing message; log the raw error to the console for debugging.

## Summary
The most significant risk is the incomplete XSS escaping in the `deleteSavedDeck` onclick attribute — `escapeQuotes` is insufficient to safely embed arbitrary deck names as JavaScript string arguments. The other findings are low-severity.
