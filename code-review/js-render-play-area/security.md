# Security Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### XSS via unescaped `power`/`toughness` in token card HTML
**Severity:** High
**Lines:** 1898
`bfc.card.power` and `bfc.card.toughness` are interpolated directly into an innerHTML template without `escapeHtml()`. Custom tokens created via the Token Modal are user-supplied (the power/toughness fields come from form input). If a user enters `<img src=x onerror=alert(1)>` as the power value, it executes when `bfCardHTML` renders.
**Action:** Apply `escapeHtml()` to both values immediately: `${escapeHtml(String(bfc.card.power))}/${escapeHtml(String(bfc.card.toughness))}`.

### XSS via unescaped `type_line` substring in token card HTML
**Severity:** High
**Lines:** 1899
The subtype extracted from `bfc.card.type_line` (after the `—` separator) is interpolated into innerHTML without escaping. For custom tokens, `type_line` is directly user-supplied via the Token Modal form. An attacker could inject arbitrary HTML here.
**Action:** Wrap with `escapeHtml()`: `escapeHtml(bfc.card.type_line?.split('—')[1]?.trim() || 'Token')`.

### `onclick` handler uses `JSON.stringify(bfc.id)` — safe but verify `id` type
**Severity:** Low
**Lines:** 1884, 1889, 1895
`JSON.stringify(bfc.id)` is used to embed the battlefield card ID into an `onclick` attribute. If `bfc.id` is always a number or UUID string, `JSON.stringify` produces a safely quoted value. However, if `id` could be a string containing a single quote followed by JavaScript, this could break out of the attribute context. Since IDs appear to be numeric (generated incrementally in the play-core section), this is low risk.
**Action:** Confirm that `bfc.id` is always a number. Add a comment noting that `JSON.stringify` is used intentionally for safe serialization in event handlers.

### Image URLs from Scryfall API injected into `src` attributes
**Severity:** Low
**Lines:** 1890, 1913, 1918
Scryfall image URLs are trusted third-party data. In an `img src` attribute context, `javascript:` URIs are inert for images in modern browsers. No change required for current security posture.
**Action:** No change required. Document that Scryfall is a trusted source for image URIs.

## Summary
Two high-severity XSS vulnerabilities exist where custom user-supplied token data (`power`, `toughness`, `type_line`) is interpolated into innerHTML without escaping. These must be fixed before custom tokens can be considered safe. The onclick handler pattern using `JSON.stringify` is correctly implemented for numeric IDs.
