# D-043: Share card 1 · All time favs · G3 spine left

**Status:** Locked (production)  
**Date:** 2026-10-25  
**Surfaces:** `/scrapped` API deck scene 9, pager index 1 ([D-042](D-042-share-finale-card-pager.md)). Canvas / shell remain [D-012](D-012-share-finale-inset.md) + [D-033](D-033-share-finale-b2-plain-teal.md) density. Card 0 stays B2 teal.

## Decision

Author share poster 1 as **All time favs** (G3 cinema):

| Axis | Choice |
|------|--------|
| Kit id | `g3-spine-left` |
| Field | `#F0B429` · dark ink `#1C1C1C` |
| Film | Black rails `#0A0A0A` · 64px · sprockets 16px · holes match field · slow scroll 36s / 42s |
| Cover | Same as card 0 (D-033): hero 46% · size 54% · centered · **z above film** |
| List | Horizontally centered · width 64% · 5 titles · type 0.71rem · pull-up 32px under cover · label `All time favs` |
| Metrics | Liked songs · Liked this year · same flow gaps as D-033 (29 / col 14 / pad X 16) |
| Brand | `myscrapped.com` · **left spine** · size 0.72rem · track −0.015em · x −31px · y 50% · rot −90° · op 1 |
| Data | `second-chance` top 5 (all-time favs still in rotation); hero prefers reunion art |

Explore lock: `docs/mocks/share-all-time-favs.html` recipe `kit: g3-spine-left`.

## Why

The teal dual-list card covers ghosted / left-on-read. A second poster should celebrate the staples that never fully ghosted, rhyming scene 7 film (7L) without cloning middeck chrome onto card 0. Spine brand clears the bottom rail that occluded a centered footer.

## Displaced

Teal placeholder on pager index 1 ([D-042](D-042-share-finale-card-pager.md)). Centered / in-rail / tuck brand placements from the explore. Dual-column lists on this poster. Moon + ghosts on this poster.

## Cost

Two visual kits on scene 9 (`SHARE_FINALE_KIT` + `SHARE_ALL_TIME_FAVS_KIT`). Do not retune card 0 density to match yellow. Empty `second-chance` shows “Nothing here.” on the list; still share liked metrics.

## Source of truth

- Kit: `SHARE_ALL_TIME_FAVS_KIT` in `src/lib/scrapped-card-palette.ts`
- Card: `ShareAllTimeFavsCard`
- Host: `ApiScrappedDeck` scene 9 pager child 1
- Explore: `docs/mocks/share-all-time-favs.html`
