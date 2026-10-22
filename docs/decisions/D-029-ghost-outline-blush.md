# D-029: Ghost face: outline + blush (S3)

**Status:** Locked  
**Date:** 2026-10-22  
**Surfaces:** Perimeter / haunt / share-finale blob ghosts (`PeripheralMotifs`, `ShareRecapCard`).

## Decision

On top of the D-028 four-scallop body, lock the **S3** face treatment:

| Part | Choice |
|------|--------|
| Fill | Wash `#f5f0ff` (share uses `SF.ghostFill`) |
| Outline | Ink stroke `#1c1c1c` · `1.6` · `round` joins |
| Eyes | Dot pair (cx 24 / 40, cy 26, r 3.2) |
| Cheeks | Soft blush ellipses (`#e8a0b8` @ 0.7) |
| Mouth | None |

## Why

Outline reads as the cream sticker ref without leaving wash territory; blush adds cute without a smile competing with deck copy. Dots stay quiet at edge-ghost sizes.

## Displaced

- Wash-only body with eyes, no stroke / no blush

## Cost

Stroke scales with the body `scale(size/64)`: very small slots get a hairline; don’t shrink below current edge sizes. Eye motion (blink / wink) and list-hover reactions still open; see `docs/mocks/ghost-motion-ideas.html`.
