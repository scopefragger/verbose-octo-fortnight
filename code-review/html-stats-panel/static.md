# Static Review — Stats Panel
Lines: 847–873 | File: public/mtg-commander.html

## Findings

### Implicit dependency on sibling visibility logic
**Severity:** Low
**Lines:** 848, 851
`#stats-empty` and `#stats-content` are toggled by JavaScript using the inline `display:none` on line 851. There is no corresponding CSS class or `hidden` attribute; the initial hidden state is encoded entirely as an inline style. If JS fails before toggling, `#stats-content` is permanently hidden with no fallback. The pairing is a silent contract — nothing in the HTML signals which element governs which state.
**Action:** Add a CSS class (e.g. `.hidden`) and use `classList.toggle` in JS, or use the native `hidden` attribute so the relationship is semantically declared rather than encoded in an inline style.

### IDs are globally scoped with no namespace
**Severity:** Low
**Lines:** 853–856, 861, 865, 869
IDs `stat-cards`, `stat-avg-cmc`, `stat-lands`, `stat-nonlands`, `mana-curve`, `color-pips`, `type-breakdown` are all flat global IDs with no prefix. In a single-file app this is low risk today, but any future template duplication (e.g. player 2 stats, compare mode) would cause silent `getElementById` collisions.
**Action:** Add a consistent prefix (e.g. `stats-`) or migrate to `data-` attributes queried within a scoped container.

## Summary
The HTML is clean and minimal. The two low-severity issues are a fragile visibility toggle that relies on an inline style rather than a semantic state marker, and unnamespaced IDs that could silently collide if the panel is ever duplicated.
