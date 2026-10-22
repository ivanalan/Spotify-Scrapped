# D-013: Share finale visual composition: deck rhymes + stage/card split

**Status:** Locked (composition rules)  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck scene 9 visual art. Production: [D-033](D-033-share-finale-b2-plain-teal.md). Prior nest/orchid: [D-021](D-021-share-finale-teal-orchid-lilac-moon.md). Prior J8: [D-014](D-014-share-finale-kit-j8.md).

## Decision

Once share-finale **IA + density** are locked ([D-012](D-012-share-finale-inset.md)), further visual work follows these rules:

1. **Deck-rhyme kits, not color swaps**: Each kit pairs a **stage backdrop motif** from one deck beat with a **different card-surface motif** from another (or a deliberately plain card). Kits must read as distinct compositions, not retints of the same layout.
2. **Stage behind · card in front**: The stage is a full-bleed backdrop (visible in gutters). The inset card is an opaque island with its own clipped motifs. **No shapes straddle the card edge** (no Wrapped-style bleed that sits half-on / half-off the card).
3. **Density / chrome stay frozen**: Do not re-litigate density, chrome, progress dots, or action width. Those stay at `SHARE_FINALE_DENSITY` / D-012 chrome. Flip compositions only.
4. **Pull from the repo**: Motifs come from locked deck decisions and storyboard specs (intro disks + star, ghosted night, volume ocean, D-008 artist orbit, soft-close iris, perimeter spiral, reunion rain, etc.): not invented neon ribbons.

**Promoted (current):** plain teal · TR moon · mixed-z ghosts; [D-033](D-033-share-finale-b2-plain-teal.md). Prior nest/orchid; [D-021](D-021-share-finale-teal-orchid-lilac-moon.md). Prior J8; [D-014](D-014-share-finale-kit-j8.md).

## Why

Near-identical kits (same layout, palette-only diffs, overlapping bleed art) wasted review cycles and fought the inset-card ritual. Distinct deck rhymes make tradeoffs obvious. A hard z-axis (backdrop vs island) keeps the shareable surface readable and matches Wrapped’s inset form without importing Sound Town ribbons. Locking density stops regressing D-012 while art still moves.

## Locked choices

| Axis | Choice |
|------|--------|
| Kit unit | Composition kit (stage motif + card motif) |
| Z-axis | Stage `z=0` backdrop · opaque card in front · actions below |
| Edge bleed | Forbidden; motifs stay fully on stage **or** fully inside the card |
| Density / chrome | Frozen to D-012 |
| Card footer | `myscrapped.com` bottom-right; no italic Scrapped mark ([D-033](D-033-share-finale-b2-plain-teal.md)) |
| Production art | [D-033](D-033-share-finale-b2-plain-teal.md); plain teal · TR moon · mixed-z ghosts |

## Displaced

- Kits that only retint the same stage/card layout
- Density / chrome knobs after D-012
- Motifs that overlap or straddle the card silhouette

## Cost

Further kit changes must not silently overwrite `SHARE_FINALE_KIT`: promote via a new decision.

## Source of truth

- IA + density (unchanged): [D-012](D-012-share-finale-inset.md), `SHARE_FINALE_DENSITY`
- Motif sources: [D-007](D-007-orbit-cascade-api-deck.md), [D-008](D-008-entity-artist-opaque-orbit-ovals.md), [D-010](D-010-ghosted-list-sky-grass-ghosts.md), `orbitCascade.ts` slide specs
