# Security Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### XSS via `onclick` attribute — deck ID injected without escaping
**Severity:** High
**Lines:** 1489–1490
Deck IDs from the API response (`d.id`) are interpolated directly into `onclick` attribute strings:
```js
onclick="loadDeckFromSaved('${d.id}')"
onclick="deleteSavedDeck('${d.id}', '${escapeQuotes(d.name)}')"
```
Although UUIDs from Supabase are safe in practice, any data from an API response used in an `onclick` attribute should be treated as untrusted. If the ID ever changes format or a different backend is used, a crafted ID like `'); alert(1)//` would execute arbitrary JavaScript. `d.name` is wrapped in `escapeQuotes`, but `d.id` is not wrapped in anything.
**Action:** Either use `escapeHtml(d.id)` in the attribute string, or—better—replace inline `onclick` strings with `addEventListener` attached after rendering using a `data-id` attribute, which eliminates the injection surface entirely.

### Deck name rendered via `escapeHtml` but passed raw in `deleteSavedDeck` call via `escapeQuotes`
**Severity:** Medium
**Lines:** 1490, 1519–1520
`escapeQuotes(d.name)` prevents quote-breaking the JS string attribute, but if the name contains characters like `\n`, `\r`, or other control characters it may still behave unexpectedly inside the `confirm()` dialog (line 1520). The `confirm()` call itself is not harmful, but the name appears unescaped there.
**Action:** Sanitise or truncate the name before showing it in `confirm()`, or use a custom modal instead of `confirm()`.

### Deck ID used directly in URL path without validation
**Severity:** Low
**Lines:** 1502, 1522
`apiFetch('/api/mtg/decks/' + id)` — `id` comes from the API response and is likely a UUID, but it is appended to the path without any format validation. A malformed or unexpected ID could hit unintended routes (path traversal is unlikely given Express routing, but good hygiene to validate).
**Action:** Assert `id` matches a UUID pattern before use, or rely on server-side validation and log the mismatch.

### Toast shows raw `err.message` which may contain server-internal detail
**Severity:** Low
**Lines:** 1472
`showToast('Save failed: ' + err.message, true)` — if the server returns internal error messages (stack traces, SQL errors), they could be displayed to the user, leaking internal implementation details.
**Action:** Consider capping the displayed error to a safe user-facing message and logging the full `err.message` to the console separately.

## Summary
The primary security concern is the unescaped deck ID in `onclick` attribute strings, which is an XSS vector if the ID source ever changes. Replacing inline event handlers with `data-*` attributes and `addEventListener` would fully eliminate this class of risk and is the recommended fix.
