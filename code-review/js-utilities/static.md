# Static Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` does not escape double quotes
**Severity:** Medium
**Lines:** 2142–2144
```js
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
```
`"` is not escaped. This is safe for HTML text-node content but **not** safe for HTML attribute values delimited by double quotes. The function is used in `alt="${escapeHtml(card.name)}"` throughout the file — if a card name contains `"`, the attribute string breaks (e.g., `alt=""Thing in the Ice""`).

Scryfall card names rarely contain double quotes, making this a low-probability but real vulnerability. A function named `escapeHtml` implies full HTML escaping.
**Action:** Either add `"` → `&quot;` escaping: `.replace(/"/g,'&quot;')`, and document this. Or create a dedicated `escapeAttr` for attribute contexts and restrict `escapeHtml` to text-node use only (with a clarifying comment).

## Summary
Compact, essential utilities. The primary static issue is `escapeHtml` not escaping `"` — making it incomplete for attribute-value contexts where it is already used throughout the file.
