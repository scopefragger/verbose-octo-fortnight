# Static Review — js-graveyard-viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Ternary defaults to exile for any non-`'graveyard'` input
**Severity:** Low
**Lines:** 2042–2043
```js
const cards = zone === 'graveyard' ? playGraveyard : playExile;
```
Any value of `zone` other than the exact string `'graveyard'` (e.g., a typo `'grave'`) silently shows the exile zone. The title on line 2043 has the same issue — a misspelled argument displays "✨ Exile" with no warning.
**Action:** Add an explicit guard or use a map: `const zoneMap = { graveyard: playGraveyard, exile: playExile }; if (!zoneMap[zone]) return;`. This makes unexpected values fail visibly rather than silently.

## Summary
Compact and correct for the expected inputs. The only issue is the silent fallback to exile for any unrecognised zone string — a simple input guard would prevent confusing silent failures.
