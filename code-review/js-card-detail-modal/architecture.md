# Architecture Review — Card Detail Modal
Lines: 1434–1452 | File: public/mtg-commander.html

## Findings

### `showCardDetail` makes a network request — not a pure render function
**Severity:** Low
**Lines:** 1435–1436
`showCardDetail` calls `fetchCard(name)`, making it both an async data fetcher and a DOM renderer. If the card is already in the hand/deck, the caller already has the data object and could pass it directly.
**Action:** Consider an overloaded signature: `showCardDetail(nameOrCard)` — if the argument is a string, fetch; if it's an object, use directly.

### `closeModal` checks `e.target === modal` — fragile event comparison
**Severity:** Low
**Lines:** 1449
The backdrop-click check requires that the click lands exactly on the modal overlay element, not on any child. If the modal content div doesn't fully cover the overlay, clicks on the overlay padding will work correctly. This is the standard pattern and is fine.
**Action:** No action needed; confirm backdrop click is the only intended dismiss mechanism (besides the close button).

### Three separate modals (`card-modal`, `graveyard-viewer`, `token-modal`) each have their own close logic
**Severity:** Low
**Lines:** 1448–1452
Each modal in the file has its own bespoke open/close functions. A shared `openModal(id)` / `closeModal(id)` utility would reduce repetition.
**Action:** Consider a general `showModal(id)` / `hideModal(id)` pattern, consistent with the HTML review finding about inconsistent modal close patterns.

## Summary
`showCardDetail` is clean but fetches data unnecessarily when the caller may already have it. `closeModal` uses the standard backdrop-click pattern. Multiple modals share no common open/close abstraction.
