# Static Review — js-token-definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `keywords` field absent on non-keyword tokens
**Severity:** Medium
**Lines:** 1648–1662
Tokens with keywords (Spirit, Faerie, Dragon, Thopter) include `keywords: ['Flying']`, but tokens without keywords omit the field entirely rather than setting `keywords: []`. Any consumer that accesses `token.keywords.length` without an optional chain or nullish coalescing will throw a TypeError on the majority of tokens.
**Action:** Add `keywords: []` to every token object that lacks the field, or ensure all call sites use `(token.keywords || [])`.

### No `id` field on token definitions
**Severity:** Low
**Lines:** 1647–1662
Token definitions have no stable identifier. When placed on the battlefield, multiple instances of the same token type need to be distinguishable. If battlefield placement relies on generating an id at insertion time, this is fine — but it should be confirmed that `playCardToBattlefield` (or equivalent) generates unique ids for each placed token instance.
**Action:** Verify the token-placement code generates a unique id per instance (e.g., `Date.now()` or a counter). Document this here with a comment if so.

## Summary
Compact, well-formatted data constant. The main risk is the inconsistent `keywords` field presence — tokens without keywords omit the field, which is a latent crash source in consuming code.
