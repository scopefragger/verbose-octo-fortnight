# Code & Pattern Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `playDisabledStyle` and `playTitle` build inline style/attribute strings conditionally
**Severity:** Low
**Lines:** 1984–1985
`const playDisabledStyle = affordable ? '' : 'opacity:0.5;';` and `const playTitle = affordable ? '' : 'title="Not enough mana"'` build partial HTML attribute strings in JS. This approach is fragile — the title string contains HTML attribute syntax baked in. If the title string is ever extended, it's easy to introduce a quoting error.
**Action:** Use a disabled attribute or a CSS class for the affordability indicator instead of building partial attribute strings. For example, add a `disabled` attribute or `unaffordable` class and let CSS handle the `opacity`.

### Emoji characters used directly in button labels
**Severity:** Low
**Lines:** 1947, 1950, 1951
Buttons use raw emoji characters (`⟳`, `↷`, `↩`, `⬆`, `🪦`, `✨`) directly in the HTML string. These render fine in modern browsers but may cause display issues in environments with limited emoji support.
**Action:** No change needed for a modern browser target. Ensure the HTML file's charset is `UTF-8` (it should be).

### `focus-actions` innerHTML is built via template literal each time the panel opens
**Severity:** Low
**Lines:** 1946–1952, 1986–1991
The focus panel's action buttons are regenerated on every open. This is fine for correctness but rebuilds DOM that barely changes. A minor inefficiency.
**Action:** For the current scale this is acceptable. No change needed.

### Inconsistent use of `closeFocusPanel()` in onclick chains
**Severity:** Low
**Lines:** 1948–1951, 1989–1990
Some actions in the BF focus panel call `closeFocusPanel()` inline (e.g., `returnToHand(${idStr});closeFocusPanel()`), while others (like tap) do not. In the hand panel, `discardFromHand` and the close button both call `closeFocusPanel()`. This is a minor inconsistency.
**Action:** Consider closing the panel automatically after any action that removes the card from its current zone.

## Summary
Minor pattern issues throughout. The most impactful is the partial HTML attribute string construction for the affordability state, which should use a CSS class or `disabled` attribute instead. Emoji use and inline handler duplication are cosmetic concerns.
