# Static Code Review — Reset & CSS Variables
Lines: 8–28 | File: public/mtg-commander.html

## Findings

### Unused variables — `--black-mana` and `--white-mana`
**Severity:** Low
**Lines:** 24–25
`--black-mana: #9b8fac` and `--white-mana: #f5f0e0` are defined but a grep of the file shows they are not referenced anywhere else in the stylesheet or JS. They appear to have been added in anticipation of mana pip colouring that instead uses the JS constant `MANA_COLOR_STYLES`.
**Action:** Either remove them, or replace the hardcoded hex values in `MANA_COLOR_STYLES` with `var(--black-mana)` / `var(--white-mana)` to create a single source of truth.

### Unused variable — `--gold-glow`
**Severity:** Low
**Lines:** 20
`--gold-glow: rgba(201,168,76,0.3)` is defined but not referenced in any rule in this file.
**Action:** Search the full stylesheet for usages; remove if genuinely unused.

### Unused variable — `--shadow`
**Severity:** Low
**Lines:** 27
`--shadow: 0 4px 24px rgba(0,0,0,0.5)` is defined but box-shadow values throughout the file are written as inline literals rather than `var(--shadow)`.
**Action:** Either use `var(--shadow)` consistently wherever a drop shadow is applied, or remove the variable.

## Summary
The reset and variable block is clean and well-organised. The main issue is variable bloat — four variables are declared but never consumed, creating a misleading contract about what the design tokens are. No functional bugs.
