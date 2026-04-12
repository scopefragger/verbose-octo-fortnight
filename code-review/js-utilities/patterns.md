# Patterns Review — JS Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Toast dismiss timeout (3000 ms) is a magic number
**Severity:** Low
**Lines:** 2155
The value `3000` (milliseconds) is hardcoded directly in the `setTimeout` call with no constant or comment explaining its purpose. If the dismiss delay needs to change, a developer must know to look here.
**Action:** Extract to a named constant at the top of the JS section: `const TOAST_DURATION_MS = 3000;` and reference it in the `setTimeout` call.

### `escapeHtml` only encodes three characters — may be incomplete for some contexts
**Severity:** Low
**Lines:** 2142–2144
The function encodes `&`, `<`, and `>` — sufficient for safe text content insertion and most attribute contexts. However, it does not encode `"` or `'`, which matters when the output is placed inside a quoted HTML attribute (e.g. `alt="${escapeHtml(card.name)}"`). In practice, card names from Scryfall are unlikely to contain raw quotes, but the function's contract is narrower than developers may expect.
**Action:** Add a brief JSDoc comment documenting the intended use-case:
```js
/** Safe for text content and attribute values that are delimited by the opposite quote.
 *  Does NOT escape quotes — use escapeForJsString() for JS string contexts. */
```
Optionally extend to encode `"` as `&quot;` to make it safe for double-quoted attribute values universally.

### `escapeQuotes` name is misleading
**Severity:** Low
**Lines:** 2145–2147
The function name implies it escapes quotes generically, but it actually performs two different operations (backslash-escape for `'`, entity-encode for `"`). The inconsistency makes the function's output hard to reason about without reading the implementation.
**Action:** Once the mixed-encoding bug is fixed (see static/security reviews), rename to `escapeForJsString` or `escapeForOnclick` to communicate intent clearly.

### `showToast` sets `el.className` directly, which is fragile
**Severity:** Low
**Lines:** 2153
`el.className = 'toast show' + ...` overwrites any additional classes that might be applied to the element. This is a common source of subtle bugs if the HTML template ever adds a permanent class to the toast element. The standard pattern for toggling state classes is `classList.add`/`classList.remove`/`classList.toggle`.
**Action:** Replace the className assignment with classList manipulation:
```js
el.classList.remove('show', 'error');
el.classList.add('show');
if (isError) el.classList.add('error');
```
And in the timeout callback: `el.classList.remove('show', 'error');`

### Comment `// === UTILS ===` style is inconsistent with rest of file
**Severity:** Low
**Lines:** 2141
The section comment uses `// === UTILS ===` (title-cased, two `=` on each side). Checking other section dividers in the file — they use the same style — so this is actually consistent. No change needed.
**Action:** No action required.

## Summary
The utilities block follows the file's established patterns well. The main pattern-level improvements are extracting the magic timeout constant, making `showToast` use `classList` for resilience, and adding JSDoc to clarify the encoding contracts of `escapeHtml` and `escapeQuotes`. These are low-effort, high-readability wins.
