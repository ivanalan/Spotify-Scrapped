# D-038: No in-deck Spotify attribution or song navigation

- **Date:** 2026-10-22
- **Status:** Locked
- **Supersedes:** [D-037](D-037-spotify-content-attribution.md)

## Why

“Content from Spotify” and cover/row open.spotify taps competed with story pacing. Side tap zones either advanced or opened Spotify; that split made list beats feel like a browser, not a deck. Quiet Scrapped-first chrome wins for the beta.

## Decision

1. **No credit caption** on list beats or the share finale stage.
2. **No open.spotify links** from entity covers or list rows. Art and rows are display-only; taps advance the story.
3. **PNG / share card** stays Scrapped-first (`myscrapped.com` only on-card), unchanged from D-033 / D-037’s PNG rule.

## Displaced

- Entity/list `data-spotify-open` links and zone hit-testing
- Fixed / stage “Content from Spotify” caption
- `SpotifyContentCredit` and `src/lib/spotify/open-url.ts`

## Cost

No in-product link-back to Spotify from story art. Policy / App Review may ask for attribution later; reintroduce then, not as deck chrome by default.

## Key files

- `src/components/scrapped/ApiScrappedDeck.tsx`
- `src/components/scrapped/wrapped/WrappedEntityList.tsx`
