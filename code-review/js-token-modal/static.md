# Static Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` in onclick — incorrect use of `escapeHtml`
**Severity:** High
**Lines:** 2029
`JSON.stringify(t)` produces a JSON string containing double quotes. Passing this through `escapeHtml()` converts `"` to `&quot;`, which would produce an invalid JSON string when the browser evaluates the `onclick` attribute. The resulting call to `addToken(...)` would receive a malformed argument and likely parse to `undefined` or throw a `SyntaxError`.
**Action:** Use `escapeQuotes(JSON.stringify(t))` (which escapes single quotes for the HTML attribute context) instead of `escapeHtml`. The onclick attribute uses single quotes as delimiters in the HTML, so the JSON's double quotes are safe in the attribute, but the JSON must not contain unescaped single quotes. Alternatively, avoid inline JSON passing entirely: assign each token a numeric index and call `addToken(COMMON_TOKENS[${i}])` using the index.

### `closeTokenModal` only closes if the click target is the overlay itself
**Severity:** Low
**Lines:** 2034–2037
The modal closes only when clicking the backdrop element directly (`e.target === document.getElementById('token-modal')`). Clicking on child elements of the modal (preset buttons, custom form) will not close it, which is the correct behavior. However, the function name `closeTokenModal` implies it always closes, but it is conditional.
**Action:** Rename to `maybeCloseTokenModal` or `tokenModalBackdropClick` to clarify the conditional nature, or add an unconditional `closeTokenModal()` function for programmatic closing (e.g. after adding a token at line 1846).

### `addToken` at line 1843 uses `Date.now() + Math.random()` for IDs
**Severity:** Low
**Lines:** 1844
ID generation combines `Date.now()` and `Math.random()`, which gives floating-point IDs. These are used as `===` keys (`playBattlefield.find(c => c.id === id)`) and passed through `JSON.stringify(bfc.id)` in onclick. Floating-point IDs serialized to JSON produce strings like `1713000000000.123456789`, which are valid but visually unusual. There is a (very small) collision risk between cards added in the same millisecond.
**Action:** Use `Date.now() * 1000 + Math.floor(Math.random() * 1000)` for integer IDs, or use a simple incrementing counter.

### `addCustomToken` does not validate that power is present when toughness is provided
**Severity:** Low
**Lines:** 1849–1856
A user could enter a toughness without a power value, producing a token with `power: null, toughness: '5'`. This inconsistency would pass through to `bfCardHTML`, where the power/toughness display (`bfc.card.power != null`) would hide the stat line (since `power === null`), silently discarding the entered toughness.
**Action:** Add validation: if either power or toughness is provided, require both. Show a validation error if they are inconsistent.

## Summary
The most critical bug is the incorrect use of `escapeHtml(JSON.stringify(t))` in the onclick attribute, which will produce broken JSON and cause `addToken` to fail for preset tokens. This is a functional bug, not just a style issue.
