# D-010 — Ghosted songs list: ink sky / grass / ghosts

**Status:** Locked  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck slide 3 only (`Your ghosted songs` list) — not other list beats.

## Decision

The ghosted-songs top-5 list uses an **ink** field with **purple→ember** accents and peripheral chrome of:

1. **Seamless marquee clouds** at the top (32s loop — duplicate sprites, travel = spacing; no jump-reset)
2. **Spiky grass** along the floor with light wind (`windStrength` 0.4, gust ~5s)
3. **Four blob ghosts** on the perimeter (wash fill, float, no wavy hem, opacity ~0.74)

Other list slides keep classic orb + clouds (marquee fix shared).

## Why

Exploration at `docs/mocks/explorations/ghosted-list-sky-grass.html` locked this pack: night field + ghost characters reads the beat without competing with the mid-band list. Gold + BL orb was weather-without-theme.

## Locked choices

| Axis | Choice |
|------|--------|
| Field | `ink` (`#12101A`) — displaces gold for slide 3 only |
| Accents | `#5C1A7A` → `#F05A3D` (unchanged list-3 accents) |
| Clouds | Marquee; sky placement via `GHOSTED_LIST_CLOUDS` (`scale`, `yOffset`) in `scrapped-card-palette.ts` |
| Ground | Short spiky grass — grow-in on enter; soft long-period flow sway (not jagged gusts) |
| Ghosts | Blob · perimeter · wash · float · hem off · count 4 |
| Scope | Slide index 3 only (`GhostedListFrame`) |

## Displaced

Gold field + bottom-left orb on the ghosted songs list.

## Cost

Two ink list-adjacent beats (slide 3 motif vs slide 6 classic list on ink) — differentiated by chrome, not field alone. Ghost characters must stay peripheral or they fight the list. Slide 2 entity now shares the ink + ghost language ([D-017](D-017-entity-list-pair-rhymes.md)) without copying clouds/grass.

## Source of truth

- Motifs: `src/components/scrapped/art/storyboard/PeripheralMotifs.tsx` (`GhostedListFrame`)
- Wire: `ScrappedOrbitArt` / storyboard `OrbitCascadeArt` when `slideIndex === 3`
- Palette: `SLIDE_SWATCH[3] = "ink"` in `scrapped-card-palette.ts`
- Explore: `docs/mocks/explorations/ghosted-list-sky-grass.html`
