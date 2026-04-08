# Architecture Review — Decklist Parser
Lines: 1071–1086 | File: public/mtg-commander.html

## Findings

### Pure function — correct separation of concerns
**Severity:** Informational
**Lines:** 1072–1086
`parseDecklist` is a pure function: it takes a string, returns an array, and has no side effects. It does not mutate global state or access the DOM. This is the correct architecture for a parser.
**Action:** No action needed.

### Set-code stripping logic embedded in parser
**Severity:** Low
**Lines:** 1082
The `.split('(')[0]` logic strips set codes (e.g. `Counterspell (6ED)`) and `.split('/')[0]` strips DFC back faces. These are domain-specific transformations that could reasonably live in a separate `normaliseCardName()` helper, making the parser easier to test and the transformations easier to adjust.
**Action:** Consider extracting `(m.length === 3 ? m[2] : m[1]).split('(')[0].split('/')[0].trim()` to a named `normaliseCardName(raw)` function.

## Summary
`parseDecklist` is architecturally clean as a pure function. The only suggestion is to extract the card-name normalisation into its own named helper.
