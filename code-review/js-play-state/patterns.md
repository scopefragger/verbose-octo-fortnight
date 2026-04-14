# Code & Pattern Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Magic number: default starting life total `40`
**Severity:** Low
**Lines:** 1554
`let playLife = 40;` uses the Commander-format starting life total as a bare literal. If another format or a custom starting life is ever needed, this is the only place to find and change it.
**Action:** Define `const STARTING_LIFE = 40;` as a named constant at the top of the play state section.

### Magic number: default turn `1`
**Severity:** Low
**Lines:** 1553
`let playTurn = 1;` starts at 1 — correct, but should be grouped with other game constants to make it obvious this is a game-rule constant rather than an implementation detail.
**Action:** Group with `STARTING_LIFE` as `const STARTING_TURN = 1;`.

### Hybrid mana counts as generic without comment
**Severity:** Low
**Lines:** 1588
`if (v.includes('/')) result.generic++;` silently treats all hybrid mana symbols as one generic mana. This is a deliberate simplification but the only indication is the inline comment `// hybrid — count as generic`. A fuller note explaining why (hybrid mana is complex to model accurately) would help future maintainers.
**Action:** Expand the comment to note that hybrid mana affordability is intentionally simplified.

### `renderManaPool` uses inline style with hardcoded `font-weight:700`
**Severity:** Low
**Lines:** 1630
The pip display uses `font-weight:700` as an inline style. This should reference a CSS class for consistency with the rest of the file's styling approach.
**Action:** Add a `.mana-pip` CSS class and use `class="mana-pip"` instead of inline font-weight.

### `MANA_COLOR_STYLES` object keys duplicate `MANA_COLORS` array values
**Severity:** Low
**Lines:** 1560–1561
The six color keys in `MANA_COLOR_STYLES` are the same as the values in `MANA_COLORS`. Any addition/change of a mana color must be applied in both places.
**Action:** Either derive `MANA_COLORS` from `Object.keys(MANA_COLOR_STYLES)` or add a comment to update both when changing colors.

## Summary
The play state section is generally well-structured. The main pattern concerns are magic numbers for starting life/turn, duplicated mana color definitions, and inline styles that belong in CSS. The hybrid mana simplification is acceptable but deserves a clearer comment.
