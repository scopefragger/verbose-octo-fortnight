# Patterns Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inconsistent error handling pattern across the four functions
**Severity:** Medium
**Lines:** 1463–1473, 1479–1496, 1501–1516, 1521–1528
`saveDeck()` uses `catch (err)` and surfaces the error message; the other three functions use `catch {` (no binding) and show a generic message. The project pattern (as seen in `js-import` and other segments) consistently binds the error variable.
**Action:** Standardise all four functions to use `catch (err)` and either log or surface `err.message` for developer diagnostics.

### Magic string: `'deck-name'`, `'commander-input'`, `'partner-input'`, `'decklist-input'`
**Severity:** Low
**Lines:** 1456–1458, 1506–1511
Element IDs are referenced by magic strings in multiple places across the file. A typo or rename of an HTML element breaks silently at runtime.
**Action:** Define element ID constants at the top of the JS block (e.g. `const EL_DECK_NAME = 'deck-name'`) and reference them throughout, or cache the elements at init time.

### Template literal in `loadSavedDecks` mixes display logic with data loading
**Severity:** Low
**Lines:** 1484–1492
The HTML template for each saved deck item is inlined as a multi-line template literal inside `loadSavedDecks()`. Other render sections (e.g. `renderBattlefield`) have dedicated render functions. This mixes fetch logic with render logic.
**Action:** Extract a `renderSavedDeckItem(d)` helper function that returns the HTML string, keeping `loadSavedDecks` focused on fetch/state.

### `new Date(d.updated_at).toLocaleDateString()` without locale or options
**Severity:** Low
**Lines:** 1487
Date formatting uses the browser's default locale, which can produce inconsistent output across users in different regions.
**Action:** Pass explicit options: `new Date(d.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })` or whatever the target locale is.

## Summary
The section follows general project conventions but deviates from the error-handling pattern used elsewhere. The mixed fetch/render concern in `loadSavedDecks` and magic element ID strings are low-priority refactors that would improve maintainability.
