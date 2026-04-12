# Security Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `src` attribute populated with unescaped API data
**Severity:** Medium
**Lines:** 1890, 1918
`img` originates from `bfc.card.image_uris?.small` or `card.image_uris?.normal`, which are strings fetched from the Scryfall API and stored verbatim in the Supabase database (via `saveDecklist`). These strings are injected directly into `src="..."` HTML attributes without escaping. If a malicious or corrupted database record contained a value like `" onload="alert(1)` or a `javascript:` scheme, it could execute arbitrary script.
**Action:** Wrap image URIs with `escapeHtml()` before interpolating into `src` attributes: `src="${escapeHtml(img)}"`. Also validate that the URI begins with `https://` before use, or strip it if it does not.

### `power` and `toughness` values interpolated without escaping
**Severity:** Medium
**Lines:** 1898
Token `power` and `toughness` values come from the token definitions stored in the database (or from `TOKEN_DEFINITIONS`). They are interpolated directly into innerHTML with no `escapeHtml()` call. If these strings ever contain `<`, `>`, or `"` characters (e.g. `"*"` or `"1+*"`) the browser will parse them as raw markup.
**Action:** Wrap both fields: `` `${escapeHtml(String(bfc.card.power))}/${escapeHtml(String(bfc.card.toughness))}` ``.

### `type_line` split result interpolated without escaping
**Severity:** Medium
**Lines:** 1899
`bfc.card.type_line?.split('—')[1]?.trim()` is inserted into innerHTML without escaping. Type lines from Scryfall are not user-supplied, but they are stored in the database and could contain angle brackets or quotes in edge cases.
**Action:** Wrap with `escapeHtml()`: `escapeHtml(bfc.card.type_line?.split('—')[1]?.trim() || 'Token')`.

### Inline mana cost color style derived from API data
**Severity:** Low
**Lines:** 1920
The `affordable` boolean controls which of two hardcoded colour strings (`#e8d870` or `#e05555`) appears in an inline style. This is safe as neither value comes from user/API input. No action needed beyond the note below about magic strings.

## Summary
Three medium-severity XSS vectors exist where API-sourced strings (image URIs, power/toughness, type line) are injected into innerHTML attributes without escaping. All are easily remediated by passing the values through the already-available `escapeHtml()` utility. The rest of the section correctly uses `escapeHtml()` for card names.
