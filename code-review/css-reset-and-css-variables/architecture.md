# Architecture Review — Reset & CSS Variables
Lines: 8–28 | File: public/mtg-commander.html

## Findings

### Mana colour palette split across CSS variables and JS constant
**Severity:** Medium
**Lines:** 21–25 (CSS) vs JS `MANA_COLOR_STYLES` object
The mana colours (`--blue`, `--green`, `--red`, and the unused `--black-mana`, `--white-mana`) are partially defined as CSS custom properties, but the authoritative mana colour map used at runtime is the JS object `MANA_COLOR_STYLES = { W, U, B, R, G, C }` with its own hardcoded hex values. These two sources are not linked.
**Action:** Decide on one source of truth. Either expose CSS variables as the palette and read them in JS via `getComputedStyle`, or remove the mana-related CSS variables and keep only the JS constant. The JS constant is currently more complete and actively used.

### Universal reset on `*` selector
**Severity:** Low
**Lines:** 8
`* { margin: 0; padding: 0; box-sizing: border-box; }` is a broad reset. For a single-page embedded app this is acceptable, but it will affect any third-party widget or modal library added in future without warning.
**Action:** Low priority — acceptable for this project's scope, but worth noting if external UI components are ever integrated.

## Summary
The primary architectural concern is the mana colour split between CSS variables and a JS constant. There is no runtime link between them, so a colour change requires updating two places. Consolidating to one source would reduce drift risk.
