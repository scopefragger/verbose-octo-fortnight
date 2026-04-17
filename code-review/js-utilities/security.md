# Security Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` does not escape `"` — unsafe in double-quoted HTML attributes
**Severity:** High
**Lines:** 2143
`escapeHtml` only escapes `&`, `<`, and `>`. It is used in HTML attribute values delimited by double quotes throughout the file:
- `alt="${escapeHtml(card.name)}"` — lines 1426, 1891, 1918, 2048
- `title="${escapeHtml(card.name)}"` — line 1917

A card name containing a `"` character (possible via Scryfall data or custom token names from user input) would prematurely close the attribute, injecting free HTML. For example: `card.name = 'Jace" onmouseover="alert(1)'` would produce `alt="Jace" onmouseover="alert(1)"` — a classic XSS payload.

While standard MTG card names from Scryfall do not contain double quotes, **custom token names** (from `addCustomToken()` at line 1849) come from a user-controlled `<input>` field and flow through `escapeHtml` into `alt` attributes on the battlefield.
**Action:** Add double-quote escaping to `escapeHtml`:
```js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```
This is a single-line fix with broad security impact across all call sites.

### `escapeQuotes` does not escape backslashes — `\'` neutralisation risk
**Severity:** High
**Lines:** 2146
`escapeQuotes` is used in `onclick="showCardDetail('${escapeQuotes(card.name)}')"` (graveyard viewer line 2047) and similar contexts (autocomplete line 2118). It escapes `'` → `\'` and `"` → `&quot;`.

A value containing a backslash defeats this: `name = "foo\\"` → `escapeQuotes` produces `"foo\\"` → in the onclick attribute this becomes `'foo\\'` where `\\` is an escaped backslash and the trailing `'` is now unescaped, breaking out of the JS string. Custom token names from user input can contain backslashes.
**Action:** Escape backslashes first, before escaping quotes:
```js
function escapeQuotes(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}
```

### `showToast` uses `textContent` for the message — safe
**Severity:** Low
**Lines:** 2152
`el.textContent = msg` is used to set the toast message. `textContent` is inherently XSS-safe regardless of the `msg` content. All callers pass string literals or template literals with non-HTML content.
**Action:** No action needed — positive finding.

### `escapeHtml` used on JSON output in `addToken` onclick — `"` not escaped
**Severity:** High
**Lines:** 2029 (consumer), 2143 (definition)
As flagged in the Token Modal security review, `escapeHtml(JSON.stringify(t))` is used to sanitise a JSON object for an `onclick` attribute. `escapeHtml` does not escape `"`, so JSON's double-quote delimiters leak directly into the attribute, prematurely terminating the `onclick` value. This is a consequence of the `escapeHtml` deficiency described above.
**Action:** Fixed by adding `"` → `&quot;` escaping to `escapeHtml` as described in the first finding.

## Summary
The utility escape functions have two high-severity deficiencies: `escapeHtml` missing `"` escaping (affects `alt`, `title`, and JSON-in-onclick usages) and `escapeQuotes` missing backslash escaping (affects `onclick` with user-controlled card names). Both are easy single-line fixes with significant security impact across the entire file. These should be the highest-priority fixes from the entire code review.
