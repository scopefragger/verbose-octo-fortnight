# Static Code Review — Panel Header & Deck Tabs
Lines: 117–143 | File: public/mtg-commander.html

## Findings

### CSS variable dependency without fallback
**Severity:** Low
**Lines:** 119, 128, 135, 138, 142, 143
All colour and border values depend on CSS custom properties (`--card-border`, `--gold`, `--text-dim`, `--text`). None provide a fallback value (e.g. `var(--gold, #c9a84c)`). If the variable is not defined — due to a failed load, a future refactor removing the declaration, or an unsupported browser — the property silently resolves to its initial value (often `transparent` or `inherit`), which can produce invisible or broken UI with no console warning.
**Action:** Add meaningful fallback values to each `var()` call, or add a lint/grep check that every `var()` reference has a corresponding `:root` declaration.

### `margin-bottom: -1px` negative margin trick is fragile
**Severity:** Low
**Lines:** 140
The active-tab underline is achieved by combining `border-bottom: 2px solid` on `.deck-tab` with `margin-bottom: -1px` to overlap the parent container's `border-bottom: 1px solid`. This works only when the parent's border is exactly 1px and the tab sits flush against it. Any change to the parent border width or padding will silently break the visual alignment.
**Action:** Document the coupling with an inline comment, or switch to a more robust technique (e.g. a pseudo-element or negative `bottom` offset on the parent border).

## Summary
The segment is clean and concise. The two static concerns are both low severity: missing CSS variable fallbacks (silent degradation risk) and a fragile negative-margin trick that couples `.deck-tab` layout to an exact 1px parent border.
