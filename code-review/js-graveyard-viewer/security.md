# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `escapeQuotes(card.name)` in `onclick` — correct tool but incomplete protection
**Severity:** Medium
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` uses `escapeQuotes` to protect the card name inside a single-quoted JS string in an HTML attribute. `escapeQuotes` escapes `'` to `\'` and `"` to `&quot;`. This prevents basic single-quote injection but does not handle backslash injection: a card name containing `\` followed by a single quote (`\'`) would produce `\\\'` which, in the onclick JS context, renders as `\'` — a literal backslash before an escaped quote, breaking the string. While Scryfall card names do not contain backslashes, this is a structural fragility.
**Action:** Use a `data-card-name` attribute approach with a delegated event listener, or ensure `escapeQuotes` also escapes backslashes.

### `escapeHtml` used for `alt` attribute — correct
**Severity:** Info
**Lines:** 2048
`alt="${escapeHtml(card.name)}"` correctly escapes the card name for an HTML attribute context. This is the right call.
**Action:** No action required.

### Zone title from hardcoded strings, not from `zone` param — no injection risk
**Severity:** Info
**Lines:** 2043
`zone === 'graveyard' ? '🪦 Graveyard' : '✨ Exile'` uses the zone parameter only as a boolean switch to select a hardcoded string. The zone parameter itself is never interpolated into HTML, so there is no injection risk here even if an unexpected value is passed.
**Action:** No action required.

## Summary
The primary concern is the `escapeQuotes` pattern for `onclick` card names — it is fragile against backslash sequences. The correct approach is to avoid embedding data in `onclick` strings and use `data-*` attributes with delegated listeners instead. The `alt` attribute escaping is correctly handled.
