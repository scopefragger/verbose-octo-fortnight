# Static Review — Mobile Media Query
Lines: 542–548 | File: public/mtg-commander.html

## Findings

### CSS custom property `--card-border` assumed to be defined
**Severity:** Low
**Lines:** 544
`border-bottom: 1px solid var(--card-border)` references a CSS custom property. If `--card-border` is not declared on `:root` or a parent scope, the border will silently render as the initial value (`0px none transparent`). A quick audit confirms the property is expected to exist elsewhere in the stylesheet, but there is no fallback value provided in the `var()` call.
**Action:** Add a fallback: `var(--card-border, #444)` to make the intent explicit and guard against accidental omission.

### `.stats-panel` rule is a no-op reset
**Severity:** Low
**Lines:** 545
`.stats-panel { grid-column: auto; }` resets `grid-column` to its default value. Unless a wider-breakpoint rule sets a non-`auto` `grid-column` on `.stats-panel`, this declaration does nothing. Browsing the broader CSS confirms no such overriding rule exists for `.stats-panel`.
**Action:** Remove the declaration if it has no effect, or add a comment explaining what it is overriding and why.

## Summary
The block is largely clean. Two low-severity static issues exist: a missing fallback in a `var()` call that would silently fail if the custom property is ever absent, and a potentially dead `grid-column: auto` reset that adds noise without observable effect.
