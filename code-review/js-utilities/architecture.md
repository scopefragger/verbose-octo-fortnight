# Architecture Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Utilities section is incomplete — `formatManaCostShort` is misplaced
**Severity:** Low
**Lines:** 1642–1645 (misplaced)
`formatManaCostShort()` is a utility function referenced in the SEGMENTS.MD description for this section, but it is defined 500 lines earlier at line 1642, adjacent to the play-state section. Having utility functions scattered across the file makes them harder to find and maintain.
**Action:** Move `formatManaCostShort` to the utilities section.

### `toastTimer` is a module-level variable managing UI state
**Severity:** Low
**Lines:** 2149
`toastTimer` is a `let` variable at module scope used to debounce toast dismissal. While functional, it is an implicit piece of UI state that could be encapsulated in the `showToast` function's closure or in a `toast` object.
**Action:** Consider encapsulating: `const toast = { timer: null }; function showToast(msg, isError) { clearTimeout(toast.timer); ... }`.

### No utility for generating stable card/token IDs
**Severity:** Low
**Lines:** 2141–2156
Throughout the play-mode code, cards on the battlefield are identified by a `bfc.id` that is presumably generated when a card is played. There is no `generateId()` or similar utility in this section. The ID generation logic is buried in the play-core section and is not centralised.
**Action:** Add a `generateId()` utility function (e.g., using `crypto.randomUUID()` or a counter) to the utilities section and use it wherever battlefield card IDs are assigned.

## Summary
The utilities section is minimal and mostly correct. The main architectural concern is that it is incomplete — `formatManaCostShort` belongs here but is defined elsewhere. The `toastTimer` module-level variable could also be better encapsulated.
