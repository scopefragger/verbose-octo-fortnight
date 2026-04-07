# Code & Pattern Review — Hand Simulator Panel
Lines: 345–417 | File: public/mtg-commander.html

## Findings

### Magic Color Values for Critique Purple Theme
**Severity:** Medium
**Lines:** 883, 891–893 (HTML inline styles)
The AI critique box and its button use the purple accent color defined in three places as raw hex/rgba literals: `#c084fc`, `rgba(160,112,224,0.5)`, `rgba(160,112,224,0.08)`, `rgba(160,112,224,0.3)`. No CSS custom property exists for this color (unlike `--gold`, `--text-dim`, `--card`, etc. which are all CSS variables). If the accent color ever changes, all three occurrences must be updated manually and are easy to miss because they live in inline styles rather than in the stylesheet.
**Action:** Add a `--purple` (or `--ai-accent`) CSS variable to the `:root` block and reference it from a proper CSS class for the critique box.

### Inline `style="display:none"` on Multiple Toolbar Buttons
**Severity:** Low
**Lines:** 881–883 (HTML)
Three buttons (`#mulligan-btn`, `#keep-btn`, `#critique-btn`) each carry `style="display:none"` as an initial state directly in the HTML. This is a mixing of initial state management with markup. If a CSS class (e.g., `.hidden`) controlled initial visibility, it would be easier to spot in code review and to override responsively or via animation.
**Action:** Add a `.hidden { display: none !important; }` utility class (or use an existing one if present) and replace the inline `display:none` attributes with `class="... hidden"`.

### Magic Number: Hand Size 7 Appears Multiple Times
**Severity:** Low
**Lines:** 1343, 1359, 1365–1367
The starting hand size `7` appears as a magic number in `drawHand(size = 7)`, in the mulligan formula `7 - mulliganCount`, and implicitly in the label strings (`'6-card hand'`, `'5-card hand'`). There is no named constant for it.
**Action:** Define `const STARTING_HAND_SIZE = 7;` near the state declarations and reference it consistently.

### Redundant `empty-hand` Markup: Hardcoded in Both HTML and JS
**Severity:** Low
**Lines:** 886–889 (HTML), 1419 (JS `renderHand`)
The empty-hand placeholder markup is duplicated: it appears statically in the HTML (lines 886–889) for initial page load, and is re-created as a string in `renderHand()` when `hand` is empty (line 1419). These two copies must stay in sync (same class names, same icon, same text). A mismatch would produce different initial vs. reset empty states.
**Action:** Remove the static HTML placeholder and let `renderHand()` be the single source of truth, calling it on `DOMContentLoaded` (or when a deck is not yet loaded) so the initial state is rendered by the same code path.

### `.hand-card` Aspect Ratio Implied, Not Declared
**Severity:** Low
**Lines:** 367–376, 392
`.hand-card-loading` correctly declares `aspect-ratio: 2.5/3.5` for the placeholder, but `.hand-card img` has no explicit aspect-ratio. The correct aspect ratio is maintained only if the Scryfall image itself has the right dimensions. Adding `aspect-ratio: 2.5/3.5` to `.hand-card img` would prevent layout shift while images load.
**Action:** Add `aspect-ratio: 2.5/3.5` to the `.hand-card img` rule.

## Summary
The main pattern issues are the use of raw magic color literals for the purple AI critique theme instead of a CSS variable, duplicated empty-state markup between HTML and JS, and the magic number `7` for hand size. These small inconsistencies would compound if the hand simulator feature is extended (e.g., different game formats with different starting hand sizes).
