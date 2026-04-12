# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Function directly mutates DOM and reads global state in one step
**Severity:** Low
**Lines:** 2041–2053
`showGraveViewer()` conflates three responsibilities: reading global play-state (`playGraveyard`/`playExile`), rendering cards to HTML, and showing the modal. This makes it impossible to test the card-rendering logic in isolation or reuse it for other zones without triggering the modal.
**Action:** Extract a pure `renderZoneCards(cards)` function that returns an HTML string, and keep the modal manipulation in the top-level `showGraveViewer()` caller. This separates render from side-effects.

### Tight coupling to global arrays `playGraveyard` and `playExile`
**Severity:** Low
**Lines:** 2042
The function reaches directly into module-global state rather than accepting cards as a parameter. This couples the graveyard viewer tightly to the current play-state model, making it hard to preview a different set of cards (e.g., a saved game state) or to add a third zone later.
**Action:** Accept a `cards` array as a parameter: `showGraveViewer(zone, cards)` with the caller passing `playGraveyard`/`playExile`. This preserves behaviour while making the dependency explicit and the function reusable.

### `onclick` wires behaviour inside a rendering function
**Severity:** Low
**Lines:** 2047
Binding `showCardDetail` calls via inline `onclick` inside the rendering logic means the event-handling strategy is baked into the HTML string. This is a UI concern (interactivity) mixed with a data concern (card display), and the same coupling issue is noted in the security review.
**Action:** Use event delegation on `grave-viewer-cards` to separate event wiring from HTML generation.

## Summary
The function is acceptably small for a single-file app, but it mixes state access, rendering, and DOM mutation in one place. Accepting `cards` as a parameter and extracting the render step would make the function easier to test, extend, and reason about without significantly increasing complexity.
