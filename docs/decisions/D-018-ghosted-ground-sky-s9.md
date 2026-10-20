# D-018 — Ghosted pair: ground → sky + S9 stars + C8 chrome

**Status:** Locked  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck scenes 2–3. Fav **S9** on **C8** base.

## Decision

Invert the ghosted entity→list night rhyme and lock star + chrome treatments:

| Beat | Motifs |
|------|--------|
| Scene 2 (entity) | Ink · **ridge grass** · **S9** 4-point glow stars · one blob ghost at **cover TR** · **no moon** |
| Scene 3 (list) | Ink · **TR-inset silver→ember moon** (no halo) · **S9** stars (7, quiet opacity) · **5 enter-then-float** edge ghosts · **no grass / no clouds** |
| Deck chrome on scene 3 | **C8** — ink top scrim under wordmark / progress / controls (pills already solid on ink theme) |

## Why

Flipped “moon then weather” to “ground haunt → sky chorus.” Cover-TR ghost reads as the song’s haunt; list moon + staggered enter-float ghosts escalate without mid-band heroes. TR-inset moon still needs the C8 scrim so chrome stays readable. **S9** (4-point + quiet orchid glow) won over dots/soft as the night sparkle.

## Locked choices

| Axis | Choice |
|------|--------|
| Entity moon | Off (displaces D-017 N4 TR moon) |
| Entity ground | Spiky ridge grass (was list-only in D-010); enter = **rise-from-soil** cascade — [D-021](D-021-ghosted-grass-rise-from-soil.md) |
| Entity haunt | Cover TR peek (~248, 198 · size 64) — not BL |
| Stars | S9 — 4-point path · quiet glow pulse (≈0.16–0.42) · entity 5 / list 7 |
| List sky | TR-inset moon (cx 292, cy 96, r 46) · silver→ember radial · **no outer halo** |
| List ground | None |
| List ghosts | **5** inset edge · stagger enter (0.85→2.45s, heart grammar) · independent bob float |
| List clouds | Off |
| Chrome | Scene 3 ink scrim (`ApiScrappedDeck`) |

## Displaced

- D-017 scene 2: TR moon · edge **dot** stars · BL ghost · no grass  
- D-010 scene 3: marquee clouds · grass · perimeter bob ghosts · no moon  

Those decisions remain historical; this file is the live ghosted-pair source of truth.

## Cost

Two consecutive ink fields still rely on motif escalation. Cover-TR ghost sits in the SVG art layer behind the HTML cover — position is approximate to the centered 160px lead. TR-inset moon still benefits from the C8 scrim; removing the scrim regresses chrome contrast. Ghosts stay inset from the viewBox edges so `slice` / meet crops don’t clip them.

## Source of truth

- Motifs: `GhostedNightEntity` · `GhostedListFrame` · `PointGlowStars` · `GhostedHardMoon` · `RisingColumnGhosts` in `PeripheralMotifs.tsx`
- Grass enter motion: [D-021](D-021-ghosted-grass-rise-from-soil.md) (`SpikyGrass`)
- Wide: `ScrappedOrbitArt` `WideOrbitChrome`
- Chrome scrim: `ApiScrappedDeck` when `active === 3`
