# Patterns Review — Scrollbar Styling
Lines: 536–540 | File: public/mtg-commander.html

## Findings

### Magic numbers — hardcoded rgba opacity values
**Severity:** Low
**Lines:** 539–540
`rgba(255,255,255,0.15)` (resting thumb) and `rgba(255,255,255,0.25)` (hover thumb) are literal values with no connection to the design-token system used elsewhere in the file (e.g. `var(--text-dim)`, `var(--card-border)`). The opacity step of `0.10` between states is implied rather than named.
**Action:** Consider mapping these to CSS custom properties, for example `--scrollbar-thumb: rgba(255,255,255,0.15)` and `--scrollbar-thumb-hover: rgba(255,255,255,0.25)`, defined alongside the other tokens at the top of the `<style>` block. This keeps all surface-colour decisions in one place and makes theme changes (e.g. a light mode) a single-point edit.

### Vendor-prefixed-only implementation
**Severity:** Low
**Lines:** 537–540
The block relies exclusively on the non-standard `-webkit-scrollbar` API. The standard CSS Scrollbars Styling specification (`scrollbar-width`, `scrollbar-color`) is now supported in Firefox and is progressing in Chrome/Safari. There is no fallback for non-webkit engines.
**Action:** Consider adding standard equivalents (`scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;`) on the `body` or a scrollable container. This is a progressive-enhancement addition, not a replacement.

### Missing `border-radius` on `-webkit-scrollbar` itself
**Severity:** Low
**Lines:** 537
The track `width` and `height` are both `6px` but no `border-radius` is set on the scrollbar element itself. The thumb sets `border-radius: 3px`, which renders correctly, but some webkit versions show a squared track end-cap. This is a cosmetic inconsistency rather than a functional bug.
**Action:** Add `border-radius: 3px` to the `::-webkit-scrollbar` rule to match the thumb radius, or document the intentional omission.

## Summary
The section is clean and purposeful. Three low-severity pattern notes apply: magic-number opacity values that sit outside the design-token system, a missing standard-property fallback for non-webkit engines, and a minor cosmetic inconsistency between the scrollbar and thumb border-radius values.
