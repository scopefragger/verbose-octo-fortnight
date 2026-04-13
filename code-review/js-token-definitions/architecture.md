# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Token definitions are embedded in the JS segment rather than a data file
**Severity:** Low
**Lines:** 1647–1662
`COMMON_TOKENS` is a hardcoded array of 14 token templates mixed into the application logic. In a multi-file setup this would be a separate data module. Here it works fine but expanding the token list requires editing application code rather than a data file.
**Action:** For the current single-file architecture this is acceptable. If the list grows significantly, consider moving it to a `<script type="application/json">` block or fetching it from a static JSON file.

### No schema validation for token objects
**Severity:** Low
**Lines:** 1647–1662
There is no enforced shape for token objects. If a future contributor adds a token with a missing or misspelled key (e.g., `type_Line` instead of `type_line`), it would fail silently at render time.
**Action:** Add a JSDoc typedef or inline comment documenting the expected token shape.

## Summary
The token definitions are self-contained and appropriate for a single-file app. The only architectural concern is the lack of a documented schema, which could lead to subtle bugs when the list is extended.
