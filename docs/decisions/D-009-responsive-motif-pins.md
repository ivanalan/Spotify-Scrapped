# D-009 — Responsive motif pins (mobile-locked)

**Status:** Locked  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck orbit chrome (`ScrappedOrbitArt`) — gate + loading included  
**Parent:** [D-007](D-007-orbit-cascade-api-deck.md)

## Decision

On **wide** viewports, Orbit Cascade chrome uses **corner-pinned motif layers** sized from the short viewport side so edge art stays visible.

On **phone** viewports, most patterns keep the legacy full-slide `MotifStage` (`viewBox 0 0 360 640` + `preserveAspectRatio="xMidYMid slice"`).

**Pin exceptions (every viewport):**
- **Intro** — orchid disks + pointed star via `MotifCornerOrigin` (disk center → TL, star center → BR)
- **Soft close** — double pill bookend via `MotifPin` top-center + bottom-center (`CloseBookendChrome`). MotifStage `slice` crops the mirrored bottom stack on tall phones.

Phone wins whenever `(max-width: 480px)` **or** `(max-aspect-ratio: 3/4)`. SSR and first paint default to the phone path.

## Why

Cover-scaling a portrait design space into landscape crops away edge-anchored motifs (clear mid band by design). Letterboxing the story into a phone frame on desktop is banned ([SOUL.md](../../SOUL.md)). Pins keep full-bleed canvas while re-anchoring the same shape components to true edges.

Mobile is protected by a **separate render path**, not by hoping pin math matches slice crop.

## Locked choices

| Axis | Choice |
|------|--------|
| Phone path | Legacy `MotifStage` for non-exception patterns; intro + soft close use pins (see above) |
| Wide path | Same intro / close pins; `MotifMeetStage` (song/artist); `MotifPin` (volume/list/reunion) |
| Breakpoint | Phone if `max-width: 480px` **or** `max-aspect-ratio: 3/4` |
| Sizing | Motif boxes from short side (`min(100vw, 100dvh)`); mid band stays clear |
| Motifs | Reuse ShapeKit / Funky / List / ArtistOrbit components — do not redraw |
| Canvas | Full-bleed; no letterbox gutters |
| Copy motion | Unchanged — [D-001](D-001-story-copy-vs-list-motion.md) |

## Displaced

Using `xMidYMid slice` alone as the wide-viewport scaling model for production orbit chrome.

## Cost

Two composition paths to maintain; wide pins need visual QA when motifs change. Center patterns (`entity-song`, `entity-artist`) use a short-side-scaled portrait stage, not edge pins.

## Source of truth

- Art: `src/components/scrapped/orbit/ScrappedOrbitArt.tsx`
- Pins: `src/components/scrapped/orbit/MotifPin.tsx` (`MotifCornerOrigin`, `MotifMeetStage`, `MotifPin`)
- Parent look: [D-007](D-007-orbit-cascade-api-deck.md)
- Skill: `.cursor/skills/scrapped-art-direction/SKILL.md`
