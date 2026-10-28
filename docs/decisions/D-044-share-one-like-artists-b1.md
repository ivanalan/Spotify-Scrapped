# D-044: Share card 2 · `"1 like" artists` · b1 float cover

**Status:** Locked (production)  
**Date:** 2026-10-27  
**Surfaces:** `/scrapped` API deck scene 9, pager index 2 ([D-042](D-042-share-finale-card-pager.md)). Canvas / shell remain [D-012](D-012-share-finale-inset.md) + [D-033](D-033-share-finale-b2-plain-teal.md) density. Card 0 stays B2 teal; card 1 stays G3 yellow ([D-043](D-043-share-all-time-favs-g3-spine.md)).

## Decision

Author share poster 2 as **`"1 like" artists`** from explore kit `b1-float-cover` (one-column tune lock):

| Axis | Choice |
|------|--------|
| Kit id | `b1-float-cover` |
| Field | Ocean nest (scene 4); was rose b1; [D-048](D-048-share-one-like-ocean-field.md) |
| Cover | Same hero band / size as card 0 + G3 (46% / 54%); art from first `one-save-artists` row |
| Chrome | 5 perimeter rising hearts (D-045 floater ladder); card-px rise; paused when card inactive; settled under reduced-motion |
| List | Horizontally centered · width **62%** · type `0.85rem` · label `"1 like" artists` at `0.85rem` · row gap `0.90rem` · label gap `1.00rem` · up to 5 artist names |
| Metrics | **Hidden** (no Liked songs / Liked this year on this poster) |
| Brand | `myscrapped.com` · **centered under list** · size `0.72rem` · track −0.015em · gap after list **55px** (same footer place as card 1) |
| Data | `one-save-artists` top 5; empty → “Nothing here.” |
| Pager | `SHARE_FINALE_CARD_COUNT` = 3 |

Explore lock: `docs/mocks/share-one-column-tune.html` recipe (skin b1 · metrics hidden).

## Why

Scene 4’s one-like beat needed a share poster. Rose + rising hearts rhyme middeck floaters without cloning teal card 0 or yellow G3. Hiding liked metrics frees vertical room so the brand can sit cleanly under the list; quoted `"1 like"` matches the product label ([D-006](D-006-api-story-headline-style.md)).

## Displaced

Pager count 2 ([D-042](D-042-share-finale-card-pager.md)). Visible liked metrics on this poster. Labels `1 like artists` / bare `"1 like"`. Spine brand. Explore kits that replaced the cover with a hero heart.

## Cost

Three visual kits on scene 9. Floaters paint above the list at edges (`z-8`); keep mid-band type clear ([D-015](D-015-list-art-frames-not-heroes.md)). Empty one-save shelf still shares a card (list empty line); no liked metrics on the PNG.

## Source of truth

- Kit: `SHARE_ONE_LIKE_ARTISTS_KIT` in `src/lib/scrapped-card-palette.ts`
- Card: `ShareOneLikeArtistsCard` + `share-one-like-artists.css`
- Host: `ApiScrappedDeck` scene 9 pager child 2
- Count: `SHARE_FINALE_CARD_COUNT` in `ShareFinaleCardPager.tsx`
- Explore: `docs/mocks/share-one-column-tune.html`
