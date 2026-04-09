# Static Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `formatManaCostShort` truncates at 10 characters — may silently clip valid mana costs
**Severity:** Low
**Lines:** 2142–2145 (defined at 1642–1645)
`formatManaCostShort` removes `{` and `}` brackets then calls `.slice(0, 10)`. A complex mana cost like `{10}{W}{W}{U}{U}` would render as `10WWUU` (6 chars) — fine. But a cost like `{2}{W/U}{W/U}{W/U}{B}` would render as `2W/UW/UW/U` (10 chars) which is exactly 10 and not clipped. For extremely long costs, the clip is silent with no ellipsis. This is a display-only issue.
**Action:** Consider appending `…` if the string was clipped: `const short = ...; return short.length === 10 ? short + '…' : short;`. Alternatively, increase or remove the limit.

### `escapeHtml` does not escape double quotes
**Severity:** Medium
**Lines:** 2142–2143
`escapeHtml` escapes `&`, `<`, and `>` but not `"` (double quote) or `'` (single quote). This is safe for `textContent` and child-HTML contexts, but is insufficient for HTML attribute contexts where the value is delimited by double quotes (e.g. `alt="${escapeHtml(name)}"`). A value containing `"` would break the attribute. Scryfall card names can occasionally contain `"` (e.g. double quote as part of a name), which would be a real injection risk.
**Action:** Add `"` escaping: `.replace(/"/g, '&quot;')`. This is especially important given that `escapeHtml` is used in `alt` attributes throughout the render functions.

### `escapeQuotes` escapes `"` to `&quot;` — HTML entity, not JS-safe
**Severity:** Medium
**Lines:** 2145–2147
`escapeQuotes` replaces `"` with `&quot;` and `'` with `\'`. The `&quot;` replacement is appropriate for HTML attribute contexts (e.g. `alt="..."`), but in a JS string inside an HTML attribute (e.g. `onclick="func('${escapeQuotes(name)}')"`) the entity `&quot;` is decoded by the HTML parser before the JS engine sees it, so it becomes a literal `"` in the JS string context — which may still cause issues. The `\'` replacement handles single-quote JS string escaping. The two replacements target different contexts and mixing them in a single function is confusing.
**Action:** Split into two separate functions: `escapeForHtmlAttr(str)` (escapes `<>& "`) and `escapeForJsString(str)` (escapes `\ ' "`), and use the appropriate one per context.

### `toastTimer` is a module-level `let` variable
**Severity:** Low
**Lines:** 2149
`let toastTimer;` is declared at module scope. This is necessary for cross-call timer management but is an implicit global. It would be cleaner to encapsulate it within a `showToast` closure.
**Action:** Convert to an IIFE-enclosed variable or a WeakRef if toast is refactored, though this is low priority.

## Summary
The utilities section has two medium-severity issues: `escapeHtml` does not escape double quotes (making it incomplete for HTML attribute use), and `escapeQuotes` conflates two different escaping contexts (HTML entity vs JS string escaping). These foundational issues have downstream effects throughout the file wherever these functions are used.
