# Security Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Deck ID injected unsanitised into onclick attribute
**Severity:** High
**Lines:** 1489–1490
`d.id` (a UUID from the API) is interpolated directly into `onclick` attribute strings:
```html
onclick="loadDeckFromSaved('${d.id}')"
onclick="deleteSavedDeck('${d.id}', '${escapeQuotes(d.name)}')"
```
`d.name` is passed through `escapeQuotes()` but `d.id` is not escaped at all. Although Supabase UUIDs are hex-and-hyphen only and low-risk in practice, there is no runtime guarantee that `d.id` will always be a UUID — a compromised backend or a future schema change could return a value containing a single-quote or JS expression that breaks out of the attribute string.
**Action:** Either wrap `d.id` through `escapeHtml()` / `escapeQuotes()` in the template, or — better — attach event listeners via JS rather than inline `onclick` attributes, passing the id through a `data-id` attribute.

### Error message from server reflected into toast without sanitisation
**Severity:** Medium
**Lines:** 1468, 1472
`err.message` is passed to `showToast('Save failed: ' + err.message, true)`. If `showToast` renders its argument via `innerHTML` (rather than `textContent`), a crafted server error body could inject HTML. The `saveDeck` catch on line 1468 explicitly reads `await res.text()` which is the raw server response body.
**Action:** Confirm `showToast` uses `textContent` for its message. If it uses `innerHTML`, sanitise or truncate the error string before display.

### URL-constructed API path with unsanitised ID
**Severity:** Low
**Lines:** 1502, 1522
`'/api/mtg/decks/' + id` constructs a URL from `id` passed as a function argument (originating from the `onclick` attribute). If `id` is ever non-UUID (e.g. `../admin`), this becomes a path-traversal attempt at the client side. Server-side routing should reject non-UUID paths, but defence-in-depth favours validating the id client-side too.
**Action:** Validate `id` matches a UUID pattern before constructing the fetch URL: `if (!/^[0-9a-f-]{36}$/i.test(id)) return;`

## Summary
The primary risk is the unescaped `d.id` in inline `onclick` attributes; switching to data-attribute + addEventListener pattern would eliminate the entire class of inline-handler injection risks. The direct use of raw server response text in toasts is a secondary concern contingent on how `showToast` renders its argument.
