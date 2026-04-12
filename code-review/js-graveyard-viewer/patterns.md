# Patterns Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Inline style on the empty-state div
**Severity:** Low
**Lines:** 2052
The empty-state fallback uses `style="color:var(--text-dim);font-size:0.85rem"`. Other empty-state elements in the file use CSS classes rather than inline styles, and the `--text-dim` variable is already part of the design system.
**Action:** Define a CSS class (e.g., `.zone-empty-state`) with these rules and apply it here instead, consistent with how other empty states are handled.

### `img` tag missing `loading="lazy"`
**Severity:** Low
**Lines:** 2048
Other image renderers in the same file (e.g., hand cards at line 1426, battlefield cards at line 1918) include `loading="lazy"` on their `<img>` tags. The graveyard viewer omits it.
**Action:** Add `loading="lazy"` to the `<img>` element to be consistent and avoid unnecessarily eager loads when the modal is opened.

### Zone label strings are magic literals used in two places
**Severity:** Low
**Lines:** 2042–2043
The string literals `'graveyard'` and `'exile'` appear in both the zone-to-array lookup and the title text assignment. Any future addition of a third zone requires changes in multiple spots.
**Action:** Define a small zone config map (even just a plain object) to consolidate zone names, their arrays, and their display labels. This also makes adding a third zone (e.g., command zone) a one-line change.

### Emoji in display label is hardcoded, not a constant or configurable value
**Severity:** Low
**Lines:** 2043
The gravestone and sparkle emojis (`🪦`, `✨`) are embedded as raw string literals in the rendering logic. Other zone labels in the app appear to use plain text.
**Action:** Minor — consider moving the label strings (including emojis) to a config object alongside the zone arrays so labels and icons are co-located and easy to update.

### Pattern is consistent with sibling render functions
No deviations from the patterns used by `showBattlefield()`, `renderHand()`, and similar functions — the optional-chaining fallback for `card_faces` images is applied consistently.

## Summary
The function follows the prevailing render patterns in the file well. The main improvement opportunities are the inline style (inconsistent with CSS-class-based empty states elsewhere) and the missing `loading="lazy"` attribute. Consolidating the zone string literals into a config object would improve maintainability as the feature set grows.
