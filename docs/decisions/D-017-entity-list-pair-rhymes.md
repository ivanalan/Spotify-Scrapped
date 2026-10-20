# D-017 — Entity→list pair rhymes (ghosted night · typing pin)

**Status:** Locked  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck scenes 2–3 and 5–6. Explore: [`docs/mocks/explorations/entity-list-pair-rhymes.html`](../mocks/explorations/entity-list-pair-rhymes.html) (favs **N4** · **T1**).

## Decision

Promote the entity→list “one main accent → mini edge chorus” grammar for two pairs. **List beats stay on their locked chrome**; only the entity beat changes to rhyme.

| Pair | Entity (promote) | List (unchanged) |
|------|------------------|------------------|
| Ghosted 2→3 | **N4 night** — ink field · TR moon · sparse edge stars · one BL blob ghost (D-010 ghost asset) | D-010 sky / grass / perimeter ghosts |
| Left on read 5→6 | **T1 typing pin** — compact TL typing bubble (5I bloom fill); mid band clear for artwork | Existing edge-scaled chat frame (quiet → frame) |

## Why

Entity and list were related by copy only (orchid spiral → ink ghosts; full 5I bloom → scaled bloom). Borrowing the hearts/ghosts one→many pattern makes the handoff read as the same story without cloning the list composition onto the entity beat.

## Locked choices

| Axis | Choice |
|------|--------|
| Scene 2 field | `ink` (displaces orchid) |
| Scene 2 accents | Same purple→ember as slide 3 (`#5C1A7A` → `#F05A3D`) |
| Scene 2 motifs | Moon TR · edge stars · one BL D-010 ghost — **no** clouds/grass |
| Scene 3 | Unchanged (D-010) |
| Scene 5 motif | Compact typing pin TL (`--chat-type-w: 86px`) |
| Scene 6 | Unchanged edge chat frame (D-016 / D-015) |
| Explore favs | N4 · T1 |

## Displaced

- Scene 2 orchid field + gold→aqua spiral cascade ([D-007](D-007-orbit-cascade-api-deck.md) ghosted spiral row)
- Scene 5 dual-skew 5I conversation bloom as the entity hero ([D-016](D-016-middeck-metaphor-promote.md) 5I row for entity only — bloom fill reused on pin + list bubbles)

## Cost

Opening trio is no longer ink→ember→orchid (slide 2 joins ink). Two consecutive ink fields (2→3 and 5→6) rely on motif escalation, not field color, for beat change.

## Source of truth

- Motifs: `GhostedNightEntity` in `PeripheralMotifs.tsx`; `LeftOnReadChatChrome` `mode="pin"` + `middeck-metaphors.css`
- Wire: `ScrappedOrbitArt`
- Palette: `SLIDE_SWATCH[2]`, `SLIDE_ACCENTS[2]` in `scrapped-card-palette.ts`
- Explore: `entity-list-pair-rhymes.html`
