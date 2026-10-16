# D-001 — Story copy motion vs 5-row list pattern

- **Date:** 2026-10-16
- **Status:** Locked

## Why

While tuning numbered list slides (ghosted songs, one-likes, reunion setlist), agents repeatedly special-cased setup copy (“But this wasn’t the only ghost in town”) and scene layout. That broke the shared title→subtitle layout spring and made list slides diverge from every other beat. We needed one locked split: shared copy motion vs list-only exception.

## Decision

1. **All story copy** (headline, subline, aside, outro) uses the **same** pattern as every other slide:
   - Section vertically centered for non-list beats
   - `softEnter` for enter; shared `beatExit` (move up + fade) for outro
   - Framer `layout="position"` with transition scoped to `{ layout: layoutSpring }` so the title eases up when the subtitle mounts
2. **Setup beats before a list are not special** — same centering and motion as any other copy beat.
3. **Sole exception:** the numbered **5-row** entity list beat:
   - `pinTop` on that `BeatBody` only (list title/sub at top)
   - Separate `hasSupport` phase after copy lines
   - Row cascade via `WrappedEntityList` + `scrapped-list-motion` (`cascade` default)
4. Labs for presets/tuning: `/scrapped/art/list`, `/scrapped/art/list/tune` — live deck stays on shipped defaults until a value is promoted.

## Displaced

- Scene-wide `justify-start` for whole list scenes
- Setup-only exits (`fadeOnly` / `riseOut`) and padding-offset “fake center”
- Disabling layout on copy to “fix” handoffs
- Mounting list rows in the same phase as the subtitle

## Cost

Agents must not invent per-slide copy motion. If a list slide feels wrong, fix the **shared** copy path or the **list** exception — never a third path for “just this setup line.”

## Key files

- `src/components/scrapped/wrapped/WrappedStorySlide.tsx`
- `src/components/scrapped/wrapped/WrappedEntityList.tsx`
- `src/lib/scrapped-story-motion.ts`
- `src/lib/scrapped-list-motion.ts`

## Related

- [SCARS.md](../../SCARS.md) — title jump / cascade scars
- [SOUL.md](../../SOUL.md) — non-negotiable motion split
