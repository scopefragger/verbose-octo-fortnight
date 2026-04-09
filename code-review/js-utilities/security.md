# Security Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` is incomplete for HTML attribute contexts — missing `"` escaping
**Severity:** High
**Lines:** 2142–2143
`escapeHtml(str)` escapes `&`, `<`, and `>` but not double quotes (`"`). This function is used in `alt` attribute values throughout the file (e.g., `alt="${escapeHtml(card.name)}"`). If a Scryfall card name contains a `"` character, the attribute will be broken and potentially allow attribute injection. For example, a name like `Grip "of" Chaos` would produce `alt="Grip "of" Chaos"` — closing the `alt` attribute early and allowing further attribute injection.
**Action:** Add `.replace(/"/g, '&quot;')` to `escapeHtml`. This is the most impactful security fix in the utilities section.

### `escapeQuotes` designed for `onclick` string embedding — partially safe
**Severity:** Medium
**Lines:** 2145–2147
As described in the static review, `escapeQuotes` produces `&quot;` for `"` (correct for HTML attribute contexts) but `\'` for `'` (correct for JS string escaping within single-quoted strings). This dual-context function works for the specific pattern `onclick="func('${escapeQuotes(val)}')"` but is documented only by its name, not its contract. A developer using it in a different context may apply it incorrectly.
**Action:** Add a JSDoc comment explaining the exact context this function is designed for, or split into dedicated functions.

### `showToast` uses `textContent` — correctly safe
**Severity:** Info
**Lines:** 2152
`el.textContent = msg` correctly uses `textContent` for the toast message, preventing XSS even if `msg` contains HTML special characters.
**Action:** No action required. This is correct.

## Summary
The highest-severity finding in the entire file: `escapeHtml` does not escape double quotes, making it insufficient for HTML attribute contexts where it is actively used. This should be fixed immediately. `escapeQuotes` has a mixed-context design that is functional but undocumented and fragile.
