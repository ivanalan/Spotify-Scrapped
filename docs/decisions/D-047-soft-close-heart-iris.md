# D-047: Soft close uses heart iris (1-like ladder)

**Status:** Locked (production)  
**Date:** 2026-10-27  
**Surfaces:** `/scrapped` API deck scene 8 (soft close).

## Decision

Soft-close motif is a **heart-shaped** iris (not circles) on flat ocean deep (`soft-close-ocean`). Explore lock from `docs/mocks/soft-close-heart-iris.html`:

| Axis | Choice |
|------|--------|
| Field | Ocean deep `#075985` |
| Rings (back → front) | `#075985` @ 0.60 · `#0284C7` @ 0.60 · `#075985` @ 1.04 · `#9B4DE8` @ 0.85 · `#E070FF` @ 0.60 |
| Plug | Rose `#C9185B` · scale **1.56 → 0.41** · 3.6s (8B ease; [D-016](D-016-middeck-metaphor-promote.md)) |
| Void fill | **None** (ocean field reads around the cluster) |
| Type | Light ink on rose plug |

## Why

Circle rings read as a different geometry from the middeck / share `"1 like"` heart system. Compact ocean + orchid/hot rings with a rose plug keep the soft-close shrink verb while rhyming scene 4 stops; the rose aperture still holds light hero copy.

## Displaced

- Circle radial-gradient iris rings (D-045 soft-close row)
- Full-bleed nested ladder (deep → orchid → lilac → hot → rose) with ocean plug @ 1.55 → 0.48
- Void `#0A0810` full-bleed under the hearts

## Cost

Rings 1 and 2 share scale 0.60 (ring 1 is fully covered). Compact scales leave most of the canvas as ocean field; do not restore circle iris or the large full-bleed ladder without a new decision.

## Source of truth

- Chrome: `SoftCloseIrisChrome.tsx` + `.mm-iris--heart` in `middeck-metaphors.css`
- Tokens: `ONE_LIKE_HEART` in `src/lib/scrapped-card-palette.ts`
- Field: `data-scrapped-field="soft-close-ocean"` in `globals.css`
- Explore: `docs/mocks/soft-close-heart-iris.html`
- Prior ocean stops: [D-045](D-045-one-like-ocean-circle-heart.md); motion: [D-016](D-016-middeck-metaphor-promote.md)
