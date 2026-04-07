# Static Code Review — Hand Simulator Panel
Lines: 345–417 | File: public/mtg-commander.html

## Findings

### Missing CSS for AI Critique Output Box
**Severity:** Medium
**Lines:** 345–417 (absence), 891–893 (HTML)
The description for this segment says it covers the "AI critique output box", but no CSS class for it exists in lines 345–417. The `#critique-box` and its child `#critique-text` (HTML lines 891–893) are styled entirely with inline styles. This means the segment boundary documented in SEGMENTS.MD is inaccurate, and a significant chunk of panel styling is orphaned from the CSS block.
**Action:** Extract the inline styles from `#critique-box` and its label/text children into named CSS classes (e.g., `.hand-critique-box`, `.hand-critique-label`, `.hand-critique-text`) and place them within this CSS section.

### `mulligan-count` Class Defined but Populated Only via JS
**Severity:** Low
**Lines:** 359, 1353, 1364–1367
The `.mulligan-count` style is defined in CSS (line 359) but its content is exclusively managed via `element.textContent` assignments in JavaScript. There is no static fallback text in the HTML — the element starts empty. This is not a bug but makes the initial state invisible; if JS fails to fire, the label shows nothing without any indicator to the user.
**Action:** Consider adding a placeholder text in the HTML (e.g., "No hand drawn") or a CSS `:empty::before` pseudo-element so the label is informative before a hand is drawn.

### `transition: all 0.2s` on `.hand-card`
**Severity:** Low
**Lines:** 374
`transition: all` animates every animatable CSS property, which can cause unintended animations (e.g., color changes) and carries a minor performance cost. Only `transform` and `box-shadow` are visually needed here per the hover rule on line 377.
**Action:** Replace with `transition: transform 0.2s, box-shadow 0.2s`.

## Summary
The primary static issue is a gap between the documented scope of this CSS segment and what is actually present: the AI critique output box has no CSS classes, only inline styles. A minor over-broad `transition: all` declaration and an always-empty mulligan label on page load are secondary concerns.
