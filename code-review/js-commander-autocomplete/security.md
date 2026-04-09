# Security Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `escapeQuotes(name)` in `onclick` — same backslash fragility as graveyard viewer
**Severity:** Medium
**Lines:** 2118
`onclick="selectCommander('${escapeQuotes(name)}', '${escapeQuotes(input.id)}', '${escapeQuotes(dropdown.id)}')"` uses `escapeQuotes` for three string values embedded in an `onclick` attribute. As noted in the graveyard viewer review, `escapeQuotes` does not escape backslashes. A card name containing `\` followed by `'` would produce `\\'` — a literal backslash followed by a closing quote — breaking the JS string. Scryfall card names don't contain backslashes, but this is structurally fragile.
**Action:** Migrate to `data-*` attributes with a delegated event listener, or enhance `escapeQuotes` to also escape backslashes.

### `input.id` and `dropdown.id` embedded in `onclick` — element ID injection
**Severity:** Low
**Lines:** 2118
`escapeQuotes(input.id)` and `escapeQuotes(dropdown.id)` embed DOM element IDs into the onclick string. Since these IDs come from the `setupAutocomplete` call arguments (which are hardcoded string literals in the init code), they are safe. However, if `setupAutocomplete` were ever called with dynamic or user-supplied IDs, this would be a XSS vector.
**Action:** No immediate action required. Document that `setupAutocomplete` must only be called with static, trusted element IDs.

### External Scryfall API response interpolated into innerHTML after escaping
**Severity:** Low
**Lines:** 2120–2121
`escapeHtml(name)` and `escapeHtml(type)` correctly escape card names and type lines from the Scryfall API before rendering them into the dropdown innerHTML. This is correct usage of the XSS prevention pattern.
**Action:** No action required. This is correct and should be maintained as a pattern.

### Scryfall API called without authentication — expected but noted
**Severity:** Info
**Lines:** 2102, 2109
The Scryfall API is called from the client directly without any authentication token. This is consistent with Scryfall's public API terms. No secrets are exposed.
**Action:** No action required.

## Summary
The main security concern is the `escapeQuotes` pattern for multiple values in `onclick` attributes — it is fragile against backslash sequences. The correct use of `escapeHtml` for rendered content is good. Recommend `data-*` attribute pattern as a more robust alternative to inline `onclick` for all card-name-derived values.
