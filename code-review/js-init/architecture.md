# Architecture Review — Init
Lines: 1050–1055 | File: public/mtg-commander.html

## Findings

### Init block is incomplete — missing render calls
**Severity:** Low
**Lines:** 1051–1055
On page load only `loadSavedDecks()` and two autocomplete setups are called. If other initial render steps are needed (e.g. restoring a previously active tab, setting initial UI state), they are scattered across the file rather than centralised here.
**Action:** Consider making this the canonical entry point for all startup logic, or add a comment noting which other startup actions happen inline (e.g., CSS-driven defaults).

### `setupAutocomplete` called twice with different element IDs — correct pattern
**Severity:** Informational
**Lines:** 1053–1054
The two `setupAutocomplete` calls are parameterised correctly for commander and partner inputs. This is a good reuse of the autocomplete abstraction.
**Action:** No action needed.

## Summary
The init block is lean. The one finding is that startup logic is fragmented — some happens here, some is implicit in CSS defaults, some fires on user interaction. Centralising would improve maintainability.
