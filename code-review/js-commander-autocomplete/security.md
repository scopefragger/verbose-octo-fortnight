# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `escapeQuotes` used in `onclick` attribute context — wrong escaping for HTML attributes
**Severity:** High
**Lines:** 2118
`onclick="selectCommander('${escapeQuotes(name)}', '${escapeQuotes(input.id)}', '${escapeQuotes(dropdown.id)}')"` uses `escapeQuotes`, which escapes `'` as `\'` and `"` as `&quot;`. This is the same misapplied escaping pattern flagged in the Graveyard Viewer (segment 21).

The outer attribute delimiter is `"`, so `"` inside the value must be escaped as `&quot;` (which `escapeQuotes` does). However, `'` is escaped as `\'` (a JS backslash-escape) rather than `&#39;` (an HTML entity). In HTML attribute context, `\'` is two literal characters — a backslash and a quote — which can break out of the JS string literal if the browser's HTML parser processes the attribute before the JS engine does.

Additionally, `escapeQuotes` does not escape `<`, `>`, or `\`, so a card name containing `</div onclick="` could be structured to break out of the attribute entirely. Since card names are sourced from the Scryfall API (a trusted source), current risk is low — but the pattern is fragile.

**Action:** Replace the inline onclick approach with a `data-` attribute and delegated event listener. Store the name as `data-name="${escapeHtml(name)}"` on the `.ac-item` element and read it in the delegated handler. This eliminates the JS-in-HTML injection surface entirely.

### `input.id` and `dropdown.id` embedded in `onclick` without escaping
**Severity:** Low
**Lines:** 2118
`input.id` and `dropdown.id` are element ID strings embedded into the `onclick` attribute. These IDs are set in the HTML markup and are not user-controlled, so the current risk is low. However, `escapeQuotes` is used on them rather than a proper HTML-attribute-safe escape function.
**Action:** Since element IDs are programmer-controlled constants, consider hardcoding the stateKey string in the onclick instead: pass the `stateKey` directly rather than the element IDs, and look up the IDs inside `selectCommander`.

### Scryfall API fetched over HTTPS — no risk
**Severity:** Low
**Lines:** 2102, 2109
Both Scryfall fetches use `https://api.scryfall.com`. No credentials or secrets are included in the request.
**Action:** No action required.

### `name` from Scryfall API used in `escapeHtml(name)` for visible text — correct
**Severity:** Low
**Lines:** 2120–2121
Card name and type strings from the Scryfall API are correctly escaped with `escapeHtml` before being placed in span content. This is the right pattern.
**Action:** No action required; preserve this pattern.

### Image URL from Scryfall inserted directly into `src` without scheme validation
**Severity:** Low
**Lines:** 2116, 2119
`card?.image_uris?.small` is inserted into `<img src="${img}">` without validating it is a safe `https://` URL. The risk is low while Scryfall data is trusted, but the pattern leaves room for exploitation if data sources change.
**Action:** Validate: `const safeImg = img && img.startsWith('https://') ? img : '';` before use in the template.

## Summary
The critical issue is the use of `escapeQuotes` for embedding card names as inline `onclick` JS string arguments — the same pattern flagged in segment 21. The correct fix is to move to `data-` attributes with a delegated event listener, eliminating the JS-in-HTML injection surface. Scryfall API traffic and visible-text escaping are correctly handled.
