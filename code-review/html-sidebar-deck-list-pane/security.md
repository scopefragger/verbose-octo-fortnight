# Security Review — Sidebar Deck List Pane
Lines: 832–838 | File: public/mtg-commander.html

## Findings

### Inline `onclick` attribute uses `escapeQuotes` for an `innerHTML`-built handler — partial protection
**Severity:** Medium
**Lines:** 837 (populated by renderDeckList, line 1310)
`deck-list-content` is not itself authored in lines 832–838, but the container that receives dynamic `innerHTML` content is declared here. `renderDeckList()` builds card entry rows with `onclick="showCardDetail('${escapeQuotes(c.name)}')"`. `escapeQuotes` escapes single quotes and double quotes, but it does not prevent an attacker from injecting arbitrary JavaScript if a card name somehow contains a sequence that breaks out of the JS string context in a way `escapeQuotes` doesn't cover (e.g. backtick characters, or a crafted Scryfall API response containing `\n` or `\r` followed by a new attribute). The card name is sourced from Scryfall, which is generally trustworthy, but the trust chain relies entirely on the third-party API never returning a hostile value. The card name is correctly HTML-escaped with `escapeHtml` for the visible text, but the `onclick` attribute string is a distinct attack surface.
**Action:** Replace the inline `onclick` attribute pattern with `addEventListener` after setting `data-cardname` on the element. This removes user/API-controlled data from the JS execution context entirely and eliminates the escaping problem at its root.

### `formatManaCost` output inserted unescaped into innerHTML
**Severity:** Low
**Lines:** 837 (populated by renderDeckList, line 1313)
`c.data?.mana_cost` is passed through `formatManaCost` (line 1321–1323), which does a regex replace and slice but performs no HTML escaping. The result is then interpolated directly into the template literal assigned to `el.innerHTML`. If Scryfall's `mana_cost` field ever contained `<`, `>`, or `&` characters (e.g., `{W/U}` is safe, but a malformed API response need not be), raw HTML would be injected. The risk is low given the Scryfall source, but the pattern is unsound.
**Action:** Pass `formatManaCost` output through `escapeHtml` before interpolating it into the HTML template.

## Summary
Neither finding represents an immediately exploitable vulnerability under normal Scryfall API behaviour, but both patterns would become XSS vectors if the API response were ever compromised or spoofed. The inline-`onclick` / `escapeQuotes` pattern is the higher-priority concern because it places API-sourced data directly into a JavaScript execution context; replacing it with `addEventListener` + `data-` attributes is the correct architectural fix.
