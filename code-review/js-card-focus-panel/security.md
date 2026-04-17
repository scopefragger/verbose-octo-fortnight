# Security Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Numeric `id` and `idx` in `onclick` attributes — safe today, fragile by pattern
**Severity:** Medium
**Lines:** 1947–1951, 1988–1989
Action buttons are wired with inline `onclick` using `idStr` (a JSON-serialised float, e.g. `1713456789.123`) and raw `idx` (an integer). Both are safe as long as IDs remain numeric. However, this inline-JS pattern is a footgun: if IDs ever become UUIDs or strings sourced from external data, the injection surface opens immediately. The `closeFocusPanel()` calls chained after actions (e.g. `onclick="sendToGrave(${idStr});closeFocusPanel()"`) compound this — the semi-colon-separated multi-statement form is particularly error-prone to escape correctly.
**Action:** Refactor action buttons to use `data-id` and `data-action` attributes with a single delegated event listener, eliminating all inline JS from the generated HTML.

### `card.name`, `card.mana_cost`, `card.type_line`, `card.oracle_text` injected via `textContent` — safe
**Severity:** Low
**Lines:** 1939–1942, 1978–1981
All card text fields are set via `.textContent` (not `innerHTML`), which is inherently XSS-safe regardless of the card data content. This is correct.
**Action:** No action needed — positive finding.

### `playLabel` string interpolated into `innerHTML` without escaping
**Severity:** Medium
**Lines:** 1983, 1987
`playLabel` is built as `` `▶ Play ${card.mana_cost || ''}` ``. `card.mana_cost` comes from the Scryfall API (e.g. `{2}{W}{U}`) and is interpolated directly into the `innerHTML` of `focus-actions` without `escapeHtml()`. A crafted mana cost string containing `<script>` or `"onclick=` would be injected as raw HTML.
**Action:** Wrap `card.mana_cost` with `escapeHtml()` when building `playLabel`, or set the button's `textContent` separately after inserting the button skeleton.

### `playTitle` attribute string built from an unescaped literal
**Severity:** Low
**Lines:** 1985
`playTitle` is either an empty string or the literal `title="Not enough mana"` — this is a hard-coded string and poses no injection risk. However, the pattern of conditionally building attribute strings as raw text is fragile; if `playTitle` were ever derived from user/API data it would need escaping.
**Action:** No immediate action required. If this pattern is extended to include dynamic content, use `escapeHtml()` on the attribute value.

### `img` URL from Scryfall set as `focus-img.src` directly
**Severity:** Low
**Lines:** 1935, 1937, 1972, 1976
Scryfall image URLs are assigned to `img.src` without validation. In an `img` src context, `javascript:` URLs are inert in modern browsers, and Scryfall is a trusted HTTPS source. Risk is low.
**Action:** No immediate action needed; document the trust assumption.

## Summary
The most significant security issue is `card.mana_cost` being interpolated into `innerHTML` without `escapeHtml()` when building `playLabel`. All other text content is correctly handled via `textContent`. The inline-onclick pattern with numeric IDs is safe today but should be refactored to `data-` attributes to avoid a latent injection surface.
