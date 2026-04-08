# Security Review — Deck List
Lines: 1289–1323 | File: public/mtg-commander.html

## Findings

### `escapeQuotes` used in `onclick` attribute — correct pattern
**Severity:** Informational
**Lines:** 1310
`onclick="showCardDetail('${escapeQuotes(c.name)}')"` correctly uses `escapeQuotes` to prevent the card name from breaking out of the single-quoted JS string in the onclick attribute. This follows the pattern documented in CLAUDE.md.
**Action:** No action needed.

### `escapeHtml` used for card name display — correct
**Severity:** Informational
**Lines:** 1312
`${escapeHtml(c.name)}` correctly escapes the card name before inserting into innerHTML. This is the correct XSS prevention pattern.
**Action:** No action needed.

### Card type from `getCardType` injected without escaping
**Severity:** Low
**Lines:** 1308
`<span>${type}</span>` injects the `type` variable into innerHTML without escaping. `type` comes from the hard-coded `order` array, so no active XSS risk — but if `type` were ever sourced from Scryfall data, this would be a vector.
**Action:** Add `esc(type)` for consistency, or add a comment noting `type` is always a hard-coded constant.

### `formatManaCost` output injected via innerHTML without escaping
**Severity:** Low
**Lines:** 1313
`${c.data?.mana_cost ? formatManaCost(c.data.mana_cost) : ''}` injects the result of `formatManaCost` (which processes a Scryfall `mana_cost` string) directly into innerHTML. `formatManaCost` strips `{...}` delimiters, leaving characters like letters and numbers. A maliciously crafted mana cost string from Scryfall could include `<`, `>`, or `"`.
**Action:** Apply `escapeHtml()` to the `formatManaCost` output.

## Summary
`escapeQuotes` and `escapeHtml` are correctly used for card names. Two low-severity gaps: hard-coded `type` string injected without escaping (safe but inconsistent), and `formatManaCost` output is injected without HTML escaping.
