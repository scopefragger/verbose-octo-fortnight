# Security Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `card.mana_cost` injected into button label without escaping
**Severity:** Medium
**Lines:** 1983, 1987–1988
The play button label is constructed as `` `▶ Play ${card.mana_cost || ''}` `` and then injected as the `innerHTML` content of the `focus-actions` element. `card.mana_cost` comes from Scryfall API data (e.g. `{2}{R}{G}`), but for custom tokens it may not have a mana cost (handled by the `|| ''` fallback). However, if `card.mana_cost` contains `<`, `>`, or `&` characters (which Scryfall mana cost strings can contain as `{` and `}` — not dangerous — but future custom cost strings could), this is an XSS vector.
**Action:** Use `escapeHtml(card.mana_cost || '')` in the play button label, and ensure `formatManaCostShort` output is also escaped if used in innerHTML context.

### `onclick` attributes with `JSON.stringify(id)` — correctly safe for numeric IDs
**Severity:** Low
**Lines:** 1945, 1947–1951
`idStr = JSON.stringify(id)` is used to embed the battlefield card ID in onclick attributes. For numeric IDs this produces a safe integer literal. For string IDs (e.g. UUIDs), `JSON.stringify` produces a double-quoted string, which is safe in the `onclick` attribute context. This is the correct pattern.
**Action:** No change required. Confirm that `id` values are generated internally and never user-supplied to prevent prototype pollution.

### `card.name`, `card.mana_cost`, `card.type_line`, `card.oracle_text` set via `textContent`
**Severity:** Info
**Lines:** 1939–1942, 1978–1981
These fields are all set via `.textContent =` (not innerHTML), so they are inherently XSS-safe regardless of content. This is the correct pattern for text-only fields.
**Action:** No change required. Good use of `textContent`.

### `playTitle` attribute value not escaped
**Severity:** Medium
**Lines:** 1985, 1987
`playTitle` is conditionally set to `title="Not enough mana"` (a hardcoded string), so there is no immediate XSS risk. However, if the title were ever constructed from user data, injecting `"` into an attribute value without escaping could break the HTML. The current usage is safe but sets a fragile pattern.
**Action:** For consistency, use proper attribute construction (e.g. set the `title` attribute via JS after innerHTML is set) rather than embedding attribute strings in template literals.

## Summary
The most significant security concern is `card.mana_cost` being rendered unescaped as innerHTML content in the button label. For Scryfall data this is low risk but for custom cards it is a real XSS vector. Fields displayed via `textContent` are correctly safe. The onclick parameter pattern with `JSON.stringify` is correctly implemented.
