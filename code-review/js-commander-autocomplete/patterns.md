# Patterns Review — js-commander-autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Redundant `.slice(0, 8)` call
**Severity:** Low
**Lines:** 2104, 2108
`names` is sliced to 8 entries on line 2104 and then `.slice(0, 8)` is called again on line 2108. The second call is a no-op.
**Action:** Remove the second `.slice(0, 8)`.

### `input.id` and `dropdown.id` passed through `escapeQuotes` unnecessarily
**Severity:** Low
**Lines:** 2118
Element IDs are simple alphanumeric-plus-hyphen strings — they never contain quotes. Wrapping them in `escapeQuotes` adds visual noise without benefit.
**Action:** Either use them directly (`input.id`, `dropdown.id`) or replace with the `stateKey` approach recommended in the architecture review.

### Hardcoded state-key derivation breaks the generic `setupAutocomplete` pattern
**Severity:** Medium
**Lines:** 2131
The function is designed as a reusable autocomplete setup but breaks down at `selectCommander` which hardcodes `'commander-input'`. The existing pattern in `setupAutocomplete` (accepting `stateKey`) is the right abstraction — `selectCommander` should use it rather than re-deriving from the element ID.
**Action:** Add `stateKey` as a third parameter to `selectCommander` and embed it in the onclick string in `fetchSuggestions`.

## Summary
One medium-severity pattern issue: the generic `setupAutocomplete` abstraction is broken by `selectCommander` re-deriving the state key from a hardcoded element ID. Fixing this would make the autocomplete component truly reusable and extend cleanly to additional inputs.
