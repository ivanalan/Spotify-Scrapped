# D-049: Left-on-read rose field + ocean bloom

**Status:** Locked (production)  
**Date:** 2026-10-27  
**Surfaces:** `/scrapped` API deck scenes 5-6. Explore: `docs/mocks/left-on-read-colors.html` (**Rose · ocean**).

## Decision

Promote the left-on-read color lock for scenes 5→6. Geometry (pin place, edge frame scales/skew, quiet→frame) stays [D-019](D-019-left-on-read-orchid-corners.md).

| Axis | Choice |
|------|--------|
| Field | **Rose** canvas (`CARD_PALETTE.rose` / `#C9185B`) |
| Corner wash | Same orchid both corners (`#9B4DE8` @ mix `55%`, wash op `0.75`) |
| Message bloom | Ocean ladder: ice `#A5F3FC` → mid `#0284C7` → deep `#075985` → void `#0A0810` (typing pin + edge bubbles) |
| Typing dots | `#F5F0FF` @ `0.85` |
| Scene 6 frame opacity | Col `0.63` · mirror `0.58` |
| Pin shadow | Void bloom stop @ `45%` |

## Why

Ink + gold/pink 5I bloom felt stranded next to ocean one-like and ember plot-twist. Rose field + orchid wash keeps conversation heat; ocean bubble fill rhymes scene 4 / volume water without cloning the nest gradient onto the canvas.

## Displaced

- Ink canvas + split B1 wash (orchid-deep TL · orchid-ink BR) on scenes 5-6 ([D-019](D-019-left-on-read-orchid-corners.md) field row)
- 5I gold → pink → orchid → deep bloom fill
- Frame opacities col `0.35` / mirror `0.21`

## Cost

Two rose slides mid-deck (after teal one-like, before ember plot twist). Ocean bubbles on rose must stay edge-framed so the list mid band stays readable ([D-015](D-015-list-art-frames-not-heroes.md)). Do not restore ink canvas or 5I gold/pink bloom without a new decision.

## Source of truth

- Palette: `SLIDE_SWATCH[5]` · `SLIDE_SWATCH[6]` = `rose` in `src/lib/scrapped-card-palette.ts`
- Chrome: `LeftOnReadChatChrome` + `middeck-metaphors.css` (`.mm-chat` / `.mm-chat-field`)
- Pin / frame geometry: [D-019](D-019-left-on-read-orchid-corners.md)
- Pair grammar: [D-017](D-017-entity-list-pair-rhymes.md) T1 → edge chorus
