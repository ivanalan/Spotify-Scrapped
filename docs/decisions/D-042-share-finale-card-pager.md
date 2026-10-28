# D-042: Share finale multi-card pager + dots

**Status:** Locked  
**Date:** 2026-10-25  
**Surfaces:** `/scrapped` API deck scene 9. IA base remains [D-012](D-012-share-finale-inset.md); art remains [D-033](D-033-share-finale-b2-plain-teal.md).

## Decision

Match Wrapped’s share-finale **carousel form** (`25-share-finale`):

1. **Three share posters** in a horizontal pager (card 0 = `ShareRecapCard` minimal / D-033; card 1 = All time favs / [D-043](D-043-share-all-time-favs-g3-spine.md); card 2 = `"1 like" artists` / [D-044](D-044-share-one-like-artists-b1.md)).
2. **Pagination dots** under the island (above Share / Replay), active brighter.
3. **Swipe / drag** on the island switches cards; dots are also tappable (40px targets).
4. **Pointer swipe + transform** only (no nested `overflow-x` scroll, no motion `drag`+`animate` on the same axis), so the deck’s snap-x scroller does not steal the gesture. Release always snaps to a whole card (window `pointerup` / lost capture); `user-select: none` + `preventDefault` on pointerdown so web drag does not highlight copy.
5. **Stories hit targets on finale:** scroller rises to `z-37` so the card can receive swipe; a **prev** strip stays at `z-38` over the left 30% (bottom cleared for CTAs); the **next** zone is off so the open side of the card keeps the swipe gesture.
6. **Share** still captures the **active** poster (precapture key includes card index).

## Why

Wrapped’s closing ritual is a swipeable stack of shareable cards with dots, not a single static island. Wiring the pager first (placeholder second card) lets us ship form without blocking on card-1 content.

## Locked choices

| Axis | Choice |
|------|--------|
| Count | 3 (`SHARE_FINALE_CARD_COUNT`); grow only with a new decision |
| Card 1 | All time favs G3 centered brand ([D-043](D-043-share-all-time-favs-g3-spine.md)) |
| Card 2 | `"1 like" artists` b1 float cover ([D-044](D-044-share-one-like-artists-b1.md)) |
| Motion | Spring snap after drag; reduced-motion = instant |
| Dots | Under island; `SHARE_FINALE_DENSITY` `dotsGapAfterCardPx` / `dotSizePx` / `dotsGapPx` |
| Form ref | `docs/mocks/wrapped-ref-2023/25-share-finale.png` |

## Displaced

Single static share island with no pager or dots.

## Cost

Finale next-zone is off; prev is left 30% only. Swipe the open (right) side of the card to change posters. Dots + Share / Replay stay tappable in the column.

## Source of truth

- Pager + dots: `src/components/scrapped/ShareFinaleCardPager.tsx`
- Host: `ApiScrappedDeck` scene 9
- Density: `SHARE_FINALE_DENSITY` in `scrapped-card-palette.ts`
