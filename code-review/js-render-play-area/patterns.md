# Code & Pattern Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Heavy inline styles in `renderPlayHand` card cost badge
**Severity:** Medium
**Lines:** 1920
The mana cost badge rendered in `renderPlayHand` uses a long inline style string: `style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.75);color:...;font-size:0.5rem;border-radius:3px;padding:1px 3px;font-weight:700"`. This is presentation logic embedded in JavaScript, making it hard to find and maintain.
**Action:** Extract these styles into a CSS class (e.g., `.hand-cost-badge`) and apply it with a class attribute instead.

### `tokenColorClass` maps only the first color for multi-color tokens
**Severity:** Low
**Lines:** 1877–1880
Multi-color tokens (e.g., a gold token) are assigned only the CSS class for their first color. There is no handling for tokens with 2+ colors.
**Action:** Add a `tok-multi` class for tokens with 2 or more colors, matching common TCG display conventions.

### Magic strings for zone types
**Severity:** Low
**Lines:** 1871–1872
Zone strings `'perm'` and `'land'` are magic strings used in filter conditions. If a new zone type is added (e.g., `'enchantment'`), all filter locations must be updated by hand.
**Action:** Define zone constants: `const ZONE_PERM = 'perm'; const ZONE_LAND = 'land';`.

### `card.name?.split(',')[0]` for short name derivation
**Severity:** Low
**Lines:** 1886
Using `split(',')[0]` to shorten a card name (e.g., "Teferi, Hero of Dominaria" → "Teferi") is a clever heuristic but not reliable for all card names. Card names without commas return the full name, which is correct. Card names with multiple commas may produce a name that is too short.
**Action:** This is acceptable as a display shortcut, but add a comment explaining the heuristic.

## Summary
The rendering code is functional but uses heavy inline styles and magic strings for zones. Extracting the cost badge to a CSS class and defining zone constants would improve consistency and maintainability.
