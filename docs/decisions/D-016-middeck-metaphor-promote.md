# D-016: Middeck metaphor promote (4A / 5I / 7L / 8B)

**Status:** Locked  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck scenes 4-8 orbit chrome.

## Decision

Promote the locked middeck metaphor favorites into production `ScrappedOrbitArt`:

| Scene | Kit | Production chrome |
|------|-----|-------------------|
| 4 | **4A** | One-like heart; linear stroke-draw outline (`pathLength` + dashoffset) → grow fill + soft stamp on HTML wrapper → **s03 cascade** (3 filled hearts behind glyph: grow to max → hold scale → opacity fade, inner→outer die; no dwindle / polar sparks). List: 5 perimeter rising hearts ([D-015](D-015-list-art-frames-not-heroes.md)). Hero + frame stay mounted; `frame` at list narrative (`beatPhase ≥ 3`) so hero fade matches copy exit (`exitTravelSec` 0.42s). Mock: `docs/mocks/heart-animation-ideas.html` (s03). |
| 5 | **T1 pin** | Compact typing bubble (5I bloom fill); mid clear for artwork; [D-017](D-017-entity-list-pair-rhymes.md); field/pin place; [D-019](D-019-left-on-read-orchid-corners.md) |
| 6 | 5I family | Quiet / edge chat frame; list half of D-017; wash + frame tune; [D-019](D-019-left-on-read-orchid-corners.md) |
| 7 | **7L** | Film letterbox **14.5%**, `lb-top: 0`, sprocket inset 26%, holes 12×12, gap 25px, row 23px, smooth sprocket scroll **6s / 7.2s linear**, travel **−20%** (bot reverse); **perf count from strip width** (fill ≥ 200% pitch; not a fixed phone count); bars **present from scene start** (no animate-in); **long smooth retract** (~3.2s, ease `0.4,0,0.2,1`) when reunion list / reveal narrative enters (`beatPhase ≥ 2`). Toolbar forces **ink** chrome (light glyphs) while bars cover the top (setup phases 0-1) |
| 8 | **8B** | Mono teal stepped iris; hole 72% → 10% then hold |

Implementation: `src/components/scrapped/orbit/{OneLikeHeart,LeftOnReadChat,FilmLetterbox,SoftCloseIris}Chrome.tsx` + `middeck-metaphors.css`. Beat phase passes through `orbitChrome` → `ScrappedOrbitArt` (`beatPhase`). Film knobs live in `.mm-film` / this decision.

## Why

These metaphors match the anti-Wrapped conversation register better than the temporary Orbit Cascade placeholders (list clouds, artist ovals on left-on-read, reunion orb rain, soft-close funky pills). Same beat spine; inverted meaning with authored middeck art.

## Displaced

- Scene 4 / 6 classic `ListFrame` (clouds + BL orb) for those indices
- Scene 5 `ArtistOrbitOvals` (D-008 oval ladder) on the **left-on-read entity** slot; D-008 grammar remains available for storyboard / future #1-artist reuse; not the live API left-on-read chrome
- Scene 5 dual-skew **5I hero**: replaced by TL typing pin ([D-017](D-017-entity-list-pair-rhymes.md)); bloom fill still paints pin + list bubbles
- Scene 7 `FunkyOrbRain` / wide orb rain
- Scene 8 soft-close `FunkyPillStack` bookends ([D-007](D-007-orbit-cascade-api-deck.md) soft-close art row); teal **field** stays; motif is iris

## Cost

- Soft-close no longer rhymes with intro funky/pill bookend language; iris is a different farewell verb
- D-008 production surface for left-on-read is gone until a dedicated #1-artist beat returns
- Film bars cover chrome on plot twist: requires temporary ink chrome override

## Source of truth

- Production: orbit chrome modules + CSS above; this decision for “what / why / cost”
