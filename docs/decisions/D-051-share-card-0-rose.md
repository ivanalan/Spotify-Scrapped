# D-051: Share card 0 = left-on-read rose + ocean moon

**Status:** Locked (production)  
**Date:** 2026-10-27  
**Surfaces:** `/scrapped` API deck scene 9, pager index 0 (`ShareRecapCard` minimal).

## Decision

Share poster 0 field is plain **rose** (`CARD_PALETTE.rose.bg` / `#C9185B`), the same canvas as left-on-read scenes 5→6 ([D-049](D-049-left-on-read-rose-ocean.md)). The TR moon is an **ocean ice → mid → deep** sphere (volume / one-like water ladder), not the intro circle lilac/orchid rim. Ghost fill, ink, metrics, brand, and density stay as locked under [D-033](D-033-share-finale-b2-plain-teal.md) (`#FBEAFF` ghosts; light ink; 300×533).

| Axis | Choice |
|------|--------|
| Card field | Plain rose `#C9185B` (no nest gradient; no orchid wash) |
| Moon | White → ice `#A5F3FC` → mid `#0284C7` → deep `#075985` |
| Ghosts / IA | Unchanged from D-033 / D-045 ghosts + density |

## Why

Card 0’s left column is “Left on read.” Matching the middeck rose field makes the portable poster rhyme that beat. An ocean moon keeps the left-on-read bloom’s water note on the rose canvas without cloning scene 4’s circle pinks.

## Displaced

- Share card 0 plain ocean deep `#075985` field ([D-045](D-045-one-like-ocean-circle-heart.md) field row)
- Share card 0 circle wash → hot → lilac → orchid moon stops ([D-045](D-045-one-like-ocean-circle-heart.md) moon row)

## Cost

Card 0 pairs rose field with blue moon; card 2 keeps the full ocean nest. Soft close stays ocean deep ([D-047](D-047-soft-close-heart-iris.md)). Do not restore ocean-deep field or lilac-rim moon on card 0 without a new decision.

## Source of truth

- Kit: `SHARE_FINALE_KIT.cardBg` · `SHARE_FINALE_KIT.moon.stops` in `src/lib/scrapped-card-palette.ts`
- Card: `ShareRecapCard` (`variant="minimal"`)
- Left-on-read field: [D-049](D-049-left-on-read-rose-ocean.md)
- Ocean stops: `ONE_LIKE_HEART` / [D-045](D-045-one-like-ocean-circle-heart.md)
- Prior density / ghosts: [D-033](D-033-share-finale-b2-plain-teal.md)
