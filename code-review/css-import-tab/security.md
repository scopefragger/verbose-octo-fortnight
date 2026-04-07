# Security Review — Import Tab
Lines: 145–256 | File: public/mtg-commander.html

## Findings

### Inline `onclick` attributes using string-interpolated external data
**Severity:** Medium
**Lines:** 2118 (companion JS — `fetchSuggestions` writes HTML that is the direct runtime output of the CSS/HTML UI defined in this segment)
The autocomplete dropdown is populated via `dropdown.innerHTML = names.map(...)` where each item's `onclick` attribute is built by interpolating a Scryfall card name through `escapeQuotes()`. Although Scryfall names are currently well-behaved, any future use of this pattern with less-trusted data sources, or a Scryfall data anomaly, could produce attribute injection. Specifically: `escapeQuotes` does not escape backslashes, so a name like `Foo\'s Bar` would produce `Foo\\'s Bar` in the attribute, yielding a JS syntax error or unexpected behaviour.
**Action:** Replace the `onclick="selectCommander('...')"` string interpolation pattern with a `data-name` attribute and a delegated `addEventListener('click', ...)` on the dropdown container. This eliminates the entire class of attribute-injection risk.

### User-controlled deck name rendered via `textContent`, not `innerHTML` — safe
**Severity:** Low (informational — no issue)
**Lines:** 1165, 1167
`deck-status` is updated via `.textContent` and `showToast` uses `.textContent`, so the deck name from `deck-name-input` is not an XSS vector. This is the correct pattern.
**Action:** No action required; noted as a positive finding.

### `img src` from Scryfall set without integrity check
**Severity:** Low
**Lines:** 2119 (companion JS)
Card thumbnail URLs are taken directly from the Scryfall API response and placed into `<img src="...">`. If a network MITM or a compromised Scryfall response substituted a different URL, arbitrary external images could be loaded. No `Content-Security-Policy` `img-src` restriction is visible in the HTML head.
**Action:** Consider adding a CSP header on the server (`img-src https://cards.scryfall.io https://c1.scryfall.com`) to constrain which origins images may load from. This is defence-in-depth rather than a critical fix.

## Summary
The primary security concern is the inline-`onclick`-with-string-interpolation pattern in the autocomplete dropdown renderer: while currently safe due to Scryfall data predictability and partial escaping, it is structurally fragile. Moving to a `data-*` + delegated listener approach would eliminate the risk entirely. No secrets or auth bypass issues exist within this CSS/HTML segment.
