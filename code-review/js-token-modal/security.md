# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml` is the wrong escaper for an `onclick` JS argument
**Severity:** High
**Lines:** 2029
The code uses `escapeHtml(JSON.stringify(t))` to embed a JSON object as a JavaScript argument inside an `onclick` attribute:

```js
onclick="addToken(${escapeHtml(JSON.stringify(t))})"
```

`escapeHtml` replaces `&`, `<`, and `>` with HTML entities — it does **not** escape single quotes (`'`) or backslashes (`\`). Inside an `onclick` attribute delimited by double quotes, a value containing `"` (double-quote) in any token property (e.g., a token name like `2" Creature`) would break out of the attribute and allow arbitrary HTML/JS injection. JSON strings use `"` as string delimiters, so `JSON.stringify` will produce double-quote characters that are not escaped by `escapeHtml`.

While `COMMON_TOKENS` is currently a hard-coded constant with safe values, this pattern is architecturally unsafe and contradicts the project's own rule ("IDs passed as JS string arguments must be `esc()`-wrapped").

**Action:** Replace the inline `onclick` pattern entirely. Assign a `data-index` attribute to each button and attach a single delegated event listener (or use individual `addEventListener` calls after rendering). Example safe pattern:
```js
return `<button class="token-preset-btn" data-token-index="${i}">${escapeHtml(t.name)}${fly}</button>`;
```
Then in a post-render loop:
```js
presets.querySelectorAll('.token-preset-btn').forEach((btn, i) => {
  btn.addEventListener('click', () => addToken(COMMON_TOKENS[i]));
});
```
This eliminates all serialisation/escaping risk entirely.

### `t.name` unescaped in button text
**Severity:** Low
**Lines:** 2029
As noted in the Static review, `t.name` is interpolated directly as innerHTML text. If a future token's name contained `<script>` or similar, it would execute.
**Action:** Wrap with `escapeHtml(t.name)`.

## Summary
The critical security issue is the misuse of `escapeHtml` to escape a JSON string that is injected as a JavaScript argument inside an `onclick` attribute. This escaper is HTML-entity-focused and does not prevent JS injection via unescaped double-quotes in the serialised JSON. The project's own CLAUDE.md guidelines call for proper escaping of `onclick` arguments; this code violates that guideline and should be refactored to use event listeners rather than inline handlers with serialised objects.
