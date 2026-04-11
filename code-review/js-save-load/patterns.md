# Patterns Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent error handling pattern across the four functions
**Severity:** Medium
**Lines:** 1463–1473 vs. 1494, 1514, 1526
`saveDeck` uses a named `catch (err)` and surfaces `err.message` in the toast. The other three functions use anonymous catch and show generic, undescriptive toast messages. The project should pick one pattern and apply it consistently across all async API functions.
**Action:** Standardise on named catch + `console.error` + descriptive toast that optionally includes `err.message`, matching the `saveDeck` approach.

### Loading spinner pattern is not reused
**Severity:** Low
**Lines:** 1478
`el.innerHTML = '<div class="empty-saved"><span class="loading-spinner"></span></div>'` is an inline HTML string. If other list sections use a loading state, this markup likely duplicates a pattern defined elsewhere.
**Action:** Extract a `loadingHTML()` or `spinnerHTML()` helper and reuse it wherever a loading placeholder is shown.

### `new Date(d.updated_at).toLocaleDateString()` is not null-guarded
**Severity:** Low
**Lines:** 1487
If `d.updated_at` is `null` or `undefined` (possible for older records before the column was added), `new Date(null)` produces `"January 1, 1970"` and `new Date(undefined)` produces `"Invalid Date"`. Either outcome displays misleading information.
**Action:** Add a guard: `d.updated_at ? new Date(d.updated_at).toLocaleDateString() : 'Unknown date'`.

### Magic string `'Load a deck first'` — inconsistent phrasing
**Severity:** Low
**Lines:** 1460
The validation toast says "Load a deck first", but the feature is called "Import" elsewhere in the UI. This inconsistency could confuse users.
**Action:** Change to `'Import a deck first'` or whichever term the UI consistently uses, and consider extracting user-facing strings to a constants object.

### `escapeHtml` used in some places, `escapeQuotes` in others — no unified escape
**Severity:** Low
**Lines:** 1486–1490
`escapeHtml` is used for display text and `escapeQuotes` for onclick string arguments. This is correct usage, but it requires developers to remember which helper to apply in which context. A comment explaining the distinction would reduce error risk.
**Action:** Add a brief comment block above the `escapeHtml`/`escapeQuotes` declarations explaining when each should be used.

## Summary
The section generally follows the project's patterns but is internally inconsistent in error handling. The most impactful improvement is standardising the catch pattern across all four functions. Several minor issues (null guard on date, wording inconsistency) are easy wins for polish and reliability.
