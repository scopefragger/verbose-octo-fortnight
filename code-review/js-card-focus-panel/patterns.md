# Patterns Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Emoji used as button labels without accessible text alternatives
**Severity:** Low
**Lines:** 1947–1951, 1989–1990
Action buttons use emoji as their visible labels (e.g. `⟳ Untap`, `↩ Hand`, `🪦 Graveyard`, `✨ Exile`). While readable for sighted users, they lack `aria-label` attributes, meaning screen readers will read out the raw emoji names (e.g. "headstone emoji"). This is a minor accessibility gap.
**Action:** Add `aria-label` attributes to each action button describing its function.

### `playDisabledStyle` and `playTitle` as string conditionals produce empty strings
**Severity:** Low
**Lines:** 1984–1985
`const playDisabledStyle = affordable ? '' : 'opacity:0.5;';` and `const playTitle = affordable ? '' : 'title="Not enough mana"'` are string-interpolated into the button tag at line 1987. Using an empty string for `style=""` and omitting `title` is valid HTML, but the `title=""` empty attribute vs no attribute distinction can matter for accessibility tools. The current implementation is functionally correct.
**Action:** Consider using a cleaner approach: set `style` conditionally via `classList` and set the `title` attribute via JavaScript after creation, rather than template-string injection.

### `selectHandCard` has an undocumented affordability check affecting button state
**Severity:** Low
**Lines:** 1973–1985
The play button's disabled state is visually indicated via `opacity:0.5` but the button is not actually `disabled`. A user can still click it and attempt to play a card they cannot afford. Whether `playHandCardFromFocus` enforces the affordability check is not visible in this section.
**Action:** Add `${affordable ? '' : 'disabled'}` to the play button and/or verify that `playHandCardFromFocus` re-checks affordability before executing.

## Summary
The card focus panel buttons have minor accessibility gaps (no `aria-label`) and the affordability indicator is visual-only — the button remains clickable. The pattern of building action HTML as template strings is consistent within the file but creates coupling between logic and presentation.
