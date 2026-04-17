# Patterns Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Inconsistent schema — `keywords` present only on some entries
**Severity:** Low
**Lines:** 1649, 1651, 1653, 1661
Four entries include `keywords: ['Flying']`; the remaining ten have no `keywords` property. This produces objects of inconsistent shape within the same array, which is an anti-pattern in JavaScript data arrays.
**Action:** Add `keywords: []` to all entries that lack it, or define a helper factory function to ensure uniform shape.

### Em dash (`—`) in type_line strings uses a Unicode literal
**Severity:** Low
**Lines:** 1648–1661
All `type_line` values use the em dash `—` (U+2014) embedded as a raw Unicode character in the source. This matches Scryfall's convention and is not incorrect, but it is easy to accidentally replace with a hyphen or en dash during editing.
**Action:** Add a comment `// em dash matches Scryfall type_line convention` near the first occurrence to prevent accidental character substitution.

### No JSDoc or type annotation for the token object shape
**Severity:** Low
**Lines:** 1647
The array contains objects with properties `name`, `power`, `toughness`, `type_line`, `colors`, and optionally `keywords`. No `@typedef` or JSDoc comment documents this shape, so IDEs cannot provide autocomplete and future maintainers must infer the schema from examples.
**Action:** Add a brief `@typedef` comment above `COMMON_TOKENS` documenting the expected token object shape.

### Colour grouping is implicit — tokens are not sorted by color identity
**Severity:** Low
**Lines:** 1648–1661
Tokens are roughly grouped by colour (White first, then Blue, Red, Black, Green, then colourless) but this ordering is not documented and is broken by `1/1 Thopter` appearing at the end despite being a colourless artifact creature alongside `Treasure`, `Food`, and `Clue`. The ordering will affect display order in the modal.
**Action:** Either sort consistently by color identity (WUBRG then colourless) and add a comment noting the sort order, or accept arbitrary order and remove the implicit grouping to avoid confusion.

## Summary
`COMMON_TOKENS` is clean and legible. The pattern issues are minor: inconsistent `keywords` presence, lack of a documented schema, and slight inconsistency in the colour ordering. None of these cause bugs in the current code, but they represent small maintenance debt.
