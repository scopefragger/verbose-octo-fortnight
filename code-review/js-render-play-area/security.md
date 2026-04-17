# Security Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfc.id` injected into `onclick` attribute without escaping
**Severity:** Medium
**Lines:** 1884, 1889, 1895
`bfc.id` is generated as `Date.now() + Math.random()` (lines 1718, 1844) — a floating-point number. `JSON.stringify` of a float produces something like `1713456789.123456`, which is safe to embed in a JS expression. However, if the ID generation strategy ever changes to include strings, hashes, or external data, the inline `onclick="selectBFCard(${idStr})"` pattern would become an XSS vector immediately.
**Action:** Document that `bfc.id` must always remain a numeric type (never a string sourced from external data), or refactor to use `data-id` attributes and a delegated event listener to eliminate the inline-JS pattern entirely.

### Card image URLs from Scryfall injected into `src` without validation
**Severity:** Low
**Lines:** 1890, 1913, 1918
Image URLs (`bfc.card.image_uris?.small`, `card.image_uris?.normal`) come from the Scryfall API and are injected directly into `src` attributes. While `src` injection cannot trigger script execution, a crafted URL with a `javascript:` scheme would be blocked by browsers in `img` src context. The risk is low given Scryfall is a trusted source, but the pattern is worth noting.
**Action:** No immediate action required given the trusted data source, but document that these URLs are assumed to be Scryfall-sourced HTTPS URLs.

### `escapeHtml()` is used correctly on all user-visible text
**Severity:** Low
**Lines:** 1891, 1892, 1897, 1901, 1917, 1918
All card name and text content interpolated into innerHTML uses `escapeHtml()`. This is correct.
**Action:** No action needed — this is a positive finding confirming correct XSS prevention for text content.

### Inline `style` attribute with dynamic colour string in `renderPlayHand()`
**Severity:** Low
**Lines:** 1920
The mana cost badge uses `color:${affordable?'#e8d870':'#e05555'}` — a ternary between two hard-coded hex literals. Neither value comes from external input, so there is no injection risk. The `costShort` variable comes from `formatManaCostShort(card.mana_cost)` which strips `{}` and slices to 10 chars; this output is injected without `escapeHtml()` but the function only passes through alphanumeric characters and `/`, so the risk is very low.
**Action:** Wrap `costShort` in `escapeHtml()` as a defence-in-depth measure to guard against any future change to `formatManaCostShort`'s output.

## Summary
The section handles escaping well for card names and text content. The main concern is the inline `onclick` pattern with `bfc.id` — safe today with numeric IDs but would become an XSS vector if the ID type changes. The `costShort` value injected into innerHTML without escaping is a low-risk gap worth closing.
