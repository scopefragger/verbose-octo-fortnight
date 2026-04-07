# Static Review — Play Hand Strip
Lines: 708–731 | File: public/mtg-commander.html

## Findings

### Undeclared CSS custom property dependency
**Severity:** Low
**Lines:** 710, 714, 715, 721, 725, 728
**Description:** The classes reference several CSS custom properties (`--card-border`, `--text-dim`, `--gold`, `--card`) without any fallback values. If these variables are not defined in a parent scope (e.g., `:root`), the properties silently fall back to their CSS initial values (typically `transparent` or `unset`), which could cause invisible borders, missing backgrounds, or unreadable text with no runtime error.
**Action:** Confirm all referenced variables are declared in `:root` or a reliable ancestor selector. Optionally add fallback values (e.g., `var(--card-border, #333)`) for defensive robustness.

### `.play-hand-card-text` is potentially dead if all cards have images
**Severity:** Low
**Lines:** 727–731
**Description:** `.play-hand-card-text` appears to be the fallback text card face (used when no image is available), but there is no corresponding sibling rule for the text-fallback path alongside `.play-hand-card img`. Without seeing the JS render logic it is hard to confirm these two are mutually exclusive. If the JS always renders an `<img>`, this rule is never exercised in practice.
**Action:** Cross-reference `renderPlayHand()` (lines 1858–1923) to confirm when `.play-hand-card-text` is emitted. If it is genuinely unused, remove it; if it is a fallback, add a comment clarifying its purpose.

## Summary
The segment is clean static CSS with no undefined references to non-variable identifiers. The two low-severity issues are reliance on custom properties without fallbacks and a potentially orphaned fallback class. Neither introduces a correctness bug under normal conditions.
