# Static Code Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` does not escape single quotes
**Severity:** Medium
**Lines:** 2142–2144
`escapeHtml` replaces `&`, `<`, and `>` but not `'` (single quote, `&#39;`) or `"` (double quote, `&quot;`). This is sufficient for body text content but insufficient for values injected into HTML attributes. For example, injecting an `escapeHtml`-encoded string into `<img alt="${escapeHtml(name)}">` is safe, but injecting into `<div onclick="fn('${escapeHtml(name)}')">` is not, because single quotes are not escaped.

The codebase uses `escapeHtml` primarily for body/alt content, with `escapeQuotes` for onclick contexts. However several call sites reviewed in earlier segments use `escapeHtml` for attribute values in contexts where single quotes could be problematic.
**Action:** Either expand `escapeHtml` to also escape `'` → `&#39;`, or add a clear comment documenting that `escapeHtml` is only safe for HTML body content (not for attribute values that contain JS). Ensure all call sites using `escapeHtml` in attribute contexts are audited.

### `escapeQuotes` uses backslash escaping for single quotes
**Severity:** Medium
**Lines:** 2146
`str.replace(/'/g, "\\'")` — backslash-escaping single quotes in JavaScript string literals embedded in HTML attributes is not standard HTML encoding. HTML parsers do not treat `\'` as an escaped single quote in attribute values — the `\` is treated as a literal backslash. This means the escaping only works if the resulting string is evaluated by a JS engine (which does honour `\'`) but could fail in HTML parsing contexts.

The pattern is used in `onclick="fn('${escapeQuotes(value)}')"`. When the browser sees the attribute, it first parses HTML (not JS), so `\'` in `onclick` content is not treated as an escaped single quote by the HTML parser. Fortunately most modern browsers are lenient, and the pattern happens to work in practice — but it is technically incorrect.
**Action:** Replace `escapeQuotes` usage in onclick attributes with `JSON.stringify(value)` which produces a properly quoted JS string regardless of the content: `onclick="fn(${JSON.stringify(value)})"`.

### `formatManaCostShort` truncates at 10 characters without considering symbol boundaries
**Severity:** Low
**Lines:** 1643–1645 (referenced from this section)
`manaCost.replace(...).slice(0, 10)` — the slice may cut a multi-character symbol (e.g., `10` becomes `1` if the cut falls mid-symbol). For most practical mana costs this is fine, but an unusual cost like `{10}{10}{10}` would be truncated to `10101010` (fine) but `{12}{U}{U}` becomes `12UU` — truncated to `12UU` (fine at 4 chars). The 10-char limit is conservative but arbitrary.
**Action:** Low priority. Add a comment explaining the 10-char limit is a display heuristic.

### `toastTimer` is a module-level variable that leaks into global scope
**Severity:** Low
**Lines:** 2149
`let toastTimer;` is declared at module level. In a single-file script (no module scope), this is a global variable. If another script on the page used `toastTimer`, there would be a collision.
**Action:** For a standalone HTML file this is acceptable. If scripts from other sources are ever included, move `toastTimer` inside an IIFE or module pattern.

## Summary
The utilities section contains the foundational XSS prevention functions for the entire file. The key finding is that `escapeHtml` does not escape quotes, making it insufficient for attribute contexts, and `escapeQuotes` uses non-standard backslash escaping. These are systemic issues that affect every call site across the file. Switching onclick contexts to `JSON.stringify` would be the most impactful single fix in the entire codebase.
