# Code & Pattern Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Magic number `40` for starting life total
**Severity:** Low
**Lines:** 1554
`let playLife = 40;` uses a magic number. Commander format starts at 40 life, but this could be a named constant for clarity and easier modification (e.g., for Oathbreaker format with 20 life).
**Action:** Define `const COMMANDER_STARTING_LIFE = 40;` and use it here.

### Hardcoded drain priority array duplicates `MANA_COLORS` in reverse-ish order
**Severity:** Low
**Lines:** 1614
`['C','G','R','B','U','W']` is a manually written reverse of `MANA_COLORS` with C moved to the front. This is easy to get wrong if `MANA_COLORS` is ever changed.
**Action:** Derive this array from `MANA_COLORS` or define it as a named constant `MANA_DRAIN_ORDER`.

### `MANA_COLOR_STYLES` inline hex colors should reference CSS variables
**Severity:** Low
**Lines:** 1561
The hex colors for mana symbols are defined in JS but the same colors likely appear in CSS elsewhere. This creates two sources of truth.
**Action:** If mana pip colors are used in CSS, define them as CSS custom properties and read them from `getComputedStyle()` in JS, or at least co-locate both definitions with a comment.

### `formatManaCostShort` truncates at 10 characters arbitrarily
**Severity:** Low
**Lines:** 1644
The `.slice(0, 10)` limit is a magic number. A card with 5+ pips could be clipped unexpectedly.
**Action:** Define a named constant `MANA_COST_DISPLAY_MAX = 10` with a comment explaining the UI constraint, or remove truncation and handle overflow via CSS.

## Summary
Several magic numbers and duplicated constant definitions make this section harder to maintain. The drain priority array being a manual partial-reverse of `MANA_COLORS` is the most error-prone pattern and should be derived programmatically.
