# Static Code Review — Saved Decks Tab
Lines: 257–278 | File: public/mtg-commander.html

## Findings

### `.saved-deck-actions` has no button/child selector defined in this block
**Severity:** Low
**Lines:** 277
The `.saved-deck-actions` flex container is declared here, but no styles for the action buttons it contains (e.g. `.saved-deck-actions button` or a dedicated class) appear in this segment. If action buttons rely solely on a global button rule elsewhere, future changes to that global rule can silently break the saved-decks UI. There is no null-guard at the CSS level, but the real risk is the gap between the container declaration and its children's styles living in an unrelated block.
**Action:** Add child button styles adjacent to `.saved-deck-actions`, or document the shared class name relied upon so the coupling is explicit.

### `.saved-area.hidden` uses `display: none` via class toggle — no matching `.hidden` definition for other elements
**Severity:** Low
**Lines:** 263
The `.hidden` modifier is applied specifically to `.saved-area` here but likely used on sibling panels too. If a different segment defines `.hidden { display: none }` globally, this compound selector is redundant. If no global rule exists, then only `.saved-area` gets hidden correctly while siblings with just `.hidden` would not be hidden.
**Action:** Verify whether a global `.hidden` rule exists; if so, remove the compound selector as dead code. If not, define `.hidden` globally once and remove per-component overrides.

## Summary
The segment is mostly clean CSS with no hard logic errors. The two low-severity issues relate to an undocumented dependency on child button styles defined elsewhere and potential redundancy or gap in the `.hidden` utility class pattern.
