# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### XSS via `onclick` attribute with `escapeQuotes` only
**Severity:** High
**Lines:** 2118
Card names from the Scryfall API are embedded directly into an `onclick` attribute as JS string literals, protected only by `escapeQuotes()`. If `escapeQuotes` only escapes single/double quotes (common implementation), a card name containing a backtick, `</script>`, or an HTML entity could break out of the string context or the attribute context.
**Action:** Never embed untrusted data in inline event handlers. Instead assign a `data-name`, `data-input-id`, and `data-dropdown-id` attribute to each `.ac-item` element and attach a single delegated `click` listener on `dropdown` that reads those attributes. This completely eliminates the injection surface.

### Unvalidated `img` URL from external API inserted into `src`
**Severity:** Low
**Lines:** 2119
`card?.image_uris?.small` comes from an untrusted third-party API response and is injected into an `<img src="...">` attribute without sanitisation. A compromised or spoofed Scryfall response could point `src` at an arbitrary URL (tracking pixel, SSRF in some environments, or phishing image).
**Action:** Validate that the URL starts with `https://cards.scryfall.io/` (the known CDN prefix) before inserting it. Reject and use the empty fallback otherwise.

### Unvalidated `type_line` from external API inserted via `escapeHtml`
**Severity:** Low
**Lines:** 2117, 2121
`card?.type_line` is inserted using `escapeHtml`, which is correct for text content. Confirm that `escapeHtml` encodes `<`, `>`, `"`, `'`, and `&`. If it only encodes `<` and `>`, attribute-context injection remains possible.
**Action:** Verify `escapeHtml` covers all five characters. If not, strengthen it or use `textContent` assignment instead of innerHTML interpolation.

### Global `document` click listener leaks on repeated `setupAutocomplete` calls
**Severity:** Low
**Lines:** 2093–2097
Each call to `setupAutocomplete` registers a new global `document` click listener. If `setupAutocomplete` is ever called more than once for the same pair of elements (e.g. after a UI reset), listeners accumulate and fire multiple times, potentially causing unexpected hide/show behaviour and small memory leaks.
**Action:** Store the listener reference and remove it before re-adding, or guard with a flag on the element (`input.dataset.acSetup`).

## Summary
The most serious issue is the XSS vector via card names in inline `onclick` handlers — switching to `data-*` attributes and a delegated listener eliminates this entirely. Image URL validation and review of `escapeHtml` coverage are secondary hardening steps.
