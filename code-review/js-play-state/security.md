# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `MANA_COLOR_STYLES` values interpolated directly into inline style attributes
**Severity:** Low
**Lines:** 1630
`MANA_COLOR_STYLES[c]` is interpolated into `style="color:${MANA_COLOR_STYLES[c]}..."`. These values are defined as string constants in the same file (e.g., `'#e8d870'`), so there is no runtime XSS risk. However, the pattern is worth noting: if these values were ever derived from user or external input they would become CSS injection vectors.
**Action:** No immediate change needed. Avoid making `MANA_COLOR_STYLES` dynamically user-configurable without sanitization.

### `manaPool` and play state are module-level mutable globals
**Severity:** Low
**Lines:** 1548–1558
All play state is stored in module-level `let` variables. There is no encapsulation — any other script or browser extension running in the same page context can read or tamper with `manaPool`, `playLife`, `playBattlefield`, etc.
**Action:** For a single-user tool this is acceptable. Document the risk if the page is ever embedded in a third-party frame.

## Summary
No significant security issues. The mana color style interpolation is safe as long as those values remain compile-time constants. The mutable global state is a minor concern for future extensibility but not a current risk.
