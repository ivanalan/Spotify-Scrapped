# D-008 — Entity-artist: opaque gradient orbit ovals

**Status:** Locked  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck — `#1 artist` beat (`entity-artist` in `ScrappedOrbitArt`)  
**Parent:** [D-007](D-007-orbit-cascade-api-deck.md) (Orbit Cascade substrate unchanged)

## Decision

The #1 artist slide art is a **centered orbit system**: multiple ovals share one center (behind the artist photo), each with a **different eccentricity** (`rx` / `ry`), each filled with an **opaque gradient** (linear, radial, or tri-stop — full-opacity stops), and each **rotates slowly** around that center at its **own speed** (CW / CCW mixed).

**Shipped kit:** prototype **A — Rose cascade** — rose field (`CARD_PALETTE.rose`), gold→mango→ember→rose→ink opaque ladder, cascade eccentricities, bottom wash `#8A1238`.

This displaces the prior soft concentric cascade (near-uniform disks + high transparency / glow) on this beat only.

## Why

Research prototype [`docs/prototypes/artist-space-orbit-options.html`](../prototypes/artist-space-orbit-options.html) (options A–X) showed that:

- Stroke-only / frosted-transparent rings on a void read as generic “AI cosmic UI.”
- Opaque gradient fills + hard card field keep Scrapped’s Orbit Cascade register (poster / card-cut) while still reading as orbits.
- Kit A keeps rose DNA (slide 5 swatch) while the eccentric spin reads as orbits instead of a flat bullseye.

## Locked choices

| Axis | Choice |
|------|--------|
| Kit | **A — Rose cascade** (`ARTIST_ORBIT_A` in `scrapped-card-palette.ts`) |
| Center | One shared origin — screen/photo center; ovals are **center-aligned**, not offset binary systems |
| Shape | Distinct `rx` × `ry` per ring (circle → flatter cascade belts); not a uniform bullseye ladder |
| Fill | **Opaque** linear gradient per oval — no glass / intense fill transparency as the look |
| Motion | Slow continuous rotation around the shared center; **different duration per ring**; alternate CW / CCW |
| Wash | Bottom fade `#8A1238` for mid-band type contrast |
| Art role | Still peripheral chrome under D-007 — mid band must stay readable |
| Copy motion | Unchanged — [D-001](D-001-story-copy-vs-list-motion.md); orbit spin is art chrome only |
| Reduced motion | Settle / freeze rings (`prefers-reduced-motion` / deck freeze) |

## Displaced

On `entity-artist` only:

- Soft concentric near-circles with translucent / glow fills as the primary look
- Stroke-only void orbits as the primary look
- Offset multi-center “binary system” layouts as the default
- Unpicked prototype kits B–X (board kept for reference)

Intro ladder, volume ocean, ghosted spiral, and other patterns stay on D-007 unless separately decided.

## Cost

Richer SVG (per-ring gradient defs + independent spin). Wash + rose field must keep headline AA; retune wash / ring bottoms if type fights the disks.

## Source of truth

- Tokens: `ARTIST_ORBIT_A` in `src/lib/scrapped-card-palette.ts`
- Art: `src/components/scrapped/orbit/ArtistOrbitOvals.tsx` (wired from `ScrappedOrbitArt` + storyboard)
- Prototype board: [`docs/prototypes/artist-space-orbit-options.html`](../prototypes/artist-space-orbit-options.html)
- Deck look parent: [D-007](D-007-orbit-cascade-api-deck.md)
- Skill: `.cursor/skills/scrapped-art-direction/SKILL.md`
