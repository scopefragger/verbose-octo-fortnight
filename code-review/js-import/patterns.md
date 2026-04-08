# Patterns Review — Import
Lines: 1147–1194 | File: public/mtg-commander.html

## Findings

### Hard-coded string `'Load Deck'` repeated
**Severity:** Low
**Lines:** 1157, 1166
The string `'Load Deck'` appears twice as the button reset text. If the button label changes, both occurrences must be updated.
**Action:** Store in a variable or use the original `textContent` captured before mutation.

### Inline `style.display` assignments mixed with class-based visibility
**Severity:** Low
**Lines:** 1173, 1174, 1188, 1189, 1192, 1193
`style.display = 'none'` and `style.display = ''` are used alongside class-based `classList.toggle('hidden', ...)` elsewhere in the file. Mixing two visibility patterns makes the code harder to maintain.
**Action:** Standardise on the `hidden` CSS class for element visibility throughout the file.

### Pluralisation inline — minor
**Severity:** Low
**Lines:** 1159
`` `${entries.length} card${entries.length !== 1 ? 's' : ''}` `` is an inline ternary for pluralisation. This pattern is repeated elsewhere in the file.
**Action:** Extract to a utility: `plural(n, word)` => `` `${n} ${word}${n !== 1 ? 's' : ''}` ``.

## Summary
Import and clear logic works correctly. Patterns findings are low severity: hard-coded button label, mixed visibility strategies (`style.display` vs `hidden` class), and duplicated inline pluralisation.
