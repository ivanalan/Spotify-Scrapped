# D-053: "All star setlist" + fav in titles, favorite in subtitles

- **Date:** 2026-10-29
- **Status:** Locked

## Decision

1. The scene 7 list slide headline is **All star setlist** (open compound, no "The"). Its subline is **All time favorites still in rotation**.
2. Share card 1 list label is **All star setlist** (was `All time favs`). The card keeps its [D-043](D-043-share-all-time-favs-g3-spine.md) layout; only the label changed.
3. **Word rule:** in a **subline / subtitle**, write **favorite(s)**. In a **headline / bigger title**, **fav(s)** is fine (for example "36 all time favs got ghosted").

## Why

"favs" reads fine in a big display line but looks clipped in small subtitle type. "All star setlist" names the beat better than "All time favs" and rhymes with the deck's open-compound headline style.

## Displaced

- [D-006](D-006-api-story-headline-style.md) rule 3 ("Prefer favs / fav over favorites") **for sublines only**; headlines still follow it.
- Headline "The all-star setlist" and subline "All-time favs still in rotation" in `ApiScrappedDeck.tsx` (both the single-song and list variants).
- Share card 1 label `All time favs` in `SHARE_ALL_TIME_FAVS_KIT.listLabel`.

## Cost

Handwritten story copy ([D-005](D-005-handwritten-api-story-copy.md)) changed in nine subline strings (`fav` to `favorite`). The Lab "means" line for All-star staples was also changed to "favorites" so it matches. Component and kit names (`ShareAllTimeFavsCard`, `SHARE_ALL_TIME_FAVS_KIT`) and D-043's filename stay as is. "No all-stars on the board." and the Lab title "All-star staples" were left alone.

## Key files

- `src/components/scrapped/ApiScrappedDeck.tsx`
- `src/lib/scrapped-card-palette.ts`
- `src/lib/scrapped-api.ts`, `src/data/walkthrough-report.json`
