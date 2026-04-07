# Code & Pattern Review — Reset & CSS Variables
Lines: 8–28 | File: public/mtg-commander.html

## Findings

### Inconsistent background colour naming — `--bg`, `--bg2`, `--bg3`
**Severity:** Low
**Lines:** 11–13
Three background shades are named with numeric suffixes (`--bg`, `--bg2`, `--bg3`) which convey no semantic meaning. It is not clear from the name alone which is darker, which is for cards, which is for panels.
**Action:** Rename to semantically meaningful names, e.g. `--bg-base`, `--bg-panel`, `--bg-surface`, to make usage intent clear at a glance.

### Colour variables for semantic concepts mixed with raw palette
**Severity:** Low
**Lines:** 18–25
`--gold`, `--gold-light`, `--blue`, `--green`, `--red` are raw palette names, while `--text`, `--text-dim`, `--card`, `--card-border` are semantic names. Mixing raw and semantic naming in the same `:root` block makes it harder to reason about what should be changed when a theme changes vs what is a fixed colour.
**Action:** Consider separating into a raw palette layer and a semantic token layer, or at minimum grouping related variables with comments (e.g. `/* Palette */`, `/* Semantic tokens */`).

### Magic opacity literal in `--text-dim`
**Severity:** Low
**Lines:** 17
`rgba(232,224,255,0.55)` repeats the RGB values from `--text: #e8e0ff` but as a decimal expansion rather than referencing it. If `--text` changes, `--text-dim` won't update automatically.
**Action:** Use `color-mix(in srgb, var(--text) 55%, transparent)` (modern CSS) or document the dependency clearly in a comment.

## Summary
The variable block follows common conventions but would benefit from semantic naming and grouping. No patterns are critically broken, but the mix of raw palette names and semantic names will become harder to maintain as the UI grows.
