# Architecture Review — Header
Lines: 37–65 | File: public/mtg-commander.html

## Findings

### `.header-back` button styles are orphaned — button is removed from HTML
**Severity:** Medium
**Lines:** 46–56
The `.header-back` class is styled here (border, hover state, transition) but in a previous session the back button was removed from the HTML. If the element no longer exists in the DOM, this is dead CSS that adds noise and could confuse future developers.
**Action:** Verify whether `.header-back` is still present in the HTML markup. If not, remove this rule block.

### Gradient end colour `#a070e0` has no CSS variable
**Severity:** Low
**Lines:** 60
The purple end of the title gradient (`#a070e0`) is a one-off colour with no variable. It appears nowhere else in the file.
**Action:** Either add `--purple: #a070e0` to `:root` or accept this as a decorative one-off and add a comment to that effect.

## Summary
The primary concern is the potentially orphaned `.header-back` CSS block for a button that may no longer exist. Worth a quick verification against the HTML markup before the next refactor pass.
