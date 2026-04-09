# Static Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `canAfford` does not account for X costs
**Severity:** Medium
**Lines:** 1593–1604
`parseMana()` tracks `X` costs separately (line 1585) but `canAfford()` never checks `cost.X`. A spell with `{X}{R}` will only require the `{R}` pip to be affordable, ignoring the variable X cost entirely. This means the UI will show X spells as always affordable as long as the colored pip is met.
**Action:** Decide on a policy for X (e.g. X=0 is always affordable, or X requires at least 1 extra mana) and enforce it in `canAfford`.

### `spendMana` generic drain order is a separate constant from `MANA_COLORS`
**Severity:** Low
**Lines:** 1614
`spendMana` uses the hardcoded drain order `['C','G','R','B','U','W']` instead of referencing `MANA_COLORS` or a named constant. This order is important for gameplay but is an unexplained magic literal. If `MANA_COLORS` is updated, this order will silently diverge.
**Action:** Extract to a named constant `const MANA_SPEND_ORDER = ['C','G','R','B','U','W']` with a comment explaining the drain priority.

### `renderManaPool` calls `renderPlayHand()` unconditionally
**Severity:** Low
**Lines:** 1634
Every mana pool update triggers a full re-render of the play hand to update affordability indicators. If the hand has many cards, this causes unnecessary DOM churn even when `renderManaPool` is called for display-only reasons.
**Action:** Accept or document this as a known trade-off; consider a flag parameter to suppress the hand re-render when not needed.

### Hybrid mana always counted as generic
**Severity:** Low
**Lines:** 1588
Hybrid mana symbols (e.g. `{W/U}`) are treated as generic cost in `parseMana()`. This will over-restrict affordability checks — a `{W/U}` spell appears unaffordable if neither W nor U pip satisfies it as a generic cost, since generic requires any remaining mana, not specifically colored. The accounting is simplified but may produce incorrect `canAfford` results for hybrid spells.
**Action:** Add a comment documenting the simplification. Consider tracking hybrid costs separately or as two alternatives.

## Summary
The play state section manages mana tracking logic with a reasonable design but has correctness gaps: X costs are parsed but ignored in affordability checks, and hybrid mana handling is a documented simplification that can produce incorrect results. The `spendMana` drain order is a hidden magic constant that could diverge from `MANA_COLORS`.
