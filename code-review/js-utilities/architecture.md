# Architecture Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Utilities defined at the end of the file, used from the beginning
**Severity:** Low
**Lines:** 2141–2156
`escapeHtml`, `escapeQuotes`, and `showToast` are defined near line 2141 but called from line ~1472 onward. JavaScript `function` declarations are hoisted, so this works at runtime — but readers scanning the file top-to-bottom encounter call sites before seeing definitions, reducing discoverability.
**Action:** No functional change required. Consider moving the UTILS block to the top of the `<script>` section (just after global state) with a comment noting that hoisting makes the order irrelevant.

## Summary
No significant architecture issues. The utilities are simple, single-purpose functions with no external dependencies. Their placement at the end of the file is a minor readability concern only.
