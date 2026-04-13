# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `selectCommander` onclick uses `escapeQuotes(name)` — insufficient for all card names
**Severity:** Medium
**Lines:** 2118
`onclick="selectCommander('${escapeQuotes(name)}', '${escapeQuotes(input.id)}', '${escapeQuotes(dropdown.id)}')"` — `escapeQuotes` replaces `'` with `\'` and `"` with `&quot;`. This is inserted into an HTML attribute that contains JavaScript. A card name containing a backslash followed by a single quote (e.g., hypothetically `Rogue's\' Passage`) could bypass the escaping. While real Scryfall card names do not currently contain backslashes, the pattern is fragile.
**Action:** Use `data-name` and `data-input-id` attributes on the dropdown item element, and attach the click handler via JavaScript instead of inline onclick. This eliminates the entire encoding problem.

### `escapeHtml(name)` and `escapeHtml(type)` used correctly in display text
**Severity:** Low
**Lines:** 2120–2121
`escapeHtml(name)` and `escapeHtml(type)` are correctly used for display text in the dropdown items. No XSS risk for displayed text.
**Action:** No change needed here.

### Scryfall API responses are trusted without validation
**Severity:** Low
**Lines:** 2102–2103
`const json = await res.json(); const names = (json.data || []).slice(0, 8);` — the Scryfall response is used directly. While Scryfall is a trusted third-party API, any MITM or supply-chain compromise could inject malicious data. The `escapeHtml` and `escapeQuotes` calls protect against most injection vectors, but the `src` attribute on images is unvalidated.
**Action:** Validate image URLs start with `https://` before assigning to `src` attributes.

### Direct `fetch` to Scryfall from the client exposes the user's IP to a third party
**Severity:** Low
**Lines:** 2102, 2109
Scryfall API calls are made directly from the browser. This is standard practice for Scryfall integrations (they encourage it) but means the user's IP address is visible to Scryfall.
**Action:** Acceptable for this use case. Document as a known privacy consideration.

## Summary
The main security concern is the `escapeQuotes` approach for card names in onclick attributes, which is theoretically bypassable with backslash-containing names. Using data attributes with JS event handlers would eliminate this entire class of risk. The direct Scryfall fetches are standard practice.
