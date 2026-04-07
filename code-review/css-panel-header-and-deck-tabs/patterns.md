# Code & Pattern Review — Panel Header & Deck Tabs
Lines: 117–143 | File: public/mtg-commander.html

## Findings

### Magic numbers for spacing and typography
**Severity:** Low
**Lines:** 118, 122, 127, 132, 137
Numeric literals appear throughout without explanation: padding values `14px 16px 10px`, `10px 16px 0`, font sizes `0.8rem` and `0.85rem`, letter-spacing `1.5px`, tab padding `7px 14px`, and gap `4px`. These are consistent with values used elsewhere in the file, but none are referenced via a shared spacing scale or typography token. A future reskin or density change requires hunting for each occurrence individually.
**Action:** Consider extracting repeated spacing and type-scale values into CSS custom properties (e.g. `--space-md`, `--font-sm`) alongside the existing colour tokens.

### `transition: all 0.2s` on `.deck-tab`
**Severity:** Low
**Lines:** 139
Using `transition: all` is a common anti-pattern: it applies transitions to every animatable property, including layout-affecting ones like `width`, `height`, and `padding`, which can cause janky repaints and unexpected animations if those properties ever change. Only `color` and `border-bottom-color` are actually being transitioned here.
**Action:** Replace with `transition: color 0.2s, border-bottom-color 0.2s` to be explicit and avoid accidental paint/layout transitions.

### Long single-line rule for `.panel-header h2`
**Severity:** Low
**Lines:** 122
The `h2` descendant rule packs five declarations onto one line. While compact, this makes individual properties harder to locate during a diff or code review and is inconsistent with the multi-line style used for every other rule in the block.
**Action:** Expand to multi-line format for consistency with surrounding rules.

## Summary
The segment follows the project's established CSS conventions and is readable. Three low-severity pattern issues are present: magic spacing/type-scale numbers that could be tokenised, an overly broad `transition: all` that should target specific properties, and one single-line rule that breaks the multi-line formatting convention used everywhere else.
