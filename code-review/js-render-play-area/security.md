# Security Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `power` and `toughness` injected into innerHTML without escaping
**Severity:** High
**Lines:** 1898
`bfc.card.power` and `bfc.card.toughness` are interpolated directly into an `innerHTML` string. Although the values typically come from Scryfall's API, any intermediary storage (e.g. tokens the user created manually) could introduce arbitrary strings. A malicious or corrupted value such as `<img src=x onerror=alert(1)>` would execute as script.
**Action:** Always escape all data originating outside the application before injecting into innerHTML. Apply `escapeHtml(String(bfc.card.power))` and `escapeHtml(String(bfc.card.toughness))`.

### `type_line` split result injected into innerHTML without escaping
**Severity:** Medium
**Lines:** 1899
The extracted subtype string (`bfc.card.type_line?.split('—')[1]?.trim() || 'Token'`) is inserted into innerHTML without `escapeHtml()`. Token type lines from user-created tokens could contain HTML characters.
**Action:** Wrap the entire expression with `escapeHtml(...)` before interpolation.

### Inline `onclick` with `JSON.stringify` id — potential attribute injection
**Severity:** Low
**Lines:** 1884, 1889, 1895
`JSON.stringify(bfc.id)` produces a JSON-encoded string (e.g. `"abc-123"`) embedded directly in an `onclick` attribute. If `bfc.id` were ever non-UUID (e.g. user-controlled input smuggled in), the JSON encoding might not neutralise all injection vectors in an HTML attribute context. The `escapeQuotes` utility in this file is specifically designed for this pattern.
**Action:** Use `escapeQuotes(String(bfc.id))` in the onclick template to be consistent with the established security pattern in this codebase.

### `img` src set directly from API data
**Severity:** Low
**Lines:** 1890, 1913, 1918
Image URLs from `image_uris.small` / `image_uris.normal` are inserted directly into `src` attributes without validation. A crafted URL using `javascript:` protocol could theoretically be used (though browsers mostly block this for `src`). More practically, a data-URI could load unexpected content.
**Action:** Low priority for `src` attributes in modern browsers, but consider validating that image URLs start with `https://` before rendering.

## Summary
The most significant finding is the unescaped injection of `power`, `toughness`, and `type_line` subtype into innerHTML — these are data values that can originate from user-created tokens and should always be escaped. The onclick id injection via `JSON.stringify` should be migrated to the `escapeQuotes` utility already present in this file.
