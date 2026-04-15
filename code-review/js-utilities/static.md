# Static Review — Utilities
Lines: 2141–2156 (plus `formatManaCostShort` at 1642–1645) | File: public/mtg-commander.html

## Findings

### `escapeHtml` does not escape `"` (double quote) or `'` (single quote)
**Severity:** Medium
**Lines:** 2142–2144
`escapeHtml` replaces `&`, `<`, and `>` but not `"` (`&quot;`) or `'` (`&#39;`/`&apos;`). This is sufficient for protecting text-content insertion (where quotes are not meaningful) but insufficient for safely embedding values in HTML attribute values. If `escapeHtml` output is used inside a quoted attribute (e.g. `alt="${escapeHtml(...)}"` or `title="${escapeHtml(...)}"`), an input containing `"` would break the attribute.
Looking at current usage: `alt="${escapeHtml(card.name)}"` (lines 1891, 1948, 2048–2049) — card names could theoretically contain double quotes. In practice Scryfall card names do not, but custom token names (user input) could.
**Action:** Extend `escapeHtml` to also replace `"` with `&quot;`: add `.replace(/"/g, '&quot;')`. This makes it safe for all HTML contexts (both text content and attribute values).

### `escapeQuotes` replaces `"` with `&quot;` — incorrect for JS string context
**Severity:** High
**Lines:** 2145–2147
`escapeQuotes` replaces `"` with `&quot;`. This is an HTML entity, not a JavaScript escape. When `escapeQuotes` output is used inside an onclick attribute's JS string argument (e.g. `onclick="fn('${escapeQuotes(val)}')"`) and the value contains a double quote, the resulting HTML is `onclick="fn('val&quot;rest')"`. The browser HTML-decodes `&quot;` back to `"` before evaluating the JS, so the JS sees `fn('val"rest')` — a valid string. This is accidentally correct for double quotes in single-quoted JS strings.
However, `escapeQuotes` replaces `'` with `\'`. Inside a double-quoted HTML attribute, `\'` is a valid JS escape sequence. But if the onclick uses single-quoted delimiters in HTML (`onclick='fn("...')"'`), the `\` would first be processed by HTML, potentially stripping it.
The function name is misleading — it is designed for one specific embedding context (JS string argument inside double-quoted HTML attribute) but provides false confidence for other contexts.
**Action:** Rename to `escapeForOnclick` and add a docblock explaining the exact context it is safe for. For all new call sites, prefer `JSON.stringify(value)` which is unambiguously correct for embedding values in JS function calls inside HTML event attributes.

### `formatManaCostShort` truncates to 10 characters — may split mid-symbol
**Severity:** Low
**Lines:** 1644
`.slice(0, 10)` is applied after replacing `{X}` notation with just `X`. The resulting string is a flat sequence like `2RG`. A 10-character limit is generally sufficient for mana costs, but an edge case like `{X}{X}{W}{U}{B}{R}{G}{C}` (8 symbols = 8 chars) would be fine, while `{10}{W}{U}{B}{R}{G}` becomes `10WUBRG` (7 chars). No truncation issue in practice with real cards, but the magic number is undocumented.
**Action:** Add a comment explaining the 10-character cap and verify it covers the longest realistic mana costs.

### `toastTimer` is a module-level `let` variable — could leak across calls
**Severity:** Low
**Lines:** 2149
`toastTimer` is a module-level mutable variable. This is fine for a single toast, but if multiple toasts were shown rapidly (before the 3s timeout), `clearTimeout(toastTimer)` correctly resets the timer. No bug, but the variable placement is easy to miss during refactoring.
**Action:** Encapsulate `toastTimer` inside a closure or IIFE alongside `showToast` to make its scope explicit.

## Summary
The two key issues are: `escapeHtml` does not escape double quotes (making it unsafe for attribute contexts), and `escapeQuotes` is a confusingly named function with context-specific behavior that encourages misuse. Both should be fixed to prevent future XSS vulnerabilities as the codebase grows.
