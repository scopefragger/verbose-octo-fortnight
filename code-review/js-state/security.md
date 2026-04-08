# Security Review — State
Lines: 1032–1037 | File: public/mtg-commander.html

## Findings

### `cardCache` populated from external API with no key sanitisation
**Severity:** Low
**Lines:** 1037
`cardCache` is keyed by card name strings that originate from Scryfall API responses. If a malicious or unexpected name matched a prototype property (e.g. `__proto__`), it could potentially corrupt the object in older environments. No active exploit exists against modern V8 but the risk is non-zero when trusting third-party key strings.
**Action:** Use `Object.create(null)` or `Map` for `cardCache` (see Static finding). Add a comment noting keys come from untrusted API data.

## Summary
No XSS, injection, or secrets exposure in this section. State variables are plain JS values never directly injected into the DOM here. The sole finding is a low-severity prototype-pollution concern stemming from the cache key source.
