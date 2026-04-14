# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Scryfall API URL built with `encodeURIComponent` — correct
**Severity:** Low
**Lines:** 2102, 2109
Both `fetch` calls use `encodeURIComponent(q)` and `encodeURIComponent(name)` to build the Scryfall URL. This correctly prevents URL injection. No issue.
**Action:** No action needed.

### `escapeQuotes` used in `onclick` attribute for `name` and element IDs
**Severity:** Medium
**Lines:** 2118
`onclick="selectCommander('${escapeQuotes(name)}', '${escapeQuotes(input.id)}', '${escapeQuotes(dropdown.id)}')"` — three values are embedded in a single-quote-delimited JS function call inside an HTML attribute. `escapeQuotes` replaces `'` with `\'`, which is not a valid HTML character escape. If a Scryfall card name contains a backslash followed by a quote (unlikely but possible in theory), or if the HTML attribute value is processed by a parser that does not treat `\'` as an escaped quote, the onclick would be malformed.

`input.id` and `dropdown.id` are developer-controlled element IDs and safe, but `name` comes from Scryfall API data and could theoretically contain quotes or backslashes.
**Action:** Use `JSON.stringify(name)` instead of `'${escapeQuotes(name)}'` so the card name is safely encoded as a JSON string regardless of its contents.

### Card preview images from Scryfall injected into `<img src>`
**Severity:** Low
**Lines:** 2116, 2119
`card?.image_uris?.small` URLs are injected directly into `<img src="...">`. As noted in previous segments, these should be validated to start with `https://` before injection.
**Action:** Add URL validation: only inject the `src` if `img.startsWith('https://')`.

### `escapeHtml` correctly used for `name` and `type` in dropdown item text
**Severity:** Low
**Lines:** 2120–2121
`escapeHtml(name)` and `escapeHtml(type)` are correctly applied before innerHTML injection. Good practice.
**Action:** No action needed.

## Summary
The main security concern mirrors the graveyard viewer: `escapeQuotes` is used to embed API-sourced card names in onclick attributes, which is not a reliable HTML/JS escaping method. `JSON.stringify` should be used instead. All query parameters are correctly encoded with `encodeURIComponent`.
