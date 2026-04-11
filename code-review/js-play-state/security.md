# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Mana color labels injected into innerHTML without escaping
**Severity:** Low
**Lines:** 1630
`renderManaPool()` injects mana color keys (e.g., `W`, `U`) directly into an HTML string via template literals. The values come from `MANA_COLORS`, which is a hardcoded constant array, so there is no immediate XSS risk. However, if `MANA_COLOR_STYLES` keys were ever sourced from external data, the pattern would be unsafe.
**Action:** No immediate action required, but consider using `escapeHtml()` on any dynamic values as a defensive habit, even for constants. Add a comment that these values are trusted constants.

### `manaPool` object mutated via direct property assignment
**Severity:** Low
**Lines:** 1558, 1638
`manaPool` is a module-level mutable object. Any function in the file can modify it directly. There are no access controls or validation on writes (e.g., negative values are possible before `spendMana`'s `Math.max` clamp).
**Action:** Low risk in a single-file client app, but consider a setter function or validation wrapper if the codebase grows.

## Summary
No significant security vulnerabilities in this section. The main injection point in `renderManaPool` uses only hardcoded constant values, so XSS risk is negligible. The mutable global state pattern is a minor concern for future maintainability.
