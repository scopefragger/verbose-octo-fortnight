# Static Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `setupAutocomplete()` does not null-guard `input` or `dropdown` before attaching listeners
**Severity:** Medium
**Lines:** 2063–2065
`document.getElementById(inputId)` and `document.getElementById(dropdownId)` are called without null checks. If either element is missing (bad ID string, HTML restructure), the subsequent `.addEventListener()` calls will throw immediately at setup time — before any user interaction. Since `setupAutocomplete` is called in `DOMContentLoaded`, a silent startup crash is possible.
**Action:** Add guards: `if (!input || !dropdown) { console.warn('Autocomplete: element not found', inputId, dropdownId); return; }`.

### `acState` key resolution in `selectCommander()` uses a hard-coded string comparison
**Severity:** Medium
**Lines:** 2131
`const key = inputId === 'commander-input' ? 'commander' : 'partner';` hard-codes the input element IDs as strings to map back to `acState` keys. If a third autocomplete is added (e.g. for a second partner), this ternary breaks silently — the new input's ID would fall through to `'partner'`, operating on the wrong state.
**Action:** Derive the key from `stateKey` by passing it through `selectCommander`, or maintain a `inputId → stateKey` map at the call site. Alternatively, expose `stateKey` in a `data-` attribute on the dropdown element and read it back in `selectCommander`.

### `fetchSuggestions` silently swallows all fetch errors
**Severity:** Low
**Lines:** 2125
The outer `try/catch` calls `hideDropdown` on any error, with no logging. If the Scryfall API is down, rate-limiting responses, or returning malformed JSON, users see the dropdown vanish with no feedback.
**Action:** Log the error to the console (`console.warn('Autocomplete fetch failed:', err)`) and optionally display a brief toast.

### `names.slice(0, 8)` and `names.slice(0, 8)` — double slice of the same length
**Severity:** Low
**Lines:** 2104, 2108
`json.data` is first sliced to 8 items at line 2104 (`const names = (json.data || []).slice(0, 8)`), and then the same `names` array is sliced to 8 again at line 2108 (`names.slice(0, 8).map(...)`). The second `.slice(0, 8)` is redundant since `names` is already at most 8 items.
**Action:** Replace `names.slice(0, 8).map(...)` with `names.map(...)`.

### Global `document.addEventListener('click', ...)` registered once per `setupAutocomplete` call
**Severity:** Medium
**Lines:** 2093–2097
`setupAutocomplete` is called twice (for commander and partner). Each call registers a new `document` click listener. This means there are two global click listeners on `document`, each checking whether the click is outside its respective input/dropdown. This is functional but accumulates listeners on the document — if `setupAutocomplete` were ever called dynamically (e.g. for multiple instances), the count grows unboundedly.
**Action:** Register a single delegated click handler on `document` that iterates all active autocomplete instances, or use `{ once: false }` tracking with explicit cleanup via `removeEventListener` if the component is ever torn down.

### `hideDropdown` clears `dropdown.innerHTML` on every hide — no cache
**Severity:** Low
**Lines:** 2137
Every time the dropdown is hidden, its innerHTML is wiped. On the next keypress the full suggestion list must be fetched and re-rendered from scratch. Clearing on hide is correct to avoid stale data, but it means no transition animation (e.g. fade-out) is possible while content is being removed.
**Action:** Acceptable for current UX. Document as intentional: `// Clear on hide to prevent stale suggestions`.

## Summary
The autocomplete is well-structured with proper debouncing and keyboard navigation. The main static concerns are: missing null guards at setup, the fragile `inputId`-to-`stateKey` mapping in `selectCommander`, and two global document click listeners being registered instead of one. The double `.slice(0, 8)` is a minor redundancy.
