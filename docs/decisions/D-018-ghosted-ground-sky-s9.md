# D-018 — Ghosted pair: ground → sky + S9 stars + C8 chrome

**Status:** Locked  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck scenes 2–3. Fav **S9** on **C8** base.  
**Tune:** Lab `docs/mocks/explorations/ghosted-pair-field.html` (slow ghost fade · separate star maps · moon/haunt geometry).

## Decision

Invert the ghosted entity→list night rhyme and lock star + chrome treatments:

| Beat | Motifs |
|------|--------|
| Scene 2 (entity) | Ink · **ridge grass** · **S9** entity star map (5, grow-in + overlapping pulse) · one blob haunt at **cover TL** · **no moon** |
| Scene 3 (list) | Ink · **TR-corner silver→ember moon** (grow-in + lilac underglow) · **S9** list star map (7, distinct slots) · **5 fade + overlapping float** edge ghosts · **no grass / no clouds** |
| Deck chrome on scene 3 | **C8** — ink top scrim under wordmark / progress / controls (pills already solid on ink theme) |

## Why

Flipped “moon then weather” to “ground haunt → sky chorus.” Cover-TL ghost reads as the song’s haunt; list moon + staggered fade-in ghosts escalate without mid-band heroes. Separate star maps keep entity night from echoing the list sky. TR-corner moon still needs the C8 scrim so chrome stays readable. **S9** (4-point + quiet orchid glow, grow-in) won over dots/soft as the night sparkle. Slow opacity fade (not rise/scale) for ghosts keeps the pair quiet.

## Locked choices

| Axis | Choice |
|------|--------|
| Entity moon | Off (displaces D-017 N4 TR moon) |
| Entity ground | Spiky ridge grass (was list-only in D-010); enter = **rise-from-soil** cascade — [D-021](D-021-ghosted-grass-rise-from-soil.md) |
| Entity haunt | Cover TL peek (~51, 149 · size 77 · op 0.74) — same former TR inset, mirrored — slow fade then bob |
| Stars | S9 — 4-point · grow-in (~0.75s) with pulse overlap · opacity ≈0.11–0.58 · **entity 5 / list 7 distinct slot maps** · size ×1.05 · static SVG translate (motion scale nested) · **never under a ghost AABB** (pad for bob; stars paint behind ghosts) |
| List sky | TR-corner moon (cx 336, cy 104, r 62, op 0.8) · grow-in · lilac/ember **underglow** blur · silver→ember radial · **no hard halo ring** |
| List ground | None |
| List ghosts | **5** inset edge (L + R) · fade gated to list beat (“Your ghosted songs”, `beatPhase >= 1`) · +0.45s pad · opacity fade (1.7s) · float at **45%** of fade · stagger 1.3→3.1s · remount on scene visit |
| List clouds | Off |
| Chrome | Scene 3 ink scrim (`ApiScrappedDeck`) |

## Displaced

- D-017 scene 2: TR moon · edge **dot** stars · BL ghost · no grass  
- D-010 scene 3: marquee clouds · grass · perimeter bob ghosts · no moon  
- Prior D-018 geometry: moon cx 292 / cy 96 / r 46; haunt 248,198 size 64; shared star slice; ghosts rise+scale enter (0.85s)

Those decisions remain historical; this file is the live ghosted-pair source of truth.

## Cost

Two consecutive ink fields still rely on motif escalation. Cover-TR ghost sits in the SVG art layer behind the HTML cover — position is approximate to the centered 160px lead. Larger TR-corner moon still benefits from the C8 scrim; removing the scrim regresses chrome contrast. Ghosts stay inset from the viewBox edges so `slice` / meet crops don’t clip them. Scene 3 chrome remounts on visit (`replayKey`) so fade/float re-enter; without that, snap-mounted slides skip the enter.

## Source of truth

- Motifs: `GhostedNightEntity` · `GhostedListFrame` · `PointGlowStars` · `GhostedHardMoon` · `RisingColumnGhosts` in `PeripheralMotifs.tsx`
- Grass enter motion: [D-021](D-021-ghosted-grass-rise-from-soil.md) (`SpikyGrass`)
- Wide: `ScrappedOrbitArt` `WideOrbitChrome`
- Chrome scrim: `ApiScrappedDeck` when `active === 3`
- Lab: `docs/mocks/explorations/ghosted-pair-field.html`
