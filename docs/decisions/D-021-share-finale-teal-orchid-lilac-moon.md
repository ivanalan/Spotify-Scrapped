# D-021 — Share finale: teal nest · orchid corners · lilac-rim moon

**Status:** Locked (production)  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck scene 9 — visual art only. IA + density remain [D-012](D-012-share-finale-inset.md). Composition rules remain [D-013](D-013-share-finale-deck-rhyme-explore.md). Spine: [D-020](D-020-share-finale-orchid-corners-white-moon.md).

## Decision

Promote the share-finale spine lock:

| Axis | Choice |
|------|--------|
| Kit id | `c-teal-m-lilac-rim` |
| Stage | Ink + intro disks/star (unchanged) |
| Card base | C6 teal deep — `linear-gradient(165deg, #5EEAD4 0%, #1A7A6E 50%, #0F4C5C 100%)` |
| Card wash | B1 orchid corners · op `0.75` · spread `1` (D-019 recipe) |
| Moon | M4 lilac rim · BL corner · `260px` · op `0.88` · `#FFFFFF` → `#F4EBFF` → `#C9A0F5` → `#6B21A8` · sphere only |
| Ghosts | TL/BR framing · fill `#f5f0ff` · eye `#2a2433` · op `0.85` · bob/dur/phase as prior |

## Why

Teal nest keeps the J8 ice→deep body; orchid corners rhyme left-on-read atmosphere onto the share island; lilac-rim moon keeps the white-family sphere while tying the rim to the wash — without the warm gold→mango→rose fight.

## Displaced

[D-014](D-014-share-finale-kit-j8.md) production look: teal card **without** orchid wash · gold→mango→rose moon · teal ghost eyes. IA / density / stage chrome unchanged.

## Cost

Share card now shares orchid-corner DNA with scenes 5–6 — intentional rhyme; don’t strip the wash without a new decision.

## Source of truth

- Kit: `src/lib/scrapped-card-palette.ts` (`SHARE_FINALE_KIT`)
- Card + wash + moon + ghosts: `ShareRecapCard` (`variant="minimal"`)
- Stage chrome: `ScrappedOrbitArt` (`pattern === "share"`)
- Lock ids: `c-teal` + `m-lilac-rim` · washOp `0.75` · moonOp `0.88`
