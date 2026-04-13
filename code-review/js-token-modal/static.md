# Static Code Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `showTokenModal` passes `escapeHtml(JSON.stringify(t))` to `addToken` via onclick
**Severity:** High
**Lines:** 2029
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"` attempts to pass a serialized token object as an inline JavaScript function argument. `escapeHtml()` converts `<`, `>`, `&`, and `"` to HTML entities, but `JSON.stringify` produces a string that gets entity-encoded. When the browser parses the `onclick` attribute, it will HTML-decode the entities before executing the JavaScript, so the actual JSON will contain unescaped `"` characters — making the JavaScript syntax invalid. Additionally, token names or type lines containing single quotes would break the JS evaluation.
**Action:** Store token data in a `data-token-index` attribute and look up `COMMON_TOKENS[i]` in `addToken(i)`, passing only the index rather than the serialized object.

### `closeTokenModal` only closes on backdrop click, not Escape key
**Severity:** Low
**Lines:** 2034–2037
The modal can be dismissed by clicking the backdrop (`e.target === document.getElementById('token-modal')`), but there is no keyboard handler for the Escape key. Other modals in the codebase should be checked for consistency.
**Action:** Add a `keydown` listener for `'Escape'` to close the modal, or add a dedicated close button.

### `showTokenModal` rebuilds preset buttons on every open
**Severity:** Low
**Lines:** 2025–2030
The token preset buttons are regenerated on every call to `showTokenModal()`. Since `COMMON_TOKENS` never changes, this is unnecessary work.
**Action:** Generate the preset buttons once at startup and cache the result, or populate them at initialization rather than on-demand.

## Summary
The critical issue is the broken `onclick` pattern on line 2029: passing `escapeHtml(JSON.stringify(t))` as an inline JS argument will produce invalid JavaScript due to HTML entity encoding. This should be replaced immediately with an index-based lookup.
