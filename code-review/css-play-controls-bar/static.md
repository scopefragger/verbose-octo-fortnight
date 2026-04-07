# Static Review — Play Controls Bar
Lines: 567–580 | File: public/mtg-commander.html

## Findings

### `.library-badge` margin-left auto may be silently ignored
**Severity:** Low
**Lines:** 579
`margin-left: auto` on `.library-badge` only pushes it to the far right if the parent `.play-controls` is a flex container with no `flex: 1` child consuming the remaining space. If any sibling has `flex: 1` or `flex-grow`, the auto margin collapses to 0 and the badge no longer floats right — a silent layout misalignment rather than an error. The intent (right-align the library count) is clear but the mechanism is fragile.
**Action:** Verify no sibling inside `.play-controls` carries `flex: 1` or `flex-grow`. If the layout is stable, add a comment explaining the intentional use of `margin-left: auto`. If it is not reliable, wrap the right-side badges in a `margin-left: auto` flex group container instead.

### All CSS variables referenced are defined in `:root`
**Severity:** Low (informational — no issue)
**Lines:** 567–580
`--card-border`, `--red`, `--text-dim`, `--gold-light` are all defined at lines 15–23. No undefined variable references exist.
**Action:** None.

## Summary
The segment is largely clean. The one static concern is the fragility of `margin-left: auto` on `.library-badge` inside a flex row — it achieves right-alignment only when no other sibling consumes remaining space, but that assumption is not documented and could break silently.
