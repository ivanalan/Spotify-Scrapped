# D-033: Share finale B2: plain teal · TR moon · mixed ghosts

**Status:** Locked (production)  
**Date:** 2026-10-22  
**Surfaces:** `/scrapped` API deck scene 9: visual art + card body (metrics / brand). IA remains [D-012](D-012-share-finale-inset.md). Composition rules remain [D-013](D-013-share-finale-deck-rhyme-explore.md).

## Decision

Promote the B2 share-finale explore recipe (on-story tune lock):

| Axis | Choice |
|------|--------|
| Kit id | `b2-share-finale` |
| Stage | Ink + intro disks/star (unchanged) |
| Card field | Plain `#1A7A6E` (no nest gradient; no orchid wash) |
| Corners | Sharp (`radiusPx: 0`) |
| Design canvas | Locked **300 × 533** (`maxWidthPx` × `designHeightPx`, 9:16). Stage shell sizes to the slot; CSS `scale(shellW/300)` fits the poster. Export captures the unscaled canvas → ~1080×1920 |
| On-screen size | Height-first shell = min(leftover height, slot×16/9, `maxWidthPx`×16/9); size container is shell-only (credit outside); Share column matches shell max |
| Hero | Band 46% · cover 54% |
| Year | None (no stacked digits on the card) |
| Moon | Lilac-rim sphere · **TR** hero inset (−44, −52) · 164px · op 1 |
| Ghosts | Three in hero band: one **below** cover (14/4/46/−14°) · two **above** (73/24/38/8° · 59/74/48/−3°) |
| Lists | Left on read · Ghosted songs · type (`0.65rem`) · row gap (`0.51rem`) · pad X 16px · pad Y 0 · label gap 0.55rem |
| Metrics | Liked songs · Liked this year (live report counts) · **document flow under lists** · two-column grid aligned with lists · gap after list `metricsGapAfterListPx` 29 · label above number · number 1.3rem · label 0.72rem |
| Brand | `myscrapped.com` · **centered** under metrics · gap `brandGapAfterMetricsPx` 39 · pad bottom `brandPadBottomPx` 16 (no italic Scrapped mark) |

Explore source: `docs/mocks/share-finale-form.html`. Tuned via `/scrapped?tune=share`.

## Why

Wrapped share form puts art peripherals in the hero band and big metrics + URL in the body. Plain teal keeps gradients on the moon only. Stacked year + mixed-z ghosts read as Scrapped without orchid wash fighting the lists. Sharp corners and centered brand match the explore lock.

A fixed design canvas scaled uniformly keeps type and spacing identical on every viewport (phone short height vs desktop). Metrics under the lists (not `bottomPct`) match Wrapped’s band stack and stop the list-to-metric gap from drifting with card height. The 300-wide density + hero 46/54 + body gaps (29 / 39 / 16) are the locked on-story tune.

## Displaced

[D-021](D-021-share-finale-teal-orchid-lilac-moon.md) production look: teal **nest gradient** · B1 orchid wash · BL moon · two whole-card framing ghosts · centered `MyScrapped.com` · no liked metrics. Absolute liked/brand slots (`leftPct` / `bottomPct`) that floated metrics above the card bottom. Prior B2 density at 320×569 / hero 49/55 / tighter gaps 18/16/22. IA / Share / Replay / 9:16 unchanged ([D-012](D-012-share-finale-inset.md)).

## Cost

Share card no longer rhymes orchid corners with scenes 5–6. Metrics need `likedCount` / `likedThisYearCount` on the minimal card. Do not restore nest gradient, orchid wash, or bottom-percent footer slots without a new decision. Shells larger than 300 upscale the design canvas (research tune only).

## Source of truth

- Density + kit: `src/lib/scrapped-card-palette.ts` (`SHARE_FINALE_DENSITY` · `SHARE_FINALE_KIT`)
- Card: `ShareRecapCard` (`variant="minimal"`): hero → lists → metrics → centered brand
- Host shell + scale: `ApiScrappedDeck` scene 9
- Export: `src/lib/share-card-export.ts` (design width → `exportWidthPx`)
- On-story tune (research): `/scrapped?tune=share` → `ShareFinaleLayoutTune` on scene 9; copy JSON then promote into density / kit defaults
