# Security Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Token power/toughness values injected without escaping
**Severity:** Medium
**Lines:** 1898
`bfc.card.power` and `bfc.card.toughness` are interpolated directly into an innerHTML string. Although these values come from Scryfall and are generally safe, any API-sourced value injected into innerHTML without escaping is a latent XSS risk.
**Action:** Apply `escapeHtml()` to both values before interpolation.

### `bfc.card.type_line` substring injected without escaping
**Severity:** Medium
**Lines:** 1899
The result of `bfc.card.type_line?.split('—')[1]?.trim()` (or the fallback `'Token'`) is interpolated directly into innerHTML. Scryfall data is generally trusted, but the pattern should consistently escape all API text.
**Action:** Wrap the entire expression in `escapeHtml()`: `escapeHtml(bfc.card.type_line?.split('—')[1]?.trim() || 'Token')`.

### `idStr` used in onclick attribute — relies on JSON.stringify for safety
**Severity:** Low
**Lines:** 1884, 1889, 1895
`bfc.id` is produced by `Date.now() + Math.random()` (a number), so `JSON.stringify` will always produce a safe numeric literal. However, the pattern of inserting `JSON.stringify`-ed values into onclick attributes is fragile if the id type ever changes to a string (e.g., UUID).
**Action:** Document that IDs must remain numeric, or use `escapeQuotes()` / `escapeHtml()` around `idStr` if IDs become strings in the future.

## Summary
The most notable risk is API-sourced data (power, toughness, type_line) being injected into innerHTML without escaping. While Scryfall data is unlikely to contain malicious content, the project's own XSS prevention pattern (using `escapeHtml()`) should be applied consistently to all interpolated values.
