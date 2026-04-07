# Code & Pattern Review — Sidebar Toggle Button
Lines: 95–115 | File: public/mtg-commander.html

## Findings

### Hard-coded gold colour repeated as a raw RGBA literal
**Severity:** Low
**Lines:** 101, 102, 114
The gold accent colour `rgba(201,168,76,...)` appears three times in this segment at different opacities (0.15, 0.3, 0.3). The same colour is referenced elsewhere in the file via the CSS custom property `var(--gold)` (which is used on line 109 for the text colour). The background and border colours should use `var(--gold)` with `opacity` or a CSS `color-mix()` approach, or at minimum a comment should note the relationship to `--gold`, so the values stay in sync if the palette changes.
**Action:** Replace `rgba(201,168,76,0.15)` and `rgba(201,168,76,0.3)` with `color-mix(in srgb, var(--gold) 15%, transparent)` / `30%`, or define additional custom properties (e.g. `--gold-15`) for reuse.

### Magic number `z-index: 10`
**Severity:** Low
**Lines:** 111
`z-index: 10` is an unexplained magic number. The file uses other z-index values (context menus, modals, toasts) without a documented stacking layer system. If a higher-z element is added in the play area, the toggle button could be obscured silently.
**Action:** Document the z-index stacking order at the top of the CSS block, or define named custom properties (e.g. `--z-sidebar-toggle: 10`) so intent is explicit.

### Inline `top: 50%` + `transform` pattern is not commented
**Severity:** Low
**Lines:** 98–99
The vertical-centering idiom `top: 50%; transform: translateY(-50%)` is standard and widely understood, but given that the surrounding code has no other uses of this pattern, a brief comment (e.g. `/* vertically centre on sidebar edge */`) would aid readability, especially because the `transform` appears immediately after two layout properties on a single line, making it easy to miss.
**Action:** Add a short inline comment, or break the `left`/`top` and `transform` onto separate lines to make the centering intent explicit.

### Ruleset for `:hover` state is a single-line rule separated from the base block
**Severity:** Low
**Lines:** 114
`.sidebar-toggle:hover` is written as a one-liner on line 114, separated from the main `.sidebar-toggle` block and the `.sidebar-collapsed .sidebar-toggle` rule on line 115. Grouping related state rules together (or using nesting, which modern CSS supports) would improve locality.
**Action:** Either keep all `.sidebar-toggle` rules adjacent and clearly grouped, or add blank lines between logically distinct groups with a comment separating the base style, hover state, and collapsed-state override.

## Summary
The segment is concise and readable, but relies on repeated raw RGBA literals that diverge from the established `var(--gold)` custom property, uses an undocumented magic `z-index`, and scatters related state rules (base, hover, collapsed) without clear visual grouping. None of these issues affect functionality but they erode maintainability over time.
