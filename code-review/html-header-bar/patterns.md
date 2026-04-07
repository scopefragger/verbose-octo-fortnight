# Patterns Review — Header Bar
Lines: 776–783 | File: public/mtg-commander.html

## Findings

### Inline style on `#deck-status`
**Severity:** Low
**Lines:** 778
`style="font-size:0.78rem;color:var(--text-dim)"` is applied inline rather than via a CSS class. The rest of the file uses named classes (`.header-title`, `.mode-btn`, etc.) for layout and typography. This single inline style is inconsistent with that convention and makes the styling invisible to the CSS layer (e.g., cannot be overridden by a media query targeting a class).
**Action:** Move these two declarations into a `.deck-status` or `.header-subtitle` rule in the CSS block and replace the `style` attribute with a `class` attribute.

### Magic font-size value `0.78rem`
**Severity:** Low
**Lines:** 778
`0.78rem` is a one-off value with no CSS variable or named scale step behind it. Other text sizes in the file use `0.8rem`, `0.85rem`, `0.9rem`, `1rem`, etc. This value falls between named steps and appears nowhere else, making it a magic number.
**Action:** Round to the nearest existing scale step (likely `0.8rem`) or introduce a `--text-xs` CSS custom property if a smaller-than-small size is genuinely needed.

### Emoji in static markup without `aria-hidden`
**Severity:** Low
**Lines:** 777, 781
The wizard emoji `🧙` in the title and the play symbol `▶` in the Play button are rendered inline without `aria-hidden="true"` or a descriptive `aria-label`. Screen readers will announce "mage" and "black right-pointing triangle" respectively, which is noisy and unhelpful.
**Action:** Wrap decorative emoji/symbols in `<span aria-hidden="true">` and ensure the button's accessible name comes from its text content alone (e.g., `<button ...><span aria-hidden="true">▶</span> Play</button>`).

## Summary
The main patterns issues are a single inline style that breaks the file's class-based CSS convention, a one-off magic font-size value, and decorative emoji/symbols that lack `aria-hidden` annotations. All three are low severity and easy to address.
