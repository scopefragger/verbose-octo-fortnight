# Patterns Review — js-play-state
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Magic number `40` for Commander starting life total
**Severity:** Low
**Lines:** 1554
`let playLife = 40;` — 40 is the Commander format's starting life total. It reads as an arbitrary number without context.
**Action:** Extract to `const COMMANDER_STARTING_LIFE = 40;` and reference it here and in any reset logic.

### Inline colour values in `renderManaPool` instead of CSS variables
**Severity:** Low
**Lines:** 1561, 1630
`MANA_COLOR_STYLES` maps colour symbols to hex/rgb strings that are applied as inline `style` attributes. The empty-state span on line 1626 uses a CSS variable (`var(--text-dim)`) — inconsistent with the inline hex colours for mana symbols.
**Action:** Define mana colours as CSS custom properties (e.g., `--mana-W: #e8d870`) and apply them via class names or CSS variables, removing the JS-side `MANA_COLOR_STYLES` object.

### Generic mana drain order is undocumented
**Severity:** Low
**Lines:** 1614
`['C','G','R','B','U','W']` — the order in which generic costs drain from the pool is an opinionated design choice (colorless-first, then colors in reverse WUBRG). Without a comment, readers will wonder if this order is intentional or arbitrary.
**Action:** Add a one-line comment: `// drain colorless first, then colors in reverse priority order`.

### Hybrid/phyrexian mana silently counted as generic
**Severity:** Low
**Lines:** 1588
`if (v.includes('/')) result.generic++` catches hybrid mana (`{W/U}`, `{2/W}`) and also Phyrexian mana (`{W/P}`) — they all contain `/`. Phyrexian mana can be paid with 2 life instead, which is not modelled.
**Action:** Add a comment noting this simplification: `// hybrid and Phyrexian mana approximated as generic`.

## Summary
No major pattern violations. The section would benefit from extracting the `40` life-total magic number and adding short comments on the mana-drain priority order and hybrid/Phyrexian approximation.
