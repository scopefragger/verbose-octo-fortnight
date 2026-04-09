# Security Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### XSS risk — `d.id` injected into onclick attribute without sanitization
**Severity:** Medium
**Lines:** 1489–1490
`d.id` (a UUID from the API) is interpolated directly into `onclick="loadDeckFromSaved('${d.id}')"` and `onclick="deleteSavedDeck('${d.id}', ...)"` without any escaping. While Supabase UUIDs are format-constrained and currently safe, relying on the API response format for XSS safety is brittle. If the ID field were ever changed to a non-UUID format or a malicious value were injected, script execution could occur.
**Action:** Wrap `d.id` with `escapeQuotes(d.id)` (or better, use data attributes and event delegation rather than inline `onclick` handlers).

### `deleteSavedDeck` receives `name` via inline onclick — double-escaping risk
**Severity:** Low
**Lines:** 1490
`escapeQuotes(d.name)` is used for the `name` argument in the `onclick` string, which is correct. However, `escapeQuotes` converts `"` to `&quot;` inside a JS string context (not an HTML attribute), which is the wrong escaping for a JS string literal. If a name contains a backslash it could still break the string.
**Action:** Use a data-attribute approach instead of inline onclick to avoid the multi-layer escaping problem.

### `confirm()` dialog text is unsanitized user data
**Severity:** Low
**Lines:** 1520
`confirm(\`Delete deck "${name}"?\`)` uses the `name` variable passed from the inline onclick, which was `escapeQuotes`-processed. The `confirm` dialog renders plain text, so XSS is not possible, but the name could contain misleading content that tricks the user.
**Action:** No immediate action required for XSS; this is acceptable for plain-text dialogs.

## Summary
The primary security concern is that `d.id` is inserted into inline onclick attributes without escaping, relying on UUID format guarantees for safety. The `escapeQuotes` approach for the deck name is present but uses the wrong escaping strategy for a JS string context. Migrating to data-attribute/event-delegation pattern would eliminate both issues.
