# Security Review — Save / Load

Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### `onclick` attribute injects `d.id` without escaping
**Severity:** High
**Lines:** 1489–1490
Both buttons in the saved-deck list embed `d.id` directly into an `onclick` attribute string:
```html
onclick="loadDeckFromSaved('${d.id}')"
onclick="deleteSavedDeck('${d.id}', '${escapeQuotes(d.name)}')"
```
`d.id` comes from the API response and is expected to be a UUID, but this is not validated on the client side. If the server ever returns a malformed or tampered ID containing a single quote or JavaScript-injection payload, the raw value is interpolated directly into executable JavaScript. A compromised or malicious server could deliver an ID like `'); maliciousCode(); ('` to achieve XSS.
**Action:** Wrap `d.id` with `esc()` (the project-standard XSS helper) in both `onclick` attributes, or — better — attach event listeners programmatically via `addEventListener` so no data ever touches an HTML string as executable code.

### `escapeQuotes` used for `d.name` in `onclick` but `esc()` / `escapeHtml()` not used
**Severity:** Medium
**Lines:** 1490
The deck name is passed through `escapeQuotes()` before being placed inside a JS string argument in an `onclick` attribute. However, `escapeQuotes` likely only escapes single/double quotes. A name containing `<`, `>`, or other HTML metacharacters could still mutate the surrounding HTML context if the attribute boundary is broken by browser quirks or future refactoring.
**Action:** Per the project's CLAUDE.md frontend pattern ("IDs passed as JS string arguments must be `esc()`-wrapped"), replace `escapeQuotes(d.name)` with `esc(d.name)` to apply full HTML-context escaping.

### URL construction with unvalidated `id` in API path
**Severity:** Low
**Lines:** 1502, 1522
`apiFetch('/api/mtg/decks/' + id)` appends the `id` value — which comes from an `onclick` attribute string — directly to the URL path. While this does not constitute a traditional injection attack (the API server validates ownership), there is no client-side format check ensuring `id` is a UUID before use.
**Action:** Add a UUID format check: `if (!/^[0-9a-f-]{36}$/i.test(id)) return;` before calling `apiFetch`. This is defence in depth against a compromised API response or accidental mis-invocation.

### `confirm()` dialog for destructive action uses name from API
**Severity:** Low
**Lines:** 1520
The confirmation message `Delete deck "${name}"?` injects the deck `name` directly into a native dialog. `name` here is a JS variable (not HTML), so XSS via HTML injection is not possible in the dialog itself; however, if the name contains special characters such as newlines or Unicode control characters, the dialog text could be visually confusing or misleading.
**Action:** Trim and sanitise the name before embedding it in the confirm string, or limit the displayed length: `name.slice(0, 50)`.

## Summary
The most significant issue is that `d.id` is injected unescaped into `onclick` attributes, creating an XSS vector if the server returns a non-UUID identifier. The project's own CLAUDE.md guidelines require `esc()` on all values in `onclick` strings — this section does not follow that rule for IDs. The `escapeQuotes`-only treatment for deck names in `onclick` is also insufficient by the project's own standard.
