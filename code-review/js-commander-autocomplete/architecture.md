# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `setupAutocomplete` wires event listeners to specific DOM element IDs
**Severity:** Medium
**Lines:** 2062–2098
`setupAutocomplete(inputId, dropdownId, stateKey)` takes IDs and looks up elements, which is fine. However the global `document.addEventListener('click', ...)` on line 2093 is registered once per `setupAutocomplete` call — so with two commander inputs, there are two global click listeners for dropdown dismissal. This is redundant and accumulates if `setupAutocomplete` is ever called more than twice.
**Action:** Register the global click dismissal listener once at module initialization, not once per autocomplete instance.

### `fetchSuggestions` is both a network function and a render function
**Severity:** Medium
**Lines:** 2100–2125
`fetchSuggestions` fetches data from two Scryfall endpoints and then directly manipulates `dropdown.innerHTML`. These concerns should be separated: one function to fetch (returning data), another to render (taking data).
**Action:** Extract a `renderSuggestions(names, previews, dropdown, input, state)` helper. This also makes the fetch logic independently testable.

### `selectCommander` infers the `acState` key from the input element ID
**Severity:** Low
**Lines:** 2131
`const key = inputId === 'commander-input' ? 'commander' : 'partner';` is a brittle mapping. It would be cleaner to pass `stateKey` through to `selectCommander` via a closure or data attribute.
**Action:** Refactor so `selectCommander` receives the state key directly, removing the ID-to-key mapping.

### `hideDropdown` both clears content and hides the element
**Severity:** Low
**Lines:** 2135–2139
`hideDropdown` clears `innerHTML` and resets the index in addition to hiding. Clearing the content is an optimization to free DOM nodes, but it means that showing the dropdown again always requires re-rendering. If the dropdown is hidden for a brief period (e.g., focus blur then re-focus), the content must be re-fetched.
**Action:** Separate `clearDropdown` (clears content) from `hideDropdown` (only hides), and call `clearDropdown` only when the query changes.

## Summary
The key architectural issues are: two global click listeners registered by two `setupAutocomplete` calls, and `fetchSuggestions` mixing fetch and render. Splitting these concerns and removing the ID-to-key mapping in `selectCommander` would significantly improve maintainability.
