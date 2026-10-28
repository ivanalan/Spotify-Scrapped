# D-046: Plot twist uses volume ember field

**Status:** Locked  
**Date:** 2026-10-27  
**Surfaces:** `/scrapped` API deck scene 7 (plot twist / reunion); film sprocket holes.

## Decision

Scene 7 swatch is **ember** (same flame orange→yellow gradient as volume / slide 1), not flat mango. Film letterbox `--film-field` uses ember mid `#FF7A3A` so sprocket punches read as the field showing through.

## Why

Plot twist’s flat mango read as a different yellow than the volume sky. Matching ember keeps the warm light-theme bookend rhyme without inventing a third orange.

## Displaced

- `SLIDE_SWATCH[7] = "mango"` (flat `#FF9F1C`)
- Film `--film-field: var(--mm-mango)`

## Cost

- Mango stays in `CARD_PALETTE` for research / unused production slides; deck no longer assigns it.
- Gradient field means sprocket holes approximate mid-ember, not every stop of the sky.

## Source of truth

- `SLIDE_SWATCH` + `EMBER_FIELD_GRADIENT` in `src/lib/scrapped-card-palette.ts`
- Ember slide fill in `src/app/globals.css` (`data-wrapped-tone="ember"`)
- Film tokens in `middeck-metaphors.css` (geometry still [D-016](D-016-middeck-metaphor-promote.md))
