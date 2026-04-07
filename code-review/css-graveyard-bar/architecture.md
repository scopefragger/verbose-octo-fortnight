# Architecture Review — Graveyard Bar
Lines: 696–706 | File: public/mtg-commander.html

## Findings
### `.grave-btn` shares visual DNA with `.focus-btn` without abstraction
**Severity:** Low
**Lines:** 701–706
`.grave-btn` and `.focus-btn` (lines 681–692) both implement the same "bordered pill button, dim-by-default, gold-on-hover" pattern — `background: none`, `border: 1px solid var(--card-border)`, `border-radius: 6px`, `color: var(--text-dim)`, `cursor: pointer`, `transition: all 0.15s`, `:hover { border-color: var(--gold); color: var(--gold); }`. These are currently expressed as two independent rule sets. Any future visual change to the shared pattern (e.g., adjusting the hover colour or transition timing) must be applied in both places.
**Action:** Extract a shared utility class (e.g., `.ui-btn`) that owns the common base styles, then keep `.grave-btn` and `.focus-btn` for their size/padding overrides only. This follows the single-responsibility principle for CSS components.

### Graveyard bar padding differs from adjacent bars without apparent reason
**Severity:** Low
**Lines:** 698, 710
`.grave-bar` uses `padding: 8px 14px` while `.play-hand-strip` (line 710) uses `padding: 10px 12px`. The asymmetric horizontal padding (14px vs 12px) appears incidental rather than intentional — there is no design comment explaining the difference. In a single-file app where many developers may modify the layout, these small inconsistencies accumulate into visual drift.
**Action:** Align padding values to a shared spacing scale or document the intentional difference with a comment.

## Summary
The segment is structurally simple — two class rules, eleven lines. The main architectural concern is duplication of the base button style between `.grave-btn` and `.focus-btn`; a shared utility class would reduce future maintenance burden. A minor spacing inconsistency with the adjacent hand-strip bar is worth normalising.
