# Security Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### UUID passed directly into onclick attribute without escaping
**Severity:** Medium
**Lines:** 1489–1490
`d.id` is interpolated into `onclick="loadDeckFromSaved('${d.id}')"` and `onclick="deleteSavedDeck('${d.id}', ...)"` without any escaping. If the API ever returns a non-UUID `id` value (e.g. due to a bug or injection upstream), a value containing a single-quote could break out of the JS string literal and execute arbitrary code.
**Action:** Wrap `d.id` with `escapeQuotes()` (already available in this file) in both onclick attributes: `onclick="loadDeckFromSaved('${escapeQuotes(d.id)}')"`.

### `deleteSavedDeck` name parameter reflected in `confirm()` dialog without sanitisation
**Severity:** Low
**Lines:** 1520
The `name` argument displayed in `confirm(\`Delete deck "${name}"?\`)` comes from the value that was itself passed via an `onclick` attribute (line 1490), which is escaped with `escapeQuotes`. However, it is then re-displayed directly inside a native `confirm()` dialog. While `confirm()` does not execute HTML, deceptive content (e.g. very long strings or Unicode lookalikes) could mislead users.
**Action:** Truncate the name to a reasonable length (e.g. 80 chars) before showing it in the confirm dialog.

### `d.id` URL-concatenated without validation
**Severity:** Low
**Lines:** 1502, 1522
`'/api/mtg/decks/' + id` constructs a URL by simple string concatenation. If `id` contains path-traversal characters (e.g. `../other-resource`), the request URL could resolve to an unintended endpoint. Server-side routing should already guard against this, but client-side validation is an additional safety layer.
**Action:** Validate that `id` matches a UUID pattern before appending it to the URL, or use `encodeURIComponent(id)`.

### Error message from server reflected in toast
**Severity:** Low
**Lines:** 1472
`showToast('Save failed: ' + err.message, true)` echoes the raw server error message. If the server returns data containing HTML-like strings, and `showToast` uses `innerHTML`, this could be an XSS vector.
**Action:** Verify that `showToast` uses `textContent` (or `escapeHtml`) when rendering the message. If it uses `innerHTML`, wrap `err.message` with `escapeHtml()`.

## Summary
The most significant risk is the unescaped `d.id` in onclick attributes — even though UUIDs are currently safe, relying on implicit format guarantees is fragile. The `escapeQuotes` helper is already used for `d.name` on line 1490 and should be applied to `d.id` on both lines 1489 and 1490.
