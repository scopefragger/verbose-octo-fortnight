# Security Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `focus-actions` innerHTML built with `JSON.stringify(id)` — safe but brittle
**Severity:** Low
**Lines:** 1945–1952
`id` is serialised with `JSON.stringify(id)` before embedding in the `onclick` attribute. For a string UUID this is safe (produces a quoted string). However, if `id` ever contains characters like `</script>` or `"` outside the JSON context, and the serialisation strategy changes, this could become an XSS vector.
**Action:** This pattern is acceptable for now. Add a comment noting that `idStr` must remain a `JSON.stringify`-produced value (not raw string concatenation) to keep it safe.

### `idx` embedded raw in onclick without escaping (hand card actions)
**Severity:** Medium
**Lines:** 1988–1990
`idx` is a numeric array index embedded directly into `onclick="playHandCardFromFocus(${idx})"` and `onclick="discardFromHand(${idx});closeFocusPanel()"` without any escaping. While `idx` should always be an integer, its origin is `selectHandCard(idx)` which is itself called from rendered HTML elsewhere. If that call site ever passes a non-integer (e.g. from a corrupted deck state or a future refactor), an attacker who can influence deck data could inject arbitrary JS through the `idx` argument.
**Action:** Coerce `idx` to an integer: `const safeIdx = parseInt(idx, 10);` and use `safeIdx` in the template. Validate it is a finite non-negative number before proceeding.

### Card text content set via `.textContent` — correct and safe
**Severity:** Low
**Lines:** 1939–1942, 1978–1981
All card text fields (`name`, `mana_cost`, `type_line`, `oracle_text`) are written using `.textContent`, which is safe against XSS. No action needed.
**Action:** No action required; note this as a positive pattern to preserve if the section is refactored.

### No Content Security Policy enforcement visible
**Severity:** Low
**Lines:** 1946–1952, 1986–1991
The entire focus-actions block uses inline `onclick` attributes, which require `'unsafe-inline'` in any CSP script-src directive. This is an existing design constraint of the file.
**Action:** Track as known debt. If a CSP is ever introduced, these inline handlers will need to be replaced with `addEventListener` calls using closure-captured data.

## Summary
The primary security concern is the raw `idx` integer embedded in `onclick` strings; it should be explicitly coerced and validated. The `JSON.stringify(id)` approach for the battlefield card ID is sound. All card data is correctly inserted via `.textContent`, preventing XSS from Scryfall API responses.
