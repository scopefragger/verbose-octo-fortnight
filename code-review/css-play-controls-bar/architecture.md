# Architecture Review — Play Controls Bar
Lines: 567–580 | File: public/mtg-commander.html

## Findings

### `.library-badge` is conceptually outside the "Play Controls Bar" responsibility
**Severity:** Low
**Lines:** 579
The description for this segment names the concerns as "turn counter, life total ± buttons, mana pool display, action buttons." A `.library-badge` (deck/library card count) is a game-state indicator closer to the battlefield display than to the control bar. Placing it in the same CSS block conflates two separate UI responsibilities: interactive controls and passive status readouts.
**Action:** No urgent change needed, but consider moving `.library-badge` styling into the Battlefield & Card Zones block (lines 581–636) or a dedicated "status indicators" section to keep CSS blocks aligned with their described responsibility.

### `.sep` is a generic name with narrow scope
**Severity:** Low
**Lines:** 572
`.sep` (a vertical separator bar) is styled inside `.play-controls .sep`, which correctly scopes it. However, the class name `.sep` is extremely generic — if a separator is ever needed in another panel, a new rule will be required or the existing one will be reused with mismatched sizing. This is a minor naming/reuse concern in a single-file app.
**Action:** Consider renaming to `.play-controls-sep` or using a more descriptive scoped name to prevent accidental reuse.

## Summary
The segment's main architectural issue is that `.library-badge` is a passive status element styled alongside interactive controls, which blurs the responsibility of this CSS block. The generic `.sep` class name is a low-risk coupling concern. Neither issue causes a runtime defect today but both could cause confusion during future expansion.
