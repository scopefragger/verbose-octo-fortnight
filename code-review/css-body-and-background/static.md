# Static Code Review — Body & Background
Lines: 30–35 | File: public/mtg-commander.html

## Findings

### Hardcoded background gradient colours not using CSS variables
**Severity:** Low
**Lines:** 32
`radial-gradient(ellipse at top, #1a1230 0%, #0d0d1a 60%)` uses raw hex values that match `--bg2` (#1a1230) and `--bg` (#0d0d1a) defined in the `:root` block. If those variables are ever updated, the body background won't change with them.
**Action:** Replace with `radial-gradient(ellipse at top, var(--bg2) 0%, var(--bg) 60%)`.

## Summary
Tiny section — only one finding. The background gradient duplicates values already captured in CSS variables, creating a silent inconsistency risk.
