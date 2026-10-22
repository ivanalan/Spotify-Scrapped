# D-014: Share finale kit J8 (ink stage / teal card)

**Status:** Superseded (production art) by [D-021](D-021-share-finale-teal-orchid-lilac-moon.md)  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck scene 9: visual art only. IA + density remain [D-012](D-012-share-finale-inset.md). Stage/card split: [D-013](D-013-share-finale-deck-rhyme-explore.md). Superseded by [D-021](D-021-share-finale-teal-orchid-lilac-moon.md).

## Decision

Promote kit **`j-ink-teal-card`** (Kit J8) to production share finale:

1. **Stage**: ink field (`SLIDE_SWATCH[9] = ink`); intro concentric disks + BR pointed star (same chrome as open / `INTRO_*` tokens).
2. **Card**: teal ice→deep gradient; light type; hero + Left on read / Ghosted songs; footer **`MyScrapped.com`** (sentence case).
3. **Moon**: large BL sphere (not the ghost-night purple→ember): gold → mango → rose radial; **center on the card’s bottom-left corner**; sphere only: no outer glow ring.
4. **Ghosts**: two wash blobs framing the album art (TL + BR of the hero square); bob/wiggle as locked.
5. **Z-axis**: stage chrome behind; opaque card in front; no edge-bleed motifs ([D-013](D-013-share-finale-deck-rhyme-explore.md)).

Density, Share / Replay CTAs, and tap-zone clearance stay [D-012](D-012-share-finale-inset.md).

## Why

This kit beat the prior ember-stage / ink-card ship look: intro bookends the story on the stage while the teal card + framing ghosts carry the “ghosted” thesis without cloud/grass noise. The large BL corner moon sphere (warm gold→mango→rose) warms the teal card without cloning the ghost-night purple→ember treatment.

## Locked choices

| Axis | Choice |
|------|--------|
| Kit id | `j-ink-teal-card` |
| Stage | `#12101A` + intro disks/star |
| Card field | `linear-gradient(165deg, #5EEAD4 0%, #1A7A6E 50%, #0F4C5C 100%)` |
| Moon | BL corner · center on `(0, 100%)` · `260px` diameter · `#FFF4D6` → `#FF9F1C` → `#C9185B` · sphere only (no glow) · idle breathe ~5.2s ±5.5% after enter |
| Ghosts | TL `6%/6%/46px` · BR `76%/36%/56px` · fill `#f5f0ff` · eye `#0F4C5C` · bob 10 · dur 4.3s · phase 1.2s · opacity 0.85 |
| Z-order | Art (moon/ghosts) under type; hero / lists / `MyScrapped.com` stay above the sphere |
| Brand | `MyScrapped.com` |
| Tokens | `SHARE_FINALE_KIT` + `SHARE_FINALE_DENSITY` in `scrapped-card-palette.ts` |

## Displaced

D-012 production look: ember flame stage + nested ink card (no ghosts, no stage intro chrome). IA (inset card + Share / Replay) unchanged.

## Cost

Share slide and intro now share disk/star chrome; intentional rhyme; agents must not blank share art again without revisiting this decision. Plus finale unchanged.

## Source of truth

- Kit + density: `src/lib/scrapped-card-palette.ts` (`SHARE_FINALE_KIT`, `SHARE_FINALE_DENSITY`, `SLIDE_SWATCH[9]`)
- Stage chrome: `ScrappedOrbitArt` (`pattern === "share"` → `IntroCornerChrome`)
- Card + moon + ghosts + footer: `ShareRecapCard` (`variant="minimal"`)
- Host: `ApiScrappedDeck` scene 9
- Superseded production look: [D-020](D-020-share-finale-orchid-corners-white-moon.md) → [D-021](D-021-share-finale-teal-orchid-lilac-moon.md)
