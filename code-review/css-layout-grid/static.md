# Static Code Review — Layout Grid
Lines: 67–78 | File: public/mtg-commander.html

## Findings

### Magic number in height calculation
**Severity:** Low
**Lines:** 72
`height: calc(100vh - 57px)` subtracts a hard-coded pixel value that presumably matches the header bar height. If the header height ever changes, this value will silently fall out of sync and the layout will either overflow or leave a gap — there is no single source of truth tying these together.
**Action:** Define a CSS custom property (e.g., `--header-height: 57px`) at the `:root` level and reference it in both the header rule and this `calc()`.

### Explicit `0px` instead of `0`
**Severity:** Low
**Lines:** 77
`grid-template-columns: 0px 1fr` uses a unit on a zero value. The CSS specification allows (and convention prefers) bare `0` for zero-length values; the unit is unnecessary and inconsistent with how zero values are typically written elsewhere in CSS.
**Action:** Change `0px` to `0`.

## Summary
The segment is small and structurally sound. The two issues are a magic number that creates a hidden coupling to the header height, and a minor stylistic inconsistency with a unitless zero. Neither causes a functional bug today, but the magic number is the more meaningful risk to long-term maintainability.
