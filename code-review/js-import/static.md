# Static Review — Import
Lines: 1147–1194 | File: public/mtg-commander.html

## Findings

### `getElementById` calls without null guards
**Severity:** Low
**Lines:** 1149, 1150, 1153, 1165, 1173, 1174, 1183–1194
All `document.getElementById` calls assume the element exists. If any ID is mistyped or the DOM changes, a TypeError will be thrown at runtime with no user feedback.
**Action:** No change required for production, but adding optional chaining (`?.`) on `.value`, `.textContent`, `.style` accesses would make failures graceful.

### `updateStats()` called but not defined in this section
**Severity:** Low
**Lines:** 1163
`updateStats()` is called after import but is not visible in this section — it must be `renderStats()` or similar defined elsewhere (section 8). Verify the function name is correct and consistent.
**Action:** Confirm `updateStats` exists and is not a stale reference to a renamed function. If it wraps `renderStats`, the naming discrepancy should be resolved.

### `renderHand()` called when hand is empty — safe but redundant
**Severity:** Low
**Lines:** 1172, 1190
`renderHand()` is called immediately after `hand = []`. This is a no-op render that clears the hand UI, which is intentional, but could confuse readers expecting `renderHand` to display something.
**Action:** Add a comment: `// re-render to clear the hand display`.

### `btn.textContent = 'Load Deck'` not in a `finally` block
**Severity:** Medium
**Lines:** 1166
If `fetchCards` throws an uncaught exception, the button text will remain as the loading spinner indefinitely (the function does not have a try/catch). The `deckLoaded = false` state will also remain stale.
**Action:** Wrap the async body in `try { ... } finally { btn.textContent = 'Load Deck'; }`.

## Summary
`importDecklist` and `clearDeck` are functional but have two meaningful issues: the loading button is not reset in a `finally` block (leaving a stuck spinner on error), and `updateStats()` may be a stale reference.
