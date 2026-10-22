# D-015: List beats: art frames the list (no mid-band heroes)

**Status:** Locked  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck **list** beats (numbered 5-row entity lists); slides that show `WrappedEntityList` / support phase.

## Decision

On any slide whose job is a **numbered list**, peripheral art **frames** the list. It must not act as a second hero that sits in (or over) the mid-band and occludes headline, subline, or rows.

| Axis | Choice |
|------|--------|
| Mid band | Clear for type + list rows; art stays TL / TR / BL / BR / top drift / bottom drift / side gutters |
| Scale | Smaller than entity/setup heroes; density at edges |
| Motion | Ambient / slow; never a centerpiece that competes with list enter |
| Entity → list pairs | Setup/entity may use a bold centered motif; the **list phone** uses a **different framing treatment** of the same metaphor family (not a scaled-down copy of the hero pasted over the list) |
| Existing specials | Ghosted list sky/grass/ghosts stay peripheral; [D-010](D-010-ghosted-list-sky-grass-ghosts.md). Classic list clouds + BL orb stay edge-anchored |

## Why

Entity metaphors (e.g. 1-like beating heart) read well as heroes, then fail when the same artwork is shrunk onto the list; it covers copy and fights the 5-row cascade. Lists need chrome that **holds the edges**, same rule as Orbit Cascade geometry ([D-007](D-007-orbit-cascade-api-deck.md)): clear mid band.

## Displaced

- Reusing the entity/setup hero centered (or large) on the list beat
- “List mode = scale(0.62) the same art” as the default adaptation

## Cost

Each list-adjacent metaphor family needs an authored **frame** treatment, not only a hero kit. Slightly more art work per beat pair.

## Source of truth

- Composition rule: this decision; art-direction skill “Type owns the mid band”
- Production list chrome remains per-slide (D-018 for slide 3; classic / metaphor frames for others)
