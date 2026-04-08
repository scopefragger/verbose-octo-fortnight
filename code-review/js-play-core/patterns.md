# Patterns Review — Play Core
Lines: 1664–1841 | File: public/mtg-commander.html

## Findings

### Magic number `40` for starting life total and `7` for opening hand size
**Severity:** Low
**Lines:** 1667–1673
`startGame()` uses the literals `7` (opening hand) and `40` (starting life) inline. These are well-known Magic: the Gathering constants but are not named, making them harder to adjust if the tool ever supports different formats (e.g., standard 20-life, Brawl 25-life).
**Action:** Define constants at the top of the play-state section: `const STARTING_HAND_SIZE = 7;` and `const STARTING_LIFE = 40;` and reference them in `startGame`.

### Inline style strings in `showManaChoicePicker` duplicate CSS class responsibilities
**Severity:** Low
**Lines:** 1775
The button style `style="background:${style};color:#111;font-weight:800;min-width:36px"` is fully inline. The `focus-btn` class is already applied, suggesting these properties should be part of a modifier class (e.g., `.focus-btn-mana`) defined in the CSS section, rather than repeated inline.
**Action:** Add a CSS class `.focus-btn-mana { color: #111; font-weight: 800; min-width: 36px; }` and only keep the dynamic `background` as an inline style, which cannot be handled by a static class.

### `endTurn` toast message is misleading about game timing
**Severity:** Low
**Lines:** 1701
The toast `Turn ${playTurn} — drew a card` implies drawing happens at end of turn. In Magic, the draw step occurs at the beginning of the next turn. This is a minor UX/labelling inconsistency.
**Action:** Change toast to `Turn ${playTurn} — draw step` or `Turn ${playTurn} begins — drew a card` to better reflect game timing.

### `tapCard` toggles tap state mid-function before mana calculation
**Severity:** Low
**Lines:** 1725–1766
`c.tapped = !c.tapped` is set at line 1735, but the subsequent mana logic still relies on the original `wasTapped` value captured on line 1725. While functionally correct, the ordering is confusing — a reader might expect `c.tapped` and `wasTapped` to be consistent at every point in the function.
**Action:** Move `c.tapped = !c.tapped` to the end of the function (after mana calculation) to make the control flow read top-to-bottom without requiring the `wasTapped` snapshot. Add a comment if the current order is intentional for rendering purposes.

### `playHandCardFromFocus` detects play success by comparing `playHand.length` before and after
**Severity:** Low
**Lines:** 1822–1826
```js
const before = playHand.length;
playCardToBattlefield(idx);
if (playHand.length < before) closeFocusPanel();
```
This is a fragile indirect check — it relies on the side effect of array length change rather than a return value from `playCardToBattlefield`. If `playCardToBattlefield` is ever refactored to return a boolean success flag, this pattern would be left silently using the old approach.
**Action:** Refactor `playCardToBattlefield` to return `true` on success and `false` when it exits early (e.g., not enough mana). Use the return value in `playHandCardFromFocus`: `if (playCardToBattlefield(idx)) closeFocusPanel();`

### Comments are absent for the `untapAll` vs `endTurn` distinction
**Severity:** Low
**Lines:** 1689–1702
Both `untapAll` and `endTurn` untap all permanents and clear the mana pool. `endTurn` additionally increments the turn and draws a card. The two functions are distinct in intent but look nearly identical. No comments explain the difference.
**Action:** Add a brief comment above `untapAll`: `// Manual untap (e.g., for effects). Does not advance turn or draw.` and above `endTurn`: `// Advance to next turn: untap all, clear mana, draw for turn.`

## Summary
The Play Core section follows the project's general patterns well. The main pattern issues are: magic-number starting values that should be named constants, an indirect "did it work?" check in `playHandCardFromFocus` that should use an explicit return value, and a handful of minor labelling and inline-style inconsistencies. None of these affect correctness but they would trip up future maintainers.
