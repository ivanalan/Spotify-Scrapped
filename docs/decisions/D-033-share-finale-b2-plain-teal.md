# D-033: Share finale B2: plain teal · TR moon · mixed ghosts

**Status:** Locked (production)  
**Date:** 2026-10-22  
**Surfaces:** `/scrapped` API deck scene 9: visual art + card body (metrics / brand). IA remains [D-012](D-012-share-finale-inset.md). Composition rules remain [D-013](D-013-share-finale-deck-rhyme-explore.md).

## Decision

Promote the B2 share-finale explore recipe:

| Axis | Choice |
|------|--------|
| Kit id | `b2-share-finale` |
| Stage | Ink + intro disks/star (unchanged) |
| Card field | Plain `#1A7A6E` (no nest gradient; no orchid wash) |
| Corners | Sharp (`radiusPx: 0`) |
| On-screen size | Cap width at `maxWidthPx: 320` (9:16; Share column matches); export still ~1080×1920 |
| Hero | Band 49% · cover 59% |
| Year | None (no stacked digits on the card) |
| Moon | Lilac-rim sphere · **TR** hero inset (−44, −52) · 164px · op 1 |
| Ghosts | Three in hero band: one **below** cover (14/4/46/−14°) · two **above** (73/24/38/8° · 59/74/48/−3°) |
| Lists | Left on read · Ghosted songs · denser type (`0.78rem`) · row gap (`0.42rem`) |
| Metrics | Liked songs · Liked this year (live report counts) · number 1.3rem · label 0.72rem · absolute slots `left 4.4% / bottom 10%` and `left 52% / bottom 10%` |
| Brand | `myscrapped.com` · absolute `left 91% / bottom 4%` · right anchor (no italic Scrapped mark) |

Explore source: `docs/mocks/share-finale-form.html`.

## Why

Wrapped share form puts art peripherals in the hero band and big metrics + URL in the body. Plain teal keeps gradients on the moon only. Stacked year + mixed-z ghosts read as Scrapped without orchid wash fighting the lists. Sharp corners and BR brand match the explore lock.

## Displaced

[D-021](D-021-share-finale-teal-orchid-lilac-moon.md) production look: teal **nest gradient** · B1 orchid wash · BL moon · two whole-card framing ghosts · centered `MyScrapped.com` · no liked metrics. IA / Share / Replay / 9:16 unchanged ([D-012](D-012-share-finale-inset.md)).

## Cost

Share card no longer rhymes orchid corners with scenes 5–6. Metrics need `likedCount` / `likedThisYearCount` on the minimal card. Do not restore nest gradient or orchid wash without a new decision.

## Source of truth

- Density + kit: `src/lib/scrapped-card-palette.ts` (`SHARE_FINALE_DENSITY` · `SHARE_FINALE_KIT`)
- Footer slots: `SHARE_FINALE_FOOTER_DEFAULT` in `ShareFinaleLayoutTune.tsx`
- Card: `ShareRecapCard` (`variant="minimal"`)
- Host CSS vars: `ApiScrappedDeck` scene 9
