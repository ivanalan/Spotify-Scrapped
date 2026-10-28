# D-048: Share card 2 field = scene 4 ocean nest

**Status:** Locked (production)  
**Date:** 2026-10-27  
**Surfaces:** `/scrapped` API deck scene 9, pager index 2 (`ShareOneLikeArtistsCard`).

## Decision

Share poster 2 field is the scene 4 **ocean nest** gradient (`ONE_LIKE_OCEAN_GRADIENT`: ice → mid → deep), not rose. Rising hearts keep the scene 4 / D-045 floater ladder (hot · lilac · orchid · rose · hot). Light ink on blue. IA, density, list, brand, and metrics-hidden stay [D-044](D-044-share-one-like-artists-b1.md).

## Why

The poster should read as the same beat as middeck “1 like artists”: blue ocean + those hearts. Rose b1 made the share card a different skin from the story slide.

## Displaced

- `SHARE_ONE_LIKE_ARTISTS_KIT.cardBg = CARD_PALETTE.rose.bg` ([D-044](D-044-share-one-like-artists-b1.md) field row)

## Cost

Card 0 is plain rose ([D-051](D-051-share-card-0-rose.md)); card 2 is the crest→deep ocean nest. Split heat vs water on the pager; gradient keeps scene-4 rhyme. Do not restore rose field on card 2 without a new decision.

## Source of truth

- Kit: `SHARE_ONE_LIKE_ARTISTS_KIT` in `src/lib/scrapped-card-palette.ts`
- Tokens: `ONE_LIKE_OCEAN_GRADIENT` · `ONE_LIKE_HEART.floaters`
- Prior IA: [D-044](D-044-share-one-like-artists-b1.md); ocean stops: [D-045](D-045-one-like-ocean-circle-heart.md)
