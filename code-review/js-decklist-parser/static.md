# Static Review — Decklist Parser
Lines: 1071–1086 | File: public/mtg-commander.html

## Findings

### Fallback regex captures entire line including leading whitespace
**Severity:** Low
**Lines:** 1079
The fallback pattern `line.match(/^(.+)$/)` matches any non-empty line after trimming, including malformed entries like `/// comment`, separator lines (e.g. `---`), and section headers (e.g. `Sideboard`). The `//` and `#` guards on line 1077 only catch those exact prefixes; other common deck-list conventions (blank section headers, `SB:`, `1x`) may pass through.
**Action:** Add guards for common section header patterns, or document which formats are explicitly supported/rejected.

### `parseInt` without radix
**Severity:** Low
**Lines:** 1081
`parseInt(m[1])` is called without a radix argument. While leading zeros are unlikely in card quantities, `parseInt('08')` returns 8 in modern engines but was 0 in older ones. Best practice is `parseInt(m[1], 10)`.
**Action:** Use `parseInt(m[1], 10)` or `Number(m[1])`.

### Double-fallback for zero quantity (`qty || 1`)
**Severity:** Low
**Lines:** 1083
`qty || 1` is a fallback for `parseInt` returning `NaN` or `0`. Since the quantity is already captured by `\d+` in the regex, `parseInt` should never return `NaN` here. The guard is redundant but harmless.
**Action:** No action required, but a comment would clarify intent.

### `/` split strips DFC (double-faced card) names
**Severity:** Medium
**Lines:** 1082
`.split('/')[0]` strips the back face from double-faced card names like `Delver of Secrets // Insectile Aberration`. Scryfall accepts the full name (`Delver of Secrets // Insectile Aberration`) as well as just the front face. Silently dropping the back face is correct for lookup purposes but should be documented.
**Action:** Add a comment: `// DFC names use ' // ' — keep only front face for Scryfall lookup`.

## Summary
The parser is functional and handles the common `1 Card Name` and `1x Card Name` formats. Key concerns are the DFC name stripping (medium, undocumented), the fallback regex being too permissive, and the missing radix in `parseInt`.
