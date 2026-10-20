# D-008 — Entity-artist: opaque gradient orbit ovals

**Status:** Locked  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck — `#1 artist` beat (`entity-artist` in `ScrappedOrbitArt`)  
**Parent:** [D-007](D-007-orbit-cascade-api-deck.md) (Orbit Cascade substrate unchanged)

## Decision

The #1 artist slide art is a **centered orbit system**: multiple ovals share one center (behind the artist photo), each with a **different eccentricity** (`rx` / `ry`), each filled with an **opaque gradient** (linear, radial, or tri-stop — full-opacity stops), and each **rotates slowly** around that center at its **own speed** (CW / CCW mixed).

**Shipped kit:** prototype **F — Orchid ladder spin** — ink field (`CARD_PALETTE.ink`), **ink-lean** opaque orchid cascade (`#9B4DE8`→`#7A3CC8`→`#6B21A8`→`#4C1D95`→`#3B0764`→`#1A0A2E`), cascade eccentricities, bottom wash `#0A0810` (starts ~viewBox Y 360).

This displaces the prior soft concentric cascade (near-uniform disks + high transparency / glow) on this beat only, and supersedes the interim kit A rose cascade pick. Contrast retune (2026-10-19): dropped near-white lilac / hot magenta stops that fought mid-band type — kit F ink-lean orchid cascade.

## Why

Prototype boards (options A–X) showed that:

- Stroke-only / frosted-transparent rings on a void read as generic “AI cosmic UI.”
- Opaque gradient fills + hard card field keep Scrapped’s Orbit Cascade register (poster / card-cut) while still reading as orbits.
- Kit F reuses the locked intro orchid ladder on ink — same DNA as the open beat — and reads clearer than rose-warm cascade on this left-on-read beat.

## Locked choices

| Axis | Choice |
|------|--------|
| Kit | **F — Orchid ladder spin** (`ARTIST_ORBIT` in `scrapped-card-palette.ts`) |
| Canvas | Ink (`CARD_PALETTE.ink` / slide swatch 5) |
| Center | One shared origin — screen/photo center; ovals are **center-aligned**, not offset binary systems |
| Shape | Distinct `rx` × `ry` per ring (circle → flatter cascade belts); not a uniform bullseye ladder |
| Fill | **Opaque** linear gradient per oval — deep orchid / ink-lean (not near-white lilac); no glass / intense fill transparency as the look |
| Motion | Slow continuous rotation around the shared center; **different duration per ring**; alternate CW / CCW |
| Wash | Bottom fade `#0A0810` from ~Y 360 for mid-band type contrast |
| Art role | Still peripheral chrome under D-007 — mid band must stay readable |
| Copy motion | Unchanged — [D-001](D-001-story-copy-vs-list-motion.md); orbit spin is art chrome only |
| Reduced motion | Settle / freeze rings (`prefers-reduced-motion` / deck freeze) |

## Displaced

On `entity-artist` only:

- Soft concentric near-circles with translucent / glow fills as the primary look
- Stroke-only void orbits as the primary look
- Offset multi-center “binary system” layouts as the default
- Kit **A — Rose cascade** (interim lock) and unpicked prototype kits B–E, G–X

Intro ladder, volume ocean, ghosted spiral, and other patterns stay on D-007 unless separately decided.

## Cost

Richer SVG (per-ring gradient defs + independent spin). Wash + ink field must keep headline AA; retune wash / ring bottoms if type fights the disks. Slide 5 and 6 both use ink — related beats share the field; art (orchid ladder vs list chrome) carries the difference.

## Source of truth

- Tokens: `ARTIST_ORBIT` in `src/lib/scrapped-card-palette.ts`
- Art: `src/components/scrapped/orbit/ArtistOrbitOvals.tsx` (wired from `ScrappedOrbitArt` + storyboard)
- Deck look parent: [D-007](D-007-orbit-cascade-api-deck.md)
- Skill: `.cursor/skills/scrapped-art-direction/SKILL.md`
