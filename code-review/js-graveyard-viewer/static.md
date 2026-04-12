# Static Code Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### No guard for an unknown `zone` argument
**Severity:** Low
**Lines:** 2042
The ternary `zone === 'graveyard' ? playGraveyard : playExile` silently falls through to `playExile` for any value that isn't `'graveyard'` — including `undefined` or a typo. If the caller passes a bad value, the modal will open showing exile contents with no error, which is confusing.
**Action:** Add an explicit guard or a default: `if (zone !== 'graveyard' && zone !== 'exile') return;` before the ternary, or use a `switch`/`Map` lookup that throws on unknown zone names.

### `img` src is an unescaped API-sourced URL
**Severity:** Low
**Lines:** 2048
`card.image_uris?.normal` is inserted directly into the `src` attribute of the `<img>` tag without escaping. While `src` is not a script execution vector in itself, a malformed URL could produce unexpected markup if it contains `"` characters, breaking out of the attribute.
**Action:** Pipe the URL through `escapeHtml()` (already available) before embedding in the template literal: `` `<img src="${escapeHtml(img)}" ...` ``.

### `grave-viewer-card-text` fallback div is inside `grave-viewer-card` wrapper but its content is not trimmed
**Severity:** Low
**Lines:** 2049
Card names from Scryfall are never trimmed before rendering. This is cosmetically minor, but it can add unwanted whitespace in the fallback text div.
**Action:** Use `card.name.trim()` when constructing the card object, or apply `.trim()` here for defensive hygiene.

## Summary
The function is short and straightforward. The main static concern is the missing guard for invalid `zone` arguments, which creates a silent fallback that could produce misleading UI. The unescaped image URL is a minor deficiency in defensive coding practice.
