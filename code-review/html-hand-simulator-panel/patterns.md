# Patterns Review — Hand Simulator Panel
Lines: 876–895 | File: public/mtg-commander.html

## Findings

### Heavy inline styles on critique-box
**Severity:** Medium
**Lines:** 891–893
`critique-box` and its inner label div carry all their visual rules as inline `style` attributes: background colour, border, border-radius, padding, font-size, text-transform, letter-spacing, colour, margin-bottom, line-height. This duplicates the styling pattern used for other panel components (which are defined in the CSS block lines 7–772) and makes the critique box impossible to theme or override via the stylesheet cascade.
**Action:** Extract these rules into named CSS classes (e.g., `.critique-box`, `.critique-label`) in the CSS section, consistent with how the rest of the panel components are styled.

### Magic colour values repeated inline
**Severity:** Low
**Lines:** 883, 891–892
The purple accent `rgba(160,112,224,0.08)`, `rgba(160,112,224,0.3)`, `rgba(160,112,224,0.5)`, and `#c084fc` appear as raw literals in both the button style and the critique box. The same purple token presumably appears elsewhere in the stylesheet. There is no CSS custom property (e.g., `--color-critique`) centralising this value.
**Action:** Define `--color-critique-purple` and `--color-critique-purple-dim` as CSS variables alongside the other theme tokens, and reference them here and in any other purple-accent elements.

### Emoji used as functional UI icons without text alternatives
**Severity:** Low
**Lines:** 883, 887, 892
Three emoji are used as visual icons: `🧠` (critique button and label), `🃏` (empty-hand icon). They carry no `aria-label` or `role="img"` with a title, so their meaning is lost to screen readers and may render inconsistently across platforms.
**Action:** Wrap each emoji icon in `<span role="img" aria-label="<description>" aria-hidden="true">` or replace with an SVG icon with a proper accessible label.

### No comment marking the boundary of this panel in the HTML
**Severity:** Low
**Lines:** 876
The hand panel `<div>` opens without an HTML comment identifying it (unlike some other sections in the file that use `<!-- ... -->` delimiters). In a 2159-line single-file app, navigability depends on consistent section comments.
**Action:** Add `<!-- Hand Simulator Panel -->` immediately before line 876 to match the commenting style used elsewhere.

## Summary
The most impactful pattern issue is the large block of inline styles on `critique-box`, which bypasses the established CSS class system and makes theming harder. The magic purple colour literals compound this by scattering a design token across multiple attributes. Emoji accessibility and the missing section comment are minor polish items.
