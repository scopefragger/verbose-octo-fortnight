# Security Review — Sidebar — Saved Decks Pane
Lines: 841–843 | File: public/mtg-commander.html

## Findings

### No direct data injection in static markup
**Severity:** Low
**Lines:** 841–843
The static HTML markup contains only placeholders and loading state text. The actual deck content is injected dynamically via `loadSavedDecks()` which runs at lines 1476–1497. Security depends entirely on the escaping functions used in that dynamic content generation.
**Action:** Verified that dynamic content at lines 1486–1490 properly uses `escapeHtml()` for deck names and commanders, and `escapeQuotes()` for onclick attributes. Security posture is sound.

### Reliance on downstream escaping functions
**Severity:** Medium
**Lines:** 841–843 (indirectly affects lines 1486–1490)
The static pane itself is secure, but the dynamic content injection mechanism relies on two custom escaping functions: `escapeHtml()` (line 2142) and `escapeQuotes()` (line 2145). The `escapeQuotes()` function uses single-quote escaping with backslash (`\'`) which may not work reliably in all contexts.
**Action:** Consider using HTML attribute encoding instead of backslash escaping for onclick attributes. The current implementation at line 1490 (`onclick="deleteSavedDeck('${d.id}', '${escapeQuotes(d.name)}')"`) is at risk if deck names contain edge-case quote patterns. Use `&quot;` exclusively for attribute values.

## Summary
The static markup is XSS-safe with no direct user data injection. Dynamic content loading is properly escaped, though the custom `escapeQuotes()` function has minor edge-case risks that should be addressed.
