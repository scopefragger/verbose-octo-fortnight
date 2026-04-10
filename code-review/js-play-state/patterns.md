# Code & Pattern Review — js-play-state
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Magic starting values for `playLife` and `playTurn`
**Severity:** Low
**Lines:** 1553–1554
`playLife = 40` and `playTurn = 1` are magic numbers. The starting life total of 40 is a Commander-format rule. If the format were changed (e.g., testing with 20-life variants), these would need to be found and changed by hand.
**Action:** Define `const STARTING_LIFE = 40; const STARTING_TURN = 1;` as named constants near the top of the play-state section.

### `MANA_COLOR_STYLES` uses hex strings mixed with `#aaa` shorthand
**Severity:** Low
**Lines:** 1561
The color styles use full hex codes for most colors but `'#aaa'` (shorthand) for colorless. This is a trivial inconsistency but worth noting for maintainability.
**Action:** Normalise all values to full hex codes (e.g., `'#aaaaaa'`).

### Empty line at line 1641 without closing comment
**Severity:** Low
**Lines:** 1641
Other sections in the file end with a clear section separator or comment. The play-state section ends without one, making the boundary between sections less obvious when scrolling.
**Action:** Add a closing comment or section separator consistent with the rest of the file.

### `getLandMana` fallback returns `{ C: 1 }` for unrecognised land types
**Severity:** Low
**Lines:** 1577
Non-basic lands that don't have `produced_mana` data return `{ C: 1 }` (one colorless). This may be misleading for dual lands or utility lands fetched without full data. The comment only mentions "basic land subtype" fallback, but the default applies to all unrecognised lands.
**Action:** Add a comment clarifying that this fallback is intentional and represents a conservative estimate for non-basic lands lacking Scryfall `produced_mana` data.

## Summary
The section is well-structured and readable. The main pattern issues are undocumented magic numbers (starting life, turn) and the tight coupling in `renderManaPool` calling `renderPlayHand`. Adding named constants and inline comments would significantly improve maintainability.
