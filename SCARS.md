# SCARS.md

What has already hurt us. **Title each entry with the symptom** (reporter’s words).  
Read before diagnosing. Append-only — never delete; supersede with a newer scar if needed.

Format:

```markdown
## <Symptom in the reporter’s words>
- **Not:** …
- **Cause:** …
- **Proof:** …
- **Avoid:** …
- **Related:** D-NNN / links (optional)
```

---

## Title jumps (or stays put) when the subtitle appears on list setup slides

- **Not:** The soundtrack, the slide copy wording, or cascade row timing alone. Not “the list beat’s title at the top.”
- **Cause:** Several wrong guesses stacked: (1) turning off Framer `layout` on setup/list copy so the title no longer eases up when the subtitle mounts; (2) putting the layout spring on the default `transition` so subtitle **enter** felt rough; (3) faking mid-slide position with `justify-center` + `min-h` flex centering, which **recenters instantly** when the subtitle mounts; (4) top-pinning the whole **scene** (`justify-start`) so setup copy yanked on handoff; (5) inventing setup-only exits (`fadeOnly` / `riseOut`) and padding offsets instead of the shared copy pattern.
- **Proof:** “But this wasn’t the only ghost in town” either teleported when “Call the ghostbusters…” landed or never moved up; lab cascade looked right while the live deck felt wrong; user confirmed the desired pattern is the **same as every other slide** for setup copy.
- **Avoid:** Special-casing setup copy before a list. Top-pinning entire scenes. Disabling layout on copy. Attaching layout spring as the enter transition. Use shared `softEnter` + `{ layout: layoutSpring }` only; only the numbered list beat uses `pinTop`.
- **Related:** [D-001](docs/decisions/D-001-story-copy-vs-list-motion.md)

## List rows all appear at once (no cascade) on the live deck

- **Not:** Missing data or empty `WrappedEntityList` items.
- **Cause:** List mounted in the same phase as the subtitle (`showSupport` tied to copy lines), and rows used `initial={false}` while already `active`, so Framer skipped enter-from-initial.
- **Proof:** Lab remounted inactive→active and showed cascade; live slide 04 felt like subtitle + all five rows together.
- **Avoid:** Mount the list in a separate `hasSupport` phase after copy. Plan row motion with real `initial` values when active so stagger plays on mount.
- **Related:** [D-001](docs/decisions/D-001-story-copy-vs-list-motion.md)
