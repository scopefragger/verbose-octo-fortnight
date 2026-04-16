# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Unescaped data injected into `innerHTML` in `renderManaPool`
**Severity:** Medium
**Lines:** 1626, 1628–1631
`renderManaPool` writes directly into `pips.innerHTML`. The interpolated values are:
- `MANA_COLOR_STYLES[c]` — a hardcoded constant, safe.
- `manaPool[c]` — numeric values from the local `manaPool` object, also safe as-is.

However, `MANA_COLORS` values (`c`) are hardcoded strings and `MANA_COLOR_STYLES` keys are internal constants, so there is no immediate injection vector. The risk arises if `MANA_COLORS` or `MANA_COLOR_STYLES` are ever populated from external data (e.g. Scryfall API). Currently safe, but the pattern does not use `escapeHtml()`.
**Action:** As a defensive measure, wrap any string interpolated from non-literal sources through `escapeHtml()`. At minimum, add a comment that these values are internal constants and must not be derived from API data.

### No issues with API data entering mana state
**Severity:** Low
**Lines:** 1563–1578
`getLandMana` reads `card.produced_mana` and `card.type_line` from Scryfall API data, but uses them only to build a plain object with numeric values — no HTML injection occurs here.
**Action:** No change required.

## Summary
The section is largely safe given that mana colour identifiers are hardcoded constants. The main forward-looking concern is the `innerHTML` pattern in `renderManaPool`, which should use `escapeHtml()` or DOM APIs to remain safe if data sources change.
