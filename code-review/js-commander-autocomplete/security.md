# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `escapeQuotes(name)` in onclick attribute — insufficient for full XSS protection
**Severity:** High
**Lines:** 2118
The onclick attribute is constructed as:
`onclick="selectCommander('${escapeQuotes(name)}', '${escapeQuotes(input.id)}', '${escapeQuotes(dropdown.id)}')"`.
`escapeQuotes` only escapes single quotes. Card names from Scryfall can contain characters like `"`, `\`, and `)` which could interact with the HTML/JS parsing context. A particularly crafted card name containing `\')` could terminate the function call and inject arbitrary JS.
For example, a name like `Evil\', alert(1), '` would produce: `onclick="selectCommander('Evil\', alert(1), ''...)"`, which executes `alert(1)`. While Scryfall is a trusted source, this pattern is fragile and should use `JSON.stringify`.
**Action:** Replace `escapeQuotes(name)` with `JSON.stringify(name)` in the onclick template, removing the surrounding single quotes: `onclick="selectCommander(${JSON.stringify(name)}, ${JSON.stringify(input.id)}, ${JSON.stringify(dropdown.id)})"`.

### `input.id` and `dropdown.id` embedded in onclick — safe for current element IDs
**Severity:** Low
**Lines:** 2118
`input.id` and `dropdown.id` are element IDs set by the developer in HTML (e.g. `commander-input`, `commander-dropdown`). They cannot contain characters that would break the onclick attribute in the current HTML. However, `escapeQuotes` is applied to them as if they could be user-controlled, which suggests the author was aware of the injection risk. Using `JSON.stringify` would be more robust.
**Action:** Apply the same `JSON.stringify` fix from the finding above to cover all three onclick arguments.

### `escapeHtml(name)` correctly used for the displayed card name in innerHTML
**Severity:** Info
**Lines:** 2120
`${escapeHtml(name)}` is correctly applied for the name rendered in the `.ac-item-name` span. Good use of escaping.
**Action:** No change required.

### `escapeHtml(type)` correctly used for the card type in innerHTML
**Severity:** Info
**Lines:** 2121
`${escapeHtml(type)}` is correctly applied for the type extracted from `card.type_line`. Good.
**Action:** No change required.

### External Scryfall API calls with user input
**Severity:** Low
**Lines:** 2102, 2109
User-typed search queries are sent to `https://api.scryfall.com/...` with `encodeURIComponent(q)` and `encodeURIComponent(name)`. `encodeURIComponent` correctly prevents URL injection. No server-side secrets are exposed in these requests.
**Action:** No change required. Document that Scryfall is a trusted read-only API endpoint.

## Summary
The critical security finding is the use of `escapeQuotes` for embedding Scryfall card names in onclick attribute strings. This is insufficient: card names that contain backslash or other escape sequences could break the JS string context. Replacing with `JSON.stringify` is the correct fix and is straightforward to apply.
