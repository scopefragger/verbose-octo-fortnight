# Static Code Review — Toast Notifications
Lines: 469–486 | File: public/mtg-commander.html

## Findings

### Hardcoded background color not using a CSS variable
**Severity:** Low
**Lines:** 474
The `background: #1a2a3a` value is a raw hex literal while all other colour values in the rule (border, color) use CSS custom properties (`var(--gold)`, `var(--text)`). This is inconsistent and means the toast background will not respond if the theme palette is changed.
**Action:** Extract `#1a2a3a` to a CSS variable (e.g., `--surface` or `--panel-bg`) and reference it here, matching the pattern used everywhere else.

### No `.toast.error` text/icon contrast reinforcement
**Severity:** Low
**Lines:** 486
`.toast.error` only changes the border colour; the background and text remain the same as the default state. Users with colour-vision deficiency may not perceive the red border as a meaningful state change, and there is no programmatic indicator (e.g., `role="alert"`) in the CSS to differentiate severity.
**Action:** Consider also adjusting the background tint or adding an `::before` pseudo-element icon for the error variant to make the distinction more robust.

### `transition: all 0.3s` is overly broad
**Severity:** Low
**Lines:** 483
Using `transition: all` will animate any future property added to `.toast` (padding, font-size, border-width, etc.), which can cause unexpected visual glitches and forces the browser to evaluate all animatable properties on each frame.
**Action:** Restrict to the properties that actually animate: `transition: transform 0.3s, opacity 0.3s`.

## Summary
The CSS block is compact and functional. The main static concerns are a single hardcoded colour that breaks the CSS-variable convention used throughout the rest of the file, an overly broad `transition: all`, and a low-contrast error state that relies solely on border colour.
