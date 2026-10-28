# D-043: Share card 1 · All time favs · G3 centered brand

**Status:** Locked (production)  
**Date:** 2026-10-25 (brand place revised 2026-10-27)  
**Surfaces:** `/scrapped` API deck scene 9, pager index 1 ([D-042](D-042-share-finale-card-pager.md)). Canvas / shell remain [D-012](D-012-share-finale-inset.md) + [D-033](D-033-share-finale-b2-plain-teal.md) density. Card 0 stays B2 teal.

## Decision

Author share poster 1 as **All time favs** (G3 cinema):

| Axis | Choice |
|------|--------|
| Kit id | `g3-center-brand` |
| Field | `#F0B429` · dark ink `#1C1C1C` |
| Film | Black rails `#0A0A0A` · 64px · sprockets 16px · holes match field · slow scroll 36s / 42s |
| Cover | Same as card 0 (D-033): hero 46% · size 54% · centered · **z above film** |
| List | Horizontally centered · width 64% · 5 titles · type `0.85rem` · pull-up under cover · label `All time favs` |
| Metrics | **Hidden** (no Liked songs / Liked this year) |
| Brand | `myscrapped.com` · **centered under list** (replaces the metrics slot) · size `0.72rem` · track −0.015em · gap after list `55px` (same place as card 2; [D-044](D-044-share-one-like-artists-b1.md)) |
| Data | `second-chance` top 5 (all-time favs still in rotation); hero prefers reunion art |

Explore: `docs/mocks/share-all-time-favs.html` · one-column tune `docs/mocks/share-one-column-tune.html`.

## Why

The teal dual-list card covers ghosted / left-on-read. A second poster should celebrate the staples that never fully ghosted, rhyming scene 7 film (7L) without cloning middeck chrome onto card 0. Dropping liked metrics lets the brand own the footer slot under the list, matching card 2.

## Displaced

Teal placeholder on pager index 1 ([D-042](D-042-share-finale-card-pager.md)). Left spine brand (prior G3 lock). Liked metrics on this poster. Dual-column lists. Moon + ghosts.

## Cost

Two visual kits on scene 9 plus card 2 ([D-044](D-044-share-one-like-artists-b1.md)). Do not retune card 0 density to match yellow. Empty `second-chance` shows “Nothing here.” on the list; liked metrics live only on card 0. Brand must clear the bottom film rail via body pad.

## Source of truth

- Kit: `SHARE_ALL_TIME_FAVS_KIT` in `src/lib/scrapped-card-palette.ts`
- Card: `ShareAllTimeFavsCard`
- Host: `ApiScrappedDeck` scene 9 pager child 1
- Explore: `docs/mocks/share-all-time-favs.html`
