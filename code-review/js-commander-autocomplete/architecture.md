# Architecture Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### `fetchSuggestions` mixes data fetching, data transformation, and DOM rendering
**Severity:** Medium
**Lines:** 2100–2126
The function performs three distinct concerns in sequence: (1) fetches the autocomplete list, (2) fetches card detail previews in parallel, and (3) renders HTML into the dropdown. This makes individual concerns hard to test or reuse.
**Action:** Extract a `renderDropdown(names, previews, dropdown, state, input)` function for the rendering concern, and a `fetchCardPreview(name)` helper for the individual card detail fetch. `fetchSuggestions` then orchestrates only the fetch-and-hand-off flow.

### Tight coupling between `selectCommander` and DOM ID conventions
**Severity:** Medium
**Lines:** 2128–2133
`selectCommander` reconstructs the `acState` key from the input element's DOM ID, creating a hidden contract between the HTML attribute values and the JS state structure. Any renaming of the input ID will silently break state cleanup without an error.
**Action:** Pass `stateKey` as a parameter from `setupAutocomplete` (which already knows it) through the `onclick` data attribute, removing the hard-coded reverse mapping entirely.

### Global `acState` object as implicit shared state
**Severity:** Low
**Lines:** 2057–2060
`acState` is a module-level object shared across both autocomplete instances. This is workable for two instances but does not scale and makes the state lifecycle opaque — it is never reset when the deck form is closed or reinitialized.
**Action:** Consider returning or encapsulating state per `setupAutocomplete` call, or at minimum explicitly resetting `acState` entries on form open/close events.

### No loading/error feedback to the user
**Severity:** Low
**Lines:** 2100–2126
If the Scryfall API is slow or returns an error, the dropdown simply stays hidden or disappears with no visual indicator. This is a UX gap but also an architectural one: feedback responsibility is not assigned.
**Action:** Show a brief "Loading…" placeholder in the dropdown while fetching, and show an "Unable to fetch suggestions" message on error instead of silently hiding the dropdown.

## Summary
The autocomplete logic is compact but blends fetch, transform, and render in a single function and relies on implicit ID-to-state-key mappings that are brittle. Separating concerns and passing state keys explicitly would improve robustness and maintainability significantly.
