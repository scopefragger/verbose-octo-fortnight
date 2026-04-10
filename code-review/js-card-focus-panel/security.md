# Security Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `mana_cost` injected into `focus-actions` innerHTML without escaping
**Severity:** Medium
**Lines:** 1983, 1987
`card.mana_cost` is injected directly into the innerHTML of `focus-actions` via the template literal on line 1983: `▶ Play ${card.mana_cost || ''}`. The mana cost string comes from the Scryfall API and is typically safe (e.g., `{2}{R}{G}`), but it is not escaped with `escapeHtml()`. If mana cost data ever contained HTML characters, this would be an XSS vector.
**Action:** Apply `escapeHtml(card.mana_cost)` before interpolating into the innerHTML template.

### `idStr` via `JSON.stringify` in onclick — potential attribute injection for string IDs
**Severity:** Medium
**Lines:** 1945–1951
`idStr = JSON.stringify(id)` is embedded into `onclick="tapCard(${idStr})"` attributes within an innerHTML string delimited by double quotes. If `id` is a string (UUID), `JSON.stringify` produces `"abc-123"` with double quotes, which breaks the HTML attribute boundary. This is a latent injection risk.
**Action:** If IDs are numeric, this is safe. If IDs can be strings, use single-quote delimited onclick strings and escape accordingly: `onclick='selectBFCard("${escapeQuotes(id)}")'`.

### `card.oracle_text` set via `textContent` — correctly safe
**Severity:** N/A
**Lines:** 1942, 1981
Oracle text is set via `.textContent`, not `.innerHTML`, which correctly prevents XSS even if the oracle text contains HTML-like characters. This is the right approach.

## Summary
Two medium-severity issues: `mana_cost` is interpolated into innerHTML without escaping, and `JSON.stringify` for string IDs in onclick attributes can break HTML attribute parsing. Both should be addressed for defence-in-depth even though Scryfall data is currently trusted.
