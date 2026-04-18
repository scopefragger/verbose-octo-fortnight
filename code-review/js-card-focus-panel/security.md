# Security Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `card.mana_cost` injected into innerHTML button text unescaped
**Severity:** Medium
**Lines:** 1983, 1987
```js
const playLabel = isLand ? '▶ Play Land' : `▶ Play ${card.mana_cost || ''}`;
// ...
<button ...>${playLabel}</button>
```
`card.mana_cost` from Scryfall uses `{W}`, `{2}`, etc. — these curly braces are safe in HTML. However, the value is not passed through `escapeHtml()`. If a manipulated API response or cached value contained `<script>` or other HTML, it would be injected. All other card text in this function (`name`, `type_line`, `oracle_text`) is correctly set via `textContent`, making this inconsistency stand out.
**Action:** Apply `escapeHtml()`: `` `▶ Play ${escapeHtml(card.mana_cost || '')}` ``.

### `idStr` in onclick attributes is safe but pattern is fragile
**Severity:** Low
**Lines:** 1947–1951
`JSON.stringify(id)` is used to safely embed the card ID in onclick attribute strings. For numeric IDs this produces a bare number; for string UUIDs it produces a quoted string with proper JSON escaping. This is correct today, but the pattern relies on the id type never including characters that JSON doesn't escape (e.g., HTML angle brackets). No action required if IDs remain numbers or UUIDs — note this as a pattern dependency.
**Action:** Document with a comment: `// JSON.stringify ensures safe embedding of id regardless of numeric vs. string type`.

## Summary
One medium-severity issue: `card.mana_cost` is not escaped before insertion into innerHTML. While Scryfall mana costs are safe in practice, consistency with the project's `escapeHtml()` convention requires it to be wrapped.
