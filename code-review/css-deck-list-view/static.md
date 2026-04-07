# Static Review — Deck List View
Lines: 500–535 | File: public/mtg-commander.html

## Findings

### Undeclared CSS custom property `--gold-light`
**Severity:** Medium
**Lines:** 532
`.card-entry .qty` references `var(--gold-light)`. If this variable is not defined in the `:root` block elsewhere in the file, it silently falls back to the browser default (typically transparent/inherit), making quantity text invisible or unstyled without any warning.
**Action:** Audit the `:root` variable declarations to confirm `--gold-light` is defined; if it is missing, add it alongside `--gold`.

### Undeclared CSS custom properties `--text` and `--text-dim`
**Severity:** Low
**Lines:** 533–534
`.card-entry .cname` and `.card-entry .mana` rely on `var(--text)` and `var(--text-dim)` respectively. Same silent-failure risk as above if either is absent.
**Action:** Confirm both variables exist in the global `:root`; document them if they do.

### Class name `.cname` is an abbreviation with low readability
**Severity:** Low
**Lines:** 533
The class `.cname` is a terse abbreviation for "card name". It is not inherently broken but reduces grep-ability and self-documentation; `.card-name` is consistent with the existing `.card-entry`, `.card-type-section`, and `.card-type-header` naming pattern.
**Action:** Rename `.cname` to `.card-name` throughout CSS and corresponding JS/HTML template literals.

## Summary
The section is mostly well-structured CSS. The primary static concern is reliance on three CSS custom properties (`--gold-light`, `--text`, `--text-dim`) whose definitions live outside these lines; a missing variable would silently break colour rendering. The `.cname` abbreviation also breaks the otherwise consistent BEM-style naming used in surrounding rules.
