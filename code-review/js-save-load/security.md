# Security Review — js-save-load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Deck ID injected into onclick attributes without sanitisation
**Severity:** High
**Lines:** 1489–1490
UUIDs from the API (`d.id`) are interpolated directly into `onclick="loadDeckFromSaved('${d.id}')"` and `onclick="deleteSavedDeck('${d.id}', ...)"` without escaping. Although UUIDs from a controlled Supabase backend are unlikely to contain script-breaking characters, any backend compromise or unexpected value could result in XSS via attribute injection. The project's `esc()` convention (or at minimum `escapeQuotes`) should be applied.
**Action:** Wrap `d.id` with `escapeQuotes()` (or assign data attributes and use event delegation) to prevent attribute-breaking injection.

### `d.name` escaped in display but raw in `deleteSavedDeck` confirm dialog
**Severity:** Low
**Lines:** 1490, 1519–1520
`escapeQuotes(d.name)` is used in the `onclick` attribute, which protects the JS string. However `deleteSavedDeck` calls `confirm(\`Delete deck "${name}"?\`)` with the unescaped name passed from the HTML attribute. If the name contains backtick or `${}` sequences, `confirm()` text could be malformed (though not a script-execution risk since it's in a native dialog).
**Action:** Use the `name` parameter directly in `confirm()` — it is already JS-string-safe at that point — but ensure the flow is clearly commented.

### All API calls use `apiFetch` — correct
**Lines:** 1464, 1480, 1502, 1522
All four functions correctly use `apiFetch()` which appends the `?secret=` parameter. No direct `fetch()` calls present.

## Summary
The main concern is the un-escaped `d.id` in inline `onclick` attributes. While UUIDs are low-risk in practice, the codebase convention requires escaping all API-sourced values interpolated into HTML. The rest of the section follows the project's auth pattern correctly.
