# Patterns Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### Inline onclick handlers instead of event delegation
**Severity:** Medium
**Lines:** 1489–1490
The rendered deck list uses `onclick="loadDeckFromSaved('${d.id}')"` and `onclick="deleteSavedDeck(...)"` inline. Other interactive lists in the file (e.g. battlefield cards) use the same pattern — but it remains inconsistent with good practice and introduces the security concerns noted in the security review. There is no established event-delegation pattern in the codebase to reference.
**Action:** Adopt a consistent `data-action` / `data-id` attribute pattern with a single delegated listener on the container, replacing all inline handlers in dynamic lists.

### Inconsistent error handling — `saveDeck` logs errors, others do not
**Severity:** Low
**Lines:** 1471–1473 vs 1494, 1514, 1526
`saveDeck` has `catch (err)` and uses `err.message` in the toast. The other three functions use bare `catch {}` with no reference to the error. This inconsistency makes behaviour harder to reason about and diagnose.
**Action:** Standardise all catch blocks to `catch (err) { console.error(..., err); showToast(..., true); }`.

### Magic string `/api/mtg/decks` repeated across functions
**Severity:** Low
**Lines:** 1464, 1480, 1502, 1522
The API base path `/api/mtg/decks` is hardcoded four times across the four functions. A path change requires updating all four locations.
**Action:** Extract to a module-level constant: `const MTG_DECKS_API = '/api/mtg/decks';`

### `loadSavedDecks` called procedurally after mutations instead of event-driven refresh
**Severity:** Low
**Lines:** 1470, 1525
After save and delete operations, `loadSavedDecks()` is called directly. This is a simple pattern but means the refresh logic is baked into the mutation functions rather than being driven by a state change / event. As features grow (e.g. optimistic updates, pagination), this pattern will not scale.
**Action:** Consider a lightweight event or callback pattern (`onDecksChanged()`) that triggers re-render, decoupling mutation from refresh.

## Summary
The section follows the file's general inline-handler and direct-DOM patterns but misses opportunities for consistency: error handling is uneven, the API path is repeated, and the mutation→refresh coupling is procedural. Extracting a constant for the API path and standardising catch blocks are quick wins; moving to event delegation is a larger but higher-value improvement.
