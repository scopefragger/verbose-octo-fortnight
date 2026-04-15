# Security Review — Utilities
Lines: 2141–2156 (plus `formatManaCostShort` at 1642–1645) | File: public/mtg-commander.html

## Findings

### `escapeHtml` is incomplete — does not escape double quotes
**Severity:** High
**Lines:** 2142–2144
`escapeHtml` is the primary XSS prevention function for this file. It escapes `&`, `<`, and `>` but not `"`. When `escapeHtml` output is placed inside a double-quoted HTML attribute (e.g. `alt="${escapeHtml(name)}"`, `title="${escapeHtml(name)}"`), a value containing `"` closes the attribute and can inject new attributes or event handlers.

Current call sites include:
- `alt="${escapeHtml(bfc.card.name)}"` (line 1891) — card names could contain `"`
- `alt="${escapeHtml(card.name)}"` (line 1918) — same
- `title="${escapeHtml(card.name)}"` (line 1917) — same
- Various `alt="${escapeHtml(...)}"` in graveyard viewer (line 2048)

A custom token with `name = 'Test" onerror="alert(1)'` would produce `alt="Test" onerror="alert(1)"` — a working XSS payload.
**Action:** Add `.replace(/"/g, '&quot;')` to `escapeHtml`: `return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');`. This makes `escapeHtml` safe for all HTML contexts.

### `escapeQuotes` replaces `"` with HTML entity in JS context — creates false security confidence
**Severity:** Medium
**Lines:** 2145–2147
`escapeQuotes` is used to embed values in onclick attribute JS strings. It replaces `"` with `&quot;` — an HTML entity, not a JS escape. The browser HTML-decodes entities before evaluating event handlers, so `&quot;` becomes `"` in the JS runtime, which is the intended behavior. However, this means `escapeQuotes` provides no protection against injection via `"` characters in the JS string context.

More critically, `escapeQuotes` escapes `'` with `\'`, which is a JS string escape. But the backslash itself is not escaped. A value like `\` (a single backslash) becomes `\` in the output and then `\\` is never produced. A value like `\'` becomes `\\'`, which in JS is `\` followed by the end of the string — breaking the onclick. This is an incomplete escaping implementation.
**Action:** Remove all uses of `escapeQuotes` for onclick argument embedding and replace with `JSON.stringify(value)`. Keep `escapeQuotes` only if there is a documented use case, but rename it to avoid misuse.

### `showToast(msg)` uses `textContent` — correctly safe
**Severity:** Info
**Lines:** 2152
`el.textContent = msg` is used for the toast message, so user-visible error messages or API error text passed to `showToast` cannot contain HTML that executes.
**Action:** No change required. Good use of `textContent`.

### `formatManaCostShort` output used in innerHTML without escaping
**Severity:** Medium
**Lines:** 1644, 1920
`formatManaCostShort` extracts characters from inside `{...}` braces and concatenates them. The output (e.g. `2RG`) should contain only alphanumeric characters and special mana symbols. However, since it operates on `card.mana_cost` from Scryfall (trusted) and its output is used directly in innerHTML (line 1920), any unexpected characters in the mana cost string would be injected unescaped.
**Action:** Apply `escapeHtml` to the output of `formatManaCostShort` at the call site (line 1920), or add HTML escaping inside `formatManaCostShort` before returning.

## Summary
The `escapeHtml` utility is missing double-quote escaping, which is an active XSS vulnerability in attribute contexts with custom token names. `escapeQuotes` provides incomplete and misleading protection and should be replaced by `JSON.stringify` at all call sites. These are the highest-priority fixes in the entire codebase.
