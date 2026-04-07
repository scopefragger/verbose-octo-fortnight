# Static Review — Mode Toggle Buttons
Lines: 550–557 | File: public/mtg-commander.html

## Findings

### Hardcoded color literal in `.mode-btn.active`
**Severity:** Low
**Lines:** 556
`color: #1a1a2e` is a raw hex literal rather than a CSS variable. The value `#1a1a2e` appears to be the app's dark background color, which is defined (or should be defined) as a variable in the `:root` block. Using the literal breaks the single-source-of-truth for that color token — if the background ever changes, this rule will silently diverge.
**Action:** Extract `#1a1a2e` to a CSS custom property (e.g. `--bg-deep: #1a1a2e`) in the `:root` block and reference `var(--bg-deep)` here.

## Summary
All CSS variable references (`--gold`, `--card-border`, `--text-dim`) resolve correctly against the `:root` block at line 15–18. The only static issue is a single hardcoded hex color on line 556 that duplicates the root background value without using a variable.
