# Patterns Review — Scryfall Fetch
Lines: 1088–1145 | File: public/mtg-commander.html

## Findings

### Cache key inconsistency: `.toLowerCase()` applied at every access point
**Severity:** Low
**Lines:** 1090, 1095, 1101, 1117, 1127, 1139
`.toLowerCase()` is applied to cache keys at every read and write site rather than once at normalisation time. This is verbose and risks a missed case if a new access site omits it.
**Action:** Normalise keys once when they enter the cache: in `fetchCard`, lowercase `name` at the start of the function. In `fetchCards`, lowercase `entry.name` before using it as a key.

### Duplicate `json.data` check
**Severity:** Low
**Lines:** 1114, 1121
`if (json.data)` is checked twice in sequence (lines 1114–1118, then again lines 1121–1128). The second check could be folded into the first.
**Action:** Combine both `json.data` loops into a single `if (json.data)` block.

### `startsWith` for partial name matching is fragile
**Severity:** Low
**Lines:** 1125
`c.name.toLowerCase().startsWith(entry.name.toLowerCase())` will alias cards whose names happen to start with the user-entered text (e.g. entering "Sol" would match "Sol Ring" but also "Soldier of Fortune"). This could silently cache the wrong card.
**Action:** Remove `startsWith` aliasing or restrict it to names that differ only by DFC suffix (` // `).

## Summary
Patterns are mostly consistent. Key improvements: normalise cache keys once per entry point, fold duplicate `json.data` guards, and remove the fragile `startsWith` partial-match aliasing.
