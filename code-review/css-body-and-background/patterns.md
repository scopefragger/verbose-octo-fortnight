# Code & Pattern Review — Body & Background
Lines: 30–35 | File: public/mtg-commander.html

## Findings

### Font stack defined on body but not as a CSS variable
**Severity:** Low
**Lines:** 31
The system font stack is hardcoded directly on `body` rather than captured as a `--font-body` variable. If the font ever needs to change (e.g. adding a custom web font), there is no single place to update it.
**Action:** Add `--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` to `:root` and reference it here as `font-family: var(--font-body)`.

### `min-height: 100vh` mobile caveat
**Severity:** Low
**Lines:** 34
`min-height: 100vh` is known to cause layout issues on mobile browsers (iOS Safari in particular) where the viewport height includes the browser chrome, causing content to be hidden behind it.
**Action:** Consider using `min-height: 100dvh` (dynamic viewport height) with a `100vh` fallback for broader compatibility: `min-height: 100vh; min-height: 100dvh`.

## Summary
Clean and minimal. Two low-severity pattern improvements: capture the font stack as a variable, and use `dvh` units for better mobile viewport handling.
