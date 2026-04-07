# Architecture Review — Saved Decks Tab
Lines: 257–278 | File: public/mtg-commander.html

## Findings

### Style co-location with a single-file app limits maintainability
**Severity:** Low
**Lines:** 257–278
This segment sits inside a monolithic HTML file that mixes CSS, HTML, and JavaScript. The saved-decks tab styles are physically distant from the HTML structure they describe (HTML is around line 841) and from the JavaScript that populates the list (around line 1454). This is an architectural property of the whole file rather than a flaw unique to this segment, but it means a developer changing the saved-deck feature must context-switch across ~1200 lines.
**Action:** No immediate action required given the single-file app constraint. If the file grows further, consider extracting into a component or at minimum grouping CSS/HTML/JS comments with cross-reference line numbers.

### `.saved-deck-actions` flex container has no corresponding CSS for its children in this segment
**Severity:** Low
**Lines:** 277
The container is styled here but child button styles are presumably inherited from a generic button rule in another section. This is a split-responsibility pattern: the saved-decks section owns the layout but not the appearance of its interactive elements.
**Action:** Either co-locate the button styles within this section (using `.saved-deck-actions button { ... }`) or add a comment linking to the button class used.

## Summary
The segment is a small, coherent block of CSS. The only architectural concern is the inherent coupling of a single-file app — saved-deck styles, markup, and logic are spread across ~1200 lines. No render/mutation mixing or misplaced logic is present in this CSS-only segment.
