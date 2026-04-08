# Architecture Review — Hand Simulator
Lines: 1325–1432 | File: public/mtg-commander.html

## Findings

### `critiqueHand` mixes UI state management, API call, and DOM update
**Severity:** Medium
**Lines:** 1377–1414
`critiqueHand` handles: button disable/text state, API request construction, response parsing, and DOM update of the critique box. This is three responsibilities in one function (same pattern noted in `importDecklist`).
**Action:** Extract the API call into a separate `fetchCritique(handData, deckContext)` function that returns the critique text, keeping `critiqueHand` as the UI orchestrator.

### `shuffle` is a pure function — correctly separated
**Severity:** Informational
**Lines:** 1334–1341
`shuffle` takes an array, returns a new shuffled array without mutating the input. This is correct functional design.
**Action:** No action needed.

### `buildDrawPile` reads global `deck` — implicit dependency
**Severity:** Low
**Lines:** 1326–1332
Like `renderDeckList`, `buildDrawPile` reads the global `deck` directly. Passing `deck` as a parameter would make the dependency explicit and testable.
**Action:** Consider `function buildDrawPile(deckData = deck)`.

### Hand state management split between this section and `drawHand`/`mulligan`
**Severity:** Low
**Lines:** 1346, 1361
`hand` is set in both `drawHand` and `mulligan`. The only difference is the pile size. These could be unified: `drawHand(size = 7)` already accepts a size parameter; `mulligan` could simply call `drawHand(Math.max(7 - mulliganCount, 1))` after incrementing `mulliganCount`.
**Action:** Refactor `mulligan` to call `drawHand` with the adjusted size to avoid duplicating the pile-building and hand-assignment logic.

## Summary
The hand simulator section is well-structured with good separation of `shuffle` and `buildDrawPile`. Key issues: `critiqueHand` is multi-responsibility, and `mulligan` duplicates `drawHand`'s core logic.
