# D-012 — Share finale inset card + Share / Replay

**Status:** Locked  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck scene 9 (`ApiScrappedDeck`) — not Plus or Lab.

## Decision

The share finale uses **Wrapped-form information architecture** on Scrapped Orbit Cascade tokens:

1. **Full-bleed stage** — slide field fills the viewport (gutters are stage, not letterboxing).
2. **Inset shareable card** — always **9:16** portrait island (Wrapped `25-share-finale` form) with hero + Ghosted artists / Ghosted songs.
3. **Actions below the card** (not inside it) — primary **Share** pill, secondary **Replay from beginning**.

Density is locked via `SHARE_FINALE_DENSITY` in `scrapped-card-palette.ts`.

**Visual art** (stage swatch, card field, motifs) is locked separately in [D-021](D-021-share-finale-teal-orchid-lilac-moon.md) (prior J8 [D-014](D-014-share-finale-kit-j8.md)). Stage/card split: [D-013](D-013-share-finale-deck-rhyme-explore.md).

## Why

Wrapped’s finale ritual is inset card + Share + Replay, not a full-bleed screenshot-only slide. Keeping the stage full-bleed preserves SOUL’s “canvas fills the viewport” rule while the *card* is inset. Locking the card to **9:16** (on screen and in the export PNG) matches Stories / Reels share crops — same form as Wrapped’s closing share island.

## Locked choices

| Axis | Choice |
|------|--------|
| IA | Inset card + Share + Replay below |
| Card aspect | **9:16** always — stage leftover height caps the island; width follows aspect (no flex-stretch to non-portrait) |
| Export PNG | Scale capture so width ≈ **1080** (`exportWidthPx`) → ~1080×1920, still 9:16; rem density stays phone-tuned |
| Card thesis | Hero + Ghosted artists / Ghosted songs |
| Share | Capture **inset card only** → native OS share sheet with PNG file (`shareCardImage` / `navigator.share({ files })` **files-only**). Pre-capture while finale is idle so iOS keeps the tap gesture. User chooses Save/Download or another app. No auto-download when the sheet opens. |
| Replay | `goTo(0)` — same as keyboard `R` |
| Density | `SHARE_FINALE_DENSITY` (gutter 36, radius 4, card↔actions 32, hero 46%/48%, type 0.62rem, …) |
| Tap zones | Bottom cleared on finale so CTAs receive presses |
| Visual kit | [D-014](D-014-share-finale-kit-j8.md) |
| Form ref | `docs/mocks/wrapped-ref/named/25-share-finale.png` |

## Displaced

Gold full-bleed share slide with edge-to-edge `ShareRecapCard` and no Share / Replay CTAs (screenshot-only habit). URL / clipboard / `navigator.share({ title, text, url })` without the card image. Auto-download PNG with no OS sheet. Flex-stretched inset card whose aspect followed leftover viewport (non-9:16 share files).

## Cost

Desktop browsers that lack `canShare({ files })` fall back to a direct PNG download (no sheet). iOS requires files-only ShareData + precapture before tap (see SCARS). Ghost bob may freeze mid-frame in the PNG. No Instagram deep link. Plus finale unchanged. Short / wide viewports leave more stage beside a shorter 9:16 island. Agents must not restore URL-only share, title/text+files ShareData, silent auto-download-as-primary, or non-9:16 stretch cards without revisiting this decision.

## Source of truth

- Density: `src/lib/scrapped-card-palette.ts` (`SHARE_FINALE_DENSITY`)
- Visual kit: [D-014](D-014-share-finale-kit-j8.md) / `SHARE_FINALE_KIT`
- Share: `src/lib/share-card-export.ts` (`shareCardImage`)
- Layout / CTAs: `src/components/scrapped/ApiScrappedDeck.tsx` scene 9
- Card: `src/components/scrapped/ShareRecapCard.tsx` (`minimal`)
