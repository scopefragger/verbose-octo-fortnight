# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Mana pool values rendered directly into innerHTML with inline styles
**Severity:** Low
**Lines:** 1628–1631
`renderManaPool()` interpolates `MANA_COLORS` values (a static constant) and `manaPool[c]` (an integer counter) directly into innerHTML. Since `manaPool` values are always numeric (initialized to 0 and incremented/decremented arithmetically), there is no XSS vector here. However, if the mana pool were ever populated from an external source (e.g. saved game state), this could become a risk.
**Action:** No immediate action required, but if mana state is ever persisted/loaded from external data, ensure values are sanitized before rendering.

## Summary
No XSS or injection risks are present. All values rendered into innerHTML in this section are derived from static constants (`MANA_COLORS`, `MANA_COLOR_STYLES`) or integer arithmetic, not from user input or API responses.
