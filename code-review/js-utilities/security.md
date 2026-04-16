# Security Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` is incomplete for HTML attribute contexts — creates latent XSS vulnerability
**Severity:** High
**Lines:** 2142–2144
`escapeHtml` does not escape `"` or `'`. When used inside a double-quoted HTML attribute (e.g. `alt="${escapeHtml(card.name)}"`, `title="${escapeHtml(...)}"`) a card name containing `"` would close the attribute and allow injection of arbitrary HTML attributes, including event handlers.

Current uses in the file:
- `alt="${escapeHtml(card.name)}"` — segment 21, line 2048 (vulnerable to a `"` in card name)
- `alt=""` in segment 22 (safe, static)
- Text content uses via `.textContent` (safe regardless)

Since Scryfall card names are controlled data, the immediate risk is low, but the function's name (`escapeHtml`) implies it is safe for all HTML contexts, which it is not.
**Action:** Either (a) add `"` and `'` escaping to `escapeHtml` to make it safe for all HTML contexts, or (b) rename the function to `escapeHtmlText` and document that it is only safe for text node content. Add a separate `escapeHtmlAttr` for attribute values.

### `escapeQuotes` is the wrong tool for its primary use case — creates XSS risk in `onclick` attributes
**Severity:** High
**Lines:** 2145–2147
As detailed in security reviews for segments 21 and 22, `escapeQuotes` is used to embed user/API data as JavaScript string arguments inside `onclick="..."` HTML attributes. The function:
- Escapes `'` as `\'` — a JS escape, but one that the HTML parser processes first as two literal characters, meaning the `'` is NOT escaped in the HTML layer
- Escapes `"` as `&quot;` — correct for HTML attributes, but when decoded and evaluated as JS, the `"` is unescaped and can close a double-quoted JS string

This means the escaping is simultaneously wrong for both HTML and JS contexts. A card name like `O'Brien` would produce `onclick="fn('O\'Brien')"` — the `\'` is two characters in HTML, so the JS engine sees `fn('O\` then `Brien')` which is a syntax error. A card name like `A"B` would produce `onclick="fn('A&quot;B')"` which after HTML decode is `fn('A"B')` — a string containing a double-quote inside single-quoted JS, which is safe in this specific case but demonstrates the unpredictable interaction.

**Action:** Remove all uses of `escapeQuotes` in `onclick` contexts. Use `data-*` attributes with delegated event listeners (see architecture reviews for segments 21–22). If inline onclick must be retained, use `JSON.stringify(str)` wrapped in `escapeHtml` for the value: `onclick="fn(${escapeHtml(JSON.stringify(name))})"`.

### `showToast` accepts arbitrary `msg` string — rendered via `.textContent` (safe)
**Severity:** Low
**Lines:** 2151–2152
`el.textContent = msg` is safe regardless of what `msg` contains. No XSS risk here.
**Action:** No action required.

### No secrets or credentials present in this section
**Severity:** Low
**Lines:** 2141–2156
No API keys, tokens, or sensitive data are handled in the utilities section.
**Action:** No action required.

## Summary
This utilities section is the root cause of the XSS risks flagged in multiple earlier segment reviews. Both `escapeHtml` (missing quote escaping) and `escapeQuotes` (wrong context, mixed escaping strategy) are defective for their actual use cases. Fixing these two functions — or replacing the inline-onclick pattern that depends on them — is the highest-priority security action across the entire file.
