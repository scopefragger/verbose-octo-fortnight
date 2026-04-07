# Architecture Review — Card Detail Modal
Lines: 419–468 | File: public/mtg-commander.html

## Findings

### Close behavior split across two independent handlers
**Severity:** Medium
**Lines:** 1015 (HTML inline onclick), 1448–1452 (JS closeModal)
The modal has two separate close mechanisms: (1) an inline `onclick` on the close button that directly manipulates the DOM (`document.getElementById('card-modal').classList.add('hidden')`), and (2) a `closeModal(event)` function that handles overlay-click-to-dismiss. These two paths duplicate the "hide the modal" logic. If the hiding behavior ever needs to change (e.g., adding a fade-out animation), both locations must be updated in sync.
**Action:** Have the close button call `closeModal` (or a dedicated `hideModal()` function) so there is a single authoritative path for dismissing the modal.

### `showCardDetail` makes a network request synchronously on every call with no loading state
**Severity:** Low
**Lines:** 1435–1446 (JS)
`showCardDetail` is `async` and `await`s `fetchCard`, but the modal is not shown (or put into a loading state) until the fetch completes. During the wait, the user gets no feedback. The CSS for the modal provides no loading/skeleton variant. This is an architectural gap between the CSS component and its JS driver.
**Action:** Show the modal immediately in a loading state (spinner or placeholder) and populate fields once the fetch resolves.

### Modal reuses a single shared DOM element for all cards
**Severity:** Low
**Lines:** 1013–1026 (HTML), 1439–1445 (JS)
The single `#card-modal` element is mutated in place for every card shown. This is acceptable for a single-user client app but means there is no history or stacking — opening a second card while one is open silently replaces it. This is a deliberate simplification, but it should be noted if multi-card comparison is ever a desired feature.
**Action:** Document the single-instance constraint as a comment in the HTML; no immediate refactor required.

## Summary
The most actionable issue is the duplicated modal-close logic split between an inline onclick and the `closeModal` function. Consolidating these into one function would reduce maintenance risk. The async loading-state gap is a secondary UX-architectural concern.
