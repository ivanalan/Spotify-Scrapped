# D-012: Share finale inset card + Share / Replay

**Status:** Locked  
**Date:** 2026-10-19  
**Surfaces:** `/scrapped` API deck scene 9 (`ApiScrappedDeck`): not Plus or Lab.

## Decision

The share finale uses **Wrapped-form information architecture** on Scrapped Orbit Cascade tokens:

1. **Full-bleed stage**: slide field fills the viewport (gutters are stage, not letterboxing).
2. **Inset shareable card(s)**: always **9:16** portrait island (Wrapped `25-share-finale` form). Card 0 is hero + Left on read / Ghosted songs; additional cards via [D-042](D-042-share-finale-card-pager.md).
3. **Dots under the island** then actions: primary **Share** pill, secondary **Replay from beginning** ([D-042](D-042-share-finale-card-pager.md)).

Density is locked via `SHARE_FINALE_DENSITY` in `scrapped-card-palette.ts`.

**Visual art** (stage swatch, card field, motifs) is locked separately in [D-033](D-033-share-finale-b2-plain-teal.md) (prior [D-021](D-021-share-finale-teal-orchid-lilac-moon.md) / J8 [D-014](D-014-share-finale-kit-j8.md)). Stage/card split: [D-013](D-013-share-finale-deck-rhyme-explore.md). Multi-card pager: [D-042](D-042-share-finale-card-pager.md).

## Why

Wrapped’s finale ritual is inset card + Share + Replay, not a full-bleed screenshot-only slide. Keeping the stage full-bleed preserves SOUL’s “canvas fills the viewport” rule while the *card* is inset. Locking the card to **9:16** (on screen and in the export PNG) matches Stories / Reels share crops; same form as Wrapped’s closing share island.

## Locked choices

| Axis | Choice |
|------|--------|
| IA | Inset card(s) + dots + Share / Replay below ([D-042](D-042-share-finale-card-pager.md)) |
| Card aspect | **9:16** always; `--share-shell-w` = min(slot, leftover×9/16, `maxWidthPx` **300**); shell width uses that var; no flex-stretch to non-portrait |
| Preview fit | Size container is **shell-only**. Dots + Share sit outside that container. Same `--share-shell-w` drives `scale(var(--share-shell-w) / 300)` so iOS cannot mis-scale a nested `cqw` and clip the right/bottom |
| Design canvas | Locked **300 × 533** poster; shell scales it uniformly via `--share-shell-w`. Type/spacing identical on every viewport; [D-033](D-033-share-finale-b2-plain-teal.md) |
| Export PNG | Capture the **active** unscaled design node with explicit `width`/`height` = 300×533 (ignore stage `transform` bounding box); raster scale = `exportWidthPx / maxWidthPx` → ~1080×1920, still 9:16 |
| Card thesis | Hero + Left on read / Ghosted songs + liked metrics under lists + centered brand (card 0); further cards [D-042](D-042-share-finale-card-pager.md) |
| Share | Capture **active inset card only** → native OS share sheet with PNG file (`shareCardImage` / `navigator.share({ files })` **files-only**). Pre-capture while finale is idle so iOS keeps the tap gesture. User chooses Save/Download or another app. No auto-download when the sheet opens. |
| Replay | `goTo(0)`: same as keyboard `R`; resets pager to card 0 |
| Density | `SHARE_FINALE_DENSITY` (gutter 36, radius 0, design 300×533, card↔dots↔actions, hero 46%/54%, type 0.65rem, metrics gap 29, …); art kit [D-033](D-033-share-finale-b2-plain-teal.md) |
| Host pad | `paddingBottom: max(bodyBottomPx, env(safe-area-inset-bottom))` so CTAs clear the home indicator |
| Tap zones | Finale: prev strip left 30% (`z-38`); next off; scroller `z-37` so card swipe works ([D-042](D-042-share-finale-card-pager.md)) |
| Visual kit | [D-033](D-033-share-finale-b2-plain-teal.md) (prior [D-021](D-021-share-finale-teal-orchid-lilac-moon.md) / [D-014](D-014-share-finale-kit-j8.md)) |
| Form ref | `docs/mocks/wrapped-ref-2023/25-share-finale.png` |

## Displaced

Gold full-bleed share slide with edge-to-edge `ShareRecapCard` and no Share / Replay CTAs (screenshot-only habit). URL / clipboard / `navigator.share({ title, text, url })` without the card image. Auto-download PNG with no OS sheet. Flex-stretched inset card whose aspect followed leftover viewport (non-9:16 share files).

## Cost

Desktop browsers that lack `canShare({ files })` fall back to a direct PNG download (no sheet). iOS requires files-only ShareData + precapture before tap (see SCARS). Ghost bob may freeze mid-frame in the PNG. No Instagram deep link. Plus finale unchanged. Wide / tall viewports leave more stage around a capped 9:16 shell (Share column matches); the poster inside stays 300×533 scaled down. Agents must not restore URL-only share, title/text+files ShareData, silent auto-download-as-primary, uncapped desktop growth, rem-reflowing islands without uniform scale, credit inside the shell size container, nested shell `cqw` scale (iOS right/bottom clip), or non-9:16 stretch cards without revisiting this decision.

## Source of truth

- Density: `src/lib/scrapped-card-palette.ts` (`SHARE_FINALE_DENSITY`)
- Visual kit: [D-033](D-033-share-finale-b2-plain-teal.md) / `SHARE_FINALE_KIT`
- Share: `src/lib/share-card-export.ts` (`shareCardImage`)
- Layout / CTAs: `src/components/scrapped/ApiScrappedDeck.tsx` scene 9
- Pager + dots: [D-042](D-042-share-finale-card-pager.md) / `ShareFinaleCardPager.tsx`
- Card: `src/components/scrapped/ShareRecapCard.tsx` (`minimal`)
