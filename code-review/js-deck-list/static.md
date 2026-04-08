# Static Review — Deck List
Lines: 1289–1323 | File: public/mtg-commander.html

## Findings

### `'Commander'` in type order never assigned by `getCardType`
**Severity:** Medium
**Lines:** 1301
The `order` array includes `'Commander'` as a type, but `getCardType` never returns `'Commander'` — it returns `'Creature'`, `'Land'`, `'Instant'`, `'Sorcery'`, `'Enchantment'`, `'Artifact'`, `'Planeswalker'`, or `'Other'`. Commander cards will always be grouped under `'Creature'` or `'Other'`. This entry in `order` is dead.
**Action:** Either remove `'Commander'` from `order`, or add logic to `getCardType` to detect commander cards (via `type_line.includes('Legendary') && type_line.includes('Creature')`) and return `'Commander'`.

### `c.data` accessed without null guard in sort comparator
**Severity:** Low
**Lines:** 1305
`getCardCMC(a.data)` and `getCardCMC(b.data)` receive `c.data` which may be `null` for cards Scryfall didn't find. `getCardCMC` does handle `null` with `if (!card) return 0`, so this is safe — but only because of that guard.
**Action:** No code change needed; add an inline comment noting null handling is delegated to `getCardCMC`.

### `formatManaCost` strips mana symbols instead of rendering them
**Severity:** Low
**Lines:** 1321–1322
`formatManaCost` removes `{` and `}` delimiters and truncates to 12 characters, leaving raw symbol text like `2WW`. This is intentional but produces plain text rather than rendered pip icons. Compare with `formatManaCostShort` in section 23 (Utilities) which may do the same or different thing.
**Action:** Verify `formatManaCost` and `formatManaCostShort` are not duplicates. If they serve the same purpose, consolidate.

## Summary
The main static finding is the dead `'Commander'` type in the order array. The `formatManaCost` function may be a duplicate of `formatManaCostShort` defined in section 23.
