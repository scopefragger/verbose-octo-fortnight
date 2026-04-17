# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `name` passed through `escapeQuotes()` into single-quoted `onclick` — backslash not escaped
**Severity:** High
**Lines:** 2118
The dropdown item onclick is built as:
`onclick="selectCommander('${escapeQuotes(name)}', '${escapeQuotes(input.id)}', '${escapeQuotes(dropdown.id)}')"` 

`escapeQuotes()` escapes `'` → `\'` and `"` → `&quot;` but does **not** escape backslashes (`\`). Card names from Scryfall are unlikely to contain backslashes, but if Scryfall ever returned a name containing `\` (or a network intermediary injected data), a value like `foo\` would produce `foo\'` in the attribute, where `\'` is interpreted as an escaped backslash followed by an unescaped single quote — breaking out of the JS string.

More practically, `input.id` and `dropdown.id` are hard-coded element IDs (`'commander-input'`, `'commander-dropdown'`, etc.) that contain only safe alphanumeric/hyphen characters. The `name` argument is the only variable value and comes from the Scryfall API.
**Action:** Use `escapeHtml()` on `name` and switch to a double-quoted JS argument delimited by `&quot;`: `onclick="selectCommander(&quot;${escapeHtml(name)}&quot;, ..."`. Better: store `name` in a `data-name` attribute and handle the click via a delegated listener.

### `encodeURIComponent(q)` used for Scryfall API query — correct
**Severity:** Low
**Lines:** 2102, 2109
Both Scryfall fetch calls properly use `encodeURIComponent()` for user-supplied input. This prevents URL injection.
**Action:** No action needed — positive finding.

### Scryfall response `json.data` used without validating it is an array
**Severity:** Low
**Lines:** 2104
`(json.data || [])` provides a safe fallback if `json.data` is falsy, but if `json.data` is a non-array (e.g. a string or object due to an unexpected API response shape), `.slice()` will throw. This is an edge case for a well-behaved external API but worth guarding.
**Action:** Add an `Array.isArray` check: `const names = Array.isArray(json.data) ? json.data.slice(0, 8) : [];`.

### `escapeHtml(name)` and `escapeHtml(type)` used correctly for display text in innerHTML
**Severity:** Low
**Lines:** 2120–2121
Card name and type text injected into dropdown item innerHTML are wrapped in `escapeHtml()`. This correctly prevents XSS in the display portion of the dropdown.
**Action:** No action needed — positive finding.

### `img src` populated with Scryfall-sourced URLs without validation
**Severity:** Low
**Lines:** 2116, 2119
Preview image URLs come from Scryfall API responses. Same low-risk pattern as noted in other sections — trusted HTTPS source, `img src` cannot execute scripts.
**Action:** No action needed; document trust assumption.

### `input.id` and `dropdown.id` passed through `escapeQuotes()` and into onclick
**Severity:** Low
**Lines:** 2118
`input.id` and `dropdown.id` are element IDs set by the static HTML (`'commander-input'`, `'commander-dropdown'`, etc.) — they contain only alphanumeric characters and hyphens, so `escapeQuotes()` is unnecessary but harmless for these values.
**Action:** No immediate security action. Consider passing `stateKey` instead of element IDs to avoid the round-trip ID lookup in `selectCommander`.

## Summary
The primary security concern is the same `escapeQuotes()` + single-quoted onclick pattern flagged in the Graveyard Viewer and Token Modal reviews — backslashes in API-sourced card names are not escaped. For Scryfall data specifically the risk is low (card names don't contain backslashes), but the structural vulnerability is real. Switching to `data-` attributes and a delegated listener would resolve the entire class of issue.
