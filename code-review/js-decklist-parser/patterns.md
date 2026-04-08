# Patterns Review — Decklist Parser
Lines: 1071–1086 | File: public/mtg-commander.html

## Findings

### Dual-regex fallback makes intent unclear
**Severity:** Low
**Lines:** 1079
`const m = line.match(/^(\d+)x?\s+(.+)$/) || line.match(/^(.+)$/)` uses `||` to chain two regexes. The comment says `"1 Card Name", "1x Card Name", "Card Name"` but the fallback regex actually matches any non-empty line including ones that should be skipped. The logic is correct only because `//` and `#` are pre-filtered, but the intent is hard to read at a glance.
**Action:** Add an explicit comment explaining what each regex branch handles, or restructure with two explicit `if` branches.

### `m.length === 3` used as a type discriminator
**Severity:** Low
**Lines:** 1081–1082
`m.length === 3` distinguishes between the two regex results (3 capture groups vs 2). This is fragile — if the regex is modified to add a capture group, the discriminator silently breaks. Using named capture groups (`(?<qty>\d+)`, `(?<name>.+)`) would make this explicit and robust.
**Action:** Consider using named capture groups: `/^(?<qty>\d+)x?\s+(?<name>.+)$/` and access `m.groups.qty` / `m.groups.name`.

## Summary
The parser is compact and correct for its intended input. Patterns improvements: replace `m.length` discriminator with named capture groups, and clarify the dual-regex fallback with explicit comments.
