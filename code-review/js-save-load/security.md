# Security Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `onclick` attributes use `escapeQuotes` on IDs — relies on numeric UUID safety
**Severity:** Medium
**Lines:** 1489–1490
`d.id` (a UUID from the server) is interpolated directly into an `onclick` attribute string without escaping: `onclick="loadDeckFromSaved('${d.id}')"`. UUIDs from Supabase are hex-and-dash strings so this is not currently exploitable, but if the ID shape ever changes, this becomes an XSS vector. `d.name` passed to `deleteSavedDeck` uses `escapeQuotes` but that helper only escapes single-quotes and double-quotes — it does not encode the HTML attribute context, meaning a name containing `</button><script>` could escape the attribute.
**Action:** Use `escapeHtml(d.id)` for IDs inside attribute strings. Consider using data attributes and attaching event listeners in JS rather than inline `onclick`.

### `showToast('Save failed: ' + err.message, true)` — `err.message` comes from `res.text()`
**Severity:** Low
**Lines:** 1468–1472
The server error message is passed to `showToast`, which uses `el.textContent = msg` (not innerHTML), so XSS is not possible here.
**Action:** No change needed; textContent assignment is safe.

### Deck name confirmation dialog uses the raw `name` parameter
**Severity:** Low
**Lines:** 1520
`confirm(\`Delete deck "${name}"?\`)` uses the caller-supplied `name` string directly. Since `confirm()` renders as a native dialog, not HTML, there is no XSS risk. However the `name` was previously `escapeQuotes`-processed by the caller's inline handler, which could result in confusing escaped sequences shown in the dialog.
**Action:** Pass the original unescaped name directly to the deletion function rather than escaping it for an onclick attribute context.

## Summary
The most actionable finding is the bare UUID interpolation in onclick strings — while currently safe due to UUID shape, it sets a poor precedent. The `escapeQuotes` helper is insufficient for full HTML attribute XSS prevention; data attributes with JS event listeners would be the correct fix.
