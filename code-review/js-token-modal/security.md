# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `JSON.stringify(t)` passed through `escapeHtml()` then injected into `onclick` — incomplete escaping
**Severity:** High
**Lines:** 2029
The preset button is built as:
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"`

`escapeHtml()` (line 2143) escapes `&`, `<`, and `>` but does **not** escape single quotes (`'`) or double quotes (`"`). `JSON.stringify` produces a string like:
`{"name":"1/1 Soldier","power":"1","toughness":"1","type_line":"Token Creature — Soldier","colors":["W"]}`

This string contains double quotes (`"`). When placed inside the `onclick="..."` HTML attribute:
- The first `"` after `addToken(` will terminate the `onclick` attribute prematurely.
- What follows becomes free HTML text or a new attribute, breaking the button's behaviour.

In practice, `COMMON_TOKENS` contains no token names with `"` so the buttons happen to render correctly — but the pattern is fundamentally broken for any token with a double-quote in its data. `escapeHtml` converts `"` to `&quot;` when it appears in the JSON — actually `escapeHtml` does NOT escape `"` (its pattern only handles `&`, `<`, `>`), so the raw `"` leaks into the attribute.

**Action:** Use `escapeQuotes()` (already available, line 2145) which converts `"` to `&quot;`, or better: store token indices in `data-index` attributes and look up the token in a delegated event handler, eliminating inline JSON entirely.

### Token name injected into button text without `escapeHtml()`
**Severity:** Medium
**Lines:** 2029
`${t.name}${fly}` is injected as button inner HTML without escaping. For the current hard-coded `COMMON_TOKENS` data this is safe, but if `COMMON_TOKENS` is ever made configurable or extended with user-supplied names, this becomes an XSS vector.
**Action:** Wrap with `escapeHtml()`: `${escapeHtml(t.name)}${fly}`.

### `addToken()` accepts arbitrary `tokenData` objects — no schema validation
**Severity:** Low
**Lines:** 1843–1847
`addToken(tokenData)` pushes the caller-supplied object directly onto `playBattlefield` without validating its shape. When called from the preset buttons via the broken inline-JSON pattern above, the parsed object is uncontrolled. If the JSON is ever malformed or injected, unexpected properties could be added to battlefield state.
**Action:** Validate `tokenData` against the expected schema (at minimum: `name` is a non-empty string, `colors` is an array) before pushing to `playBattlefield`.

## Summary
The most significant security issue is the use of `escapeHtml()` to sanitise a JSON object injected into an `onclick` attribute — `escapeHtml` does not escape double quotes, meaning the attribute is silently broken by the raw `"` characters in the JSON. For the current hard-coded token data this appears to work only because browsers are lenient with attribute parsing, but it is structurally unsound. Switching to `data-` attributes and a delegated handler is the correct fix.
