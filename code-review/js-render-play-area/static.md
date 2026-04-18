# Static Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Redundant `typeof selectedBFId !== 'undefined'` guard
**Severity:** Low
**Lines:** 1887
`selectedBFId` is declared at the module level (`let selectedBFId = null`) in the play-state section, so it is always defined — never `undefined`. The `typeof` guard is always `true` and adds noise. The effective check is just `selectedBFId === bfc.id`.
**Action:** Simplify to `const selectedClass = selectedBFId === bfc.id ? ' selected' : '';`.

### `play-hand-count` is written by two functions
**Severity:** Low
**Lines:** 1867, 1907
`document.getElementById('play-hand-count').textContent = playHand.length` appears in both `renderPlayArea()` (line 1867) and `renderPlayHand()` (line 1907). When `renderPlayArea()` calls `renderPlayHand()`, this assignment executes twice per full render cycle.
**Action:** Remove the assignment from `renderPlayArea()` (line 1867) since `renderPlayHand()` always sets it.

### `getCardType` called but not defined in this section
**Severity:** Low
**Lines:** 1914
`getCardType(card)` is referenced with no declaration in this segment. Confirm it is defined elsewhere in the file and that `renderPlayHand` is only ever called after that definition.
**Action:** Verify declaration location; add a note if it is defined in a later segment (module-level hoisting only applies to `function` declarations, not `const`/`let`).

## Summary
Functionally solid render section. The two minor issues are a dead `typeof` guard and a duplicate DOM write to `play-hand-count`.
