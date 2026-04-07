# Security Review — Stats Panel
Lines: 280–344 | File: public/mtg-commander.html

## Findings

### Unsanitized Scryfall data written via `innerHTML`
**Severity:** Medium
**Lines:** 1245–1251, 1261–1264, 1275–1283
`curveEl.innerHTML`, `pipsEl.innerHTML`, and `typeEl.innerHTML` are all set using template literals that embed values derived from Scryfall API responses (`card.type_line`, `card.colors`, `card.color_identity`, `card.cmc`). While Scryfall is a trusted third-party source, embedding external API values directly into `innerHTML` without escaping creates a stored-XSS surface if:
- A deck is imported from a saved JSON blob that has been tampered with (the `cards JSONB` column is user-controlled via the save/load flow).
- A future code path allows user-supplied card names or metadata to flow into these fields.

The `title="${colorCount[c]} cards"` attribute on `.pip` elements (line 1263) embeds a count (numeric, safe today), but the pattern of mixing data into attribute strings without escaping is fragile.
**Action:** Use `escapeHtml()` (already defined in the utility section at line ~2141) on any string value from card data before interpolating into `innerHTML`. Alternatively, build these DOM nodes with `createElement`/`textContent` instead of string templates.

### `style` attribute injection via `typeColors` lookup
**Severity:** Low
**Lines:** 1280
`style="width:${...}%;background:${typeColors[t]||'#555'}"` — the `typeColors` object is hardcoded, but the fallback `typeColors[t]` uses `t` as a key where `t = getCardType(c.data)` which ultimately comes from `card.type_line`. If `type_line` returned a value that matched a crafted key (e.g., via prototype pollution), a malicious color string could inject arbitrary CSS. In practice this is very low risk given the fixed `typeColors` keys, but the pattern should be noted.
**Action:** Ensure the inline `background` value is always one of the known hardcoded colors; the `||'#555'` fallback already covers unknown types safely.

## Summary
No critical XSS vectors exist today because Scryfall data is generally safe. The main concern is that the pattern of injecting API-derived strings into `innerHTML` without escaping is one tampered-save away from a stored-XSS. Applying `escapeHtml()` to string fields before interpolation would close the gap with minimal effort.
