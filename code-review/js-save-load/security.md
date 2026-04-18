# Security Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Unescaped `d.id` in onclick attributes
**Severity:** Medium
**Lines:** 1489, 1490
`d.id` is interpolated directly into `onclick` attribute strings without any escaping:
```js
onclick="loadDeckFromSaved('${d.id}')"
onclick="deleteSavedDeck('${d.id}', '${escapeQuotes(d.name)}')"
```
UUIDs from Supabase are safe today, but if the id field ever changes type or a compromised API response contains a crafted string, this becomes an XSS vector via attribute injection. `d.name` on the second button is correctly passed through `escapeQuotes()`.
**Action:** Wrap `d.id` with `escapeQuotes(d.id)` (or the project's equivalent) on both lines to be consistent and safe by construction.

### URL path concatenation without encoding
**Severity:** Low
**Lines:** 1502, 1522
```js
apiFetch('/api/mtg/decks/' + id)
```
`id` is concatenated directly into the URL path. For UUIDs this is safe, but the pattern is fragile — if `id` ever contains a `/` or `?` character it would alter the request path.
**Action:** Use `encodeURIComponent(id)` when building path segments: `` `/api/mtg/decks/${encodeURIComponent(id)}` ``.

### Raw `err.message` surfaced in toast
**Severity:** Low
**Lines:** 1472
The save-failure toast forwards `err.message` directly to `showToast()`. If `showToast` sets `innerHTML` (rather than `textContent`), a crafted server error message could inject HTML. Verify that `showToast` escapes its input.
**Action:** Confirm `showToast` uses `textContent` or `escapeHtml()` internally; if not, wrap: `showToast('Save failed: ' + escapeHtml(err.message), true)`.

## Summary
The main concern is unescaped `d.id` in onclick attribute strings — `d.name` is correctly protected but `d.id` is not. UUID format makes exploitation unlikely in practice, but consistency with the project's escaping conventions (`escapeQuotes`) should be enforced.
