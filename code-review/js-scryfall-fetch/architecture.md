# Architecture Review — Scryfall Fetch
Lines: 1088–1145 | File: public/mtg-commander.html

## Findings

### Two-pass strategy is correct and well-structured
**Severity:** Informational
**Lines:** 1100–1143
The two-pass approach (batch collection first, fuzzy fallback for misses) is a sound strategy for efficiently fetching large decklists while handling edge cases like apostrophes and alternate names.
**Action:** No action needed structurally.

### `fetchCard` and `fetchCards` share `cardCache` via closure — implicit coupling
**Severity:** Low
**Lines:** 1090, 1101, 1117, 1139
Both functions read/write `cardCache` directly from the module scope. This implicit global dependency makes the functions impossible to test in isolation and couples all fetch logic to the global cache.
**Action:** Consider passing `cardCache` as a parameter or wrapping both functions in a cache-aware module pattern. For the current single-file architecture, at minimum add a comment noting this dependency.

### Chunk size `75` is a magic number
**Severity:** Low
**Lines:** 1105
`i += 75` is the Scryfall collection endpoint maximum batch size. This is a meaningful constant that should be named.
**Action:** Extract to `const SCRYFALL_BATCH_SIZE = 75`.

### Delay values `80ms` and `50ms` are magic numbers
**Severity:** Low
**Lines:** 1131, 1140
Both inter-request delays are inline magic numbers with no comment explaining their purpose (Scryfall rate limit courtesy, empirical values, etc.).
**Action:** Extract to named constants `BATCH_DELAY_MS = 80` and `FUZZY_DELAY_MS = 50` with comments.

## Summary
The two-pass fetch strategy is architecturally sound. The main concerns are implicit `cardCache` coupling, magic number chunk size and delays, and the absence of response validation.
