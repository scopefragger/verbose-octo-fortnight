# Architecture Review — State
Lines: 1032–1037 | File: public/mtg-commander.html

## Findings

### `cardCache` crosses prepare/play mode boundary
**Severity:** Low
**Lines:** 1037
The section is labelled "shared prepare-mode state" yet `cardCache` is read during play mode to resolve card images when rendering battlefield and hand cards. Its scope is actually app-wide, not mode-specific.
**Action:** Update the section banner comment to reflect that `cardCache` is app-wide (not prepare-mode only). Alternatively, relocate the declaration to a separate "shared" block.

### No state namespace — all globals in script scope
**Severity:** Low
**Lines:** 1032–1037
All five variables are bare script-global `let` declarations. There is no enclosing object, module, or IIFE to prevent accidental shadowing or collisions. This is consistent with the rest of the single-file approach but creates risk as the file grows.
**Action:** Consider wrapping prepare-mode state in a `const prepareState = { deck: [], hand: [], ... }` object for explicit ownership, mirroring how play-mode state groups its variables (`playHand`, `playBattlefield`, `manaPool`) in section 14.

## Summary
The section correctly separates prepare-mode state from play-mode state (section 14) and does not mix render logic with data. The two findings are minor scope and labelling issues that reflect the natural limits of a single-file architecture.
