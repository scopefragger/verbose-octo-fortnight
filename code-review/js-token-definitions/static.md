# Static Code Review — js-token-definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `power` and `toughness` stored as strings, not numbers
**Severity:** Low
**Lines:** 1648–1661
All power/toughness values are string literals (e.g., `'1'`, `'5'`) while artifact tokens use `null`. This mixed representation (string vs. null) means downstream code must handle both types. If any code does arithmetic on these values (e.g., applying +1/+1 counters), string concatenation bugs could occur.
**Action:** Store numeric power/toughness as integers (e.g., `power: 1, toughness: 1`) and use `null` for non-creature tokens. Update any rendering code that displays these values to handle the type consistently.

### `keywords` field is absent on most tokens
**Severity:** Low
**Lines:** 1648–1661
Some tokens have a `keywords` array (e.g., `['Flying']`), while most have no `keywords` field at all. Code consuming these tokens must defensively check `token.keywords?.length` or similar, rather than relying on a consistent schema.
**Action:** Add `keywords: []` to every token definition without keywords to ensure a consistent schema.

## Summary
The data is correct and readable, but has two minor consistency issues: power/toughness types (string vs. null) and the optional `keywords` field. Standardising these would prevent defensive coding requirements in all consumers.
