# Patterns Review — Deck List
Lines: 1289–1323 | File: public/mtg-commander.html

## Findings

### `type` string used both as grouping key and display label
**Severity:** Low
**Lines:** 1294, 1308
`grouped[t]` uses `getCardType` return values as object keys AND as display labels. If display labels need to be different from grouping keys (e.g. `'Creature (42)'` style labels), this conflation makes changes harder.
**Action:** This is fine for the current design; document the intent.

### `formatManaCost` truncates to 12 chars — magic number
**Severity:** Low
**Lines:** 1322
`.slice(0, 12)` is a hard-coded truncation limit with no comment explaining why 12 was chosen (likely to prevent long mana costs from overflowing the UI).
**Action:** Extract to a constant `const MAX_MANA_DISPLAY = 12` and add a comment.

### Empty state message uses `innerHTML` for static string
**Severity:** Low
**Lines:** 1292
`el.innerHTML = '<div class="empty-saved">No deck loaded yet.</div>'` uses `innerHTML` for a fully static string. This is safe but inconsistent with using `textContent` elsewhere.
**Action:** Use `el.textContent` with a wrapper element, or keep as-is and note it's static content.

## Summary
Deck list rendering is clean and well-structured. Patterns findings are low severity: magic truncation constant, dual use of type strings as keys and labels, and a minor `innerHTML` vs `textContent` inconsistency.
