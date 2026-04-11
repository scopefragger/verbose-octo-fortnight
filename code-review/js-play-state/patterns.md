# Patterns Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Magic number: initial life total 40
**Severity:** Low
**Lines:** 1554
`playLife = 40` uses a magic number. Commander games start at 40 life, but this is not documented and would need to be changed in multiple places if a variant format (e.g., Oathbreaker at 20) were added.
**Action:** Extract to a named constant: `const COMMANDER_STARTING_LIFE = 40;` and use it in initialization and any reset logic.

### Magic number: initial turn 1
**Severity:** Low
**Lines:** 1553
`playTurn = 1` is fine but should be reset consistently via a shared reset function rather than inline assignments scattered across the codebase.
**Action:** Consolidate initial play state values into a `resetPlayState()` function or constant defaults object.

### Inline style strings in `renderManaPool`
**Severity:** Low
**Lines:** 1630
Mana pip colors are applied as inline `style` attributes using `MANA_COLOR_STYLES`. This duplicates color values that may already exist in CSS variables elsewhere in the file.
**Action:** Check if CSS custom properties or classes exist for mana colors (e.g., `.mana-W`, `.mana-U`). If so, use those classes instead. If not, consider defining them in the CSS section to avoid scattered style logic.

### `spendMana` drain order is a magic list
**Severity:** Low
**Lines:** 1614
The drain order `['C','G','R','B','U','W']` is a hardcoded magic array representing the priority for spending generic mana. This order is not documented.
**Action:** Extract to a named constant (e.g., `const MANA_DRAIN_ORDER = ['C','G','R','B','U','W'];`) and add a comment explaining the rationale (colorless-first, then colors in reverse priority order).

### `parseMana` regex pattern is inline
**Severity:** Low
**Lines:** 1583
The regex `/\{([^}]+)\}/g` for parsing mana cost symbols is inlined. It is used only once here but conceptually related to Scryfall mana cost format which may be parsed elsewhere.
**Action:** Extract to a named constant `const MANA_SYMBOL_REGEX = /\{([^}]+)\}/g;` for reuse and documentation.

## Summary
The Play State section follows consistent patterns but contains several magic numbers and inline values that would benefit from named constants. The mana drain order and starting life total are the most important to extract. Overall the logic is clean and readable.
