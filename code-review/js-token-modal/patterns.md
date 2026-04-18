# Patterns Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unusual JSON-in-onclick embedding pattern
**Severity:** Medium
**Lines:** 2029
`escapeHtml(JSON.stringify(t))` to embed a full object in an `onclick` attribute is an uncommon pattern that requires knowledge of how HTML attribute decoding interacts with JS evaluation. The rest of the file uses simple scalar values in onclick attributes (IDs, indexes). This inconsistency makes the code harder to read and maintain.
**Action:** Use `onclick="addToken(COMMON_TOKENS[${i}])"` — the index-based approach is simpler, self-documenting, and consistent with the rest of the file's onclick patterns.

### Dead variable `pt` silently omits P/T from button labels
**Severity:** Medium
**Lines:** 2027
The power/toughness string is computed but not displayed. Token preset buttons show only the name (e.g., "1/1 Soldier ✈") — the "1/1" is part of the name string itself, not from `pt`. If a future token is added with a generic name (e.g., "Spirit Token"), users cannot distinguish it from a differently-sized Spirit by the button alone.
**Action:** Either include `pt` in the label, or remove the variable to avoid confusion.

## Summary
Two medium-severity pattern issues: the JSON-in-onclick embedding is an unusual fragile pattern that should use array indexing instead, and the `pt` variable is computed but unused, creating a confusing false impression of where P/T display comes from.
