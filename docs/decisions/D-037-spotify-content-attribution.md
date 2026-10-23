# D-037: Spotify content attribution (covers, lists, share stage)

- **Date:** 2026-10-22
- **Status:** Superseded by [D-038](D-038-no-deck-spotify-attribution.md)

## Why (historical)

Spotify Developer Policy expects attribution and a link back when displaying cover art / metadata. Scrapped showed art with only `myscrapped.com` on the share card and no open.spotify path from entity or list beats. Loud treatments (on-cover Open chip, “Content from Spotify” beside the Scrapped wordmark) fight quiet chrome and co-branding distance.

## Decision (historical; see D-038)

1. **Entity covers (A):** Hero cover is an `open.spotify.com` link (`data-spotify-open`). No on-image Open chip. No credit in deck chrome next to Scrapped.
2. **Lists (B):** Each row links to the track or artist on Spotify. Artist/song sublines stay as today (not “Open on Spotify”). Caption **Content from Spotify** via `showSpotifyCredit`: fixed to the bottom of the viewport, center-aligned (not under the last row).
3. **Share finale (C):** Same caption on the ink stage immediately under the 9:16 island (outside the capture node), then Share / Replay below. PNG stays Scrapped-first (`myscrapped.com` only on-card).
4. **Tap zones:** Story side-tap zones remain above content. Zone click hit-tests for `a[data-spotify-open]` underneath and opens that URL instead of advancing.
5. **Out of scope:** On-PNG Spotify credit (mock D); Spotify logo / green in Scrapped chrome.

## Displaced

- Cover Open chip overlay
- “Content from Spotify” as top-right chrome beside the wordmark
- On-card share attribution for the beta

## Cost

Taps on covers/rows open Spotify instead of advancing the story (edges and non-link areas still advance). Hit-testing depends on `elementsFromPoint` under the zone.

## Key files (historical)

- `src/lib/spotify/open-url.ts` (removed in D-038)
- `src/components/scrapped/SpotifyContentCredit.tsx` (removed in D-038)
- `src/components/scrapped/wrapped/WrappedEntityList.tsx`
- `src/components/scrapped/ApiScrappedDeck.tsx`
- Explore mock: `docs/mocks/spotify-attribution.html`
