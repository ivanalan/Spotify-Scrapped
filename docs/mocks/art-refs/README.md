# Art direction mood boards

Reference stills for the `/scrapped/art` research lab. Not production art.

| File | Source language |
|------|-----------------|
| `uni-faculty-geometry.jpg` | Bold faculty posters; diagonal slabs, stripe fields, soft glass planes |
| `soft-surfaces-covers.jpg` | Soft Surfaces album grid; thick organic curves on saturated flats |
| `city-motif-posters.jpg` | City posters; one glyph repeated (dots, petals, dashes, fans) |
| `hand-hills-motif.png` | Authored peripheral: two soft hills + antenna arcs + sparse dots |
| `hand-sun-star-motif.png` | Authored peripheral: gradient sun + pointed star (rotate slowly behind) |
| `hand-skew-orbs.png` | Funky system: skewed gradient pills + orb row; Wrapped-style distort |

## Full-deck storyboard

[`/scrapped/art/storyboard`](../../../src/app/scrapped/art/storyboard/page.tsx) is the **Orbit Cascade** research deep dive. **Production** on `/scrapped` is locked by [D-007](../../../docs/decisions/D-007-orbit-cascade-api-deck.md); tokens in [`src/lib/scrapped-card-palette.ts`](../../../src/lib/scrapped-card-palette.ts).

### Card palette (Wrapped recycle)

Six fields only; never white / cream / mist paper:

`ink · orchid · ember · mango · gold · teal · rose`. Intro lock: ink field + orchid concentric ladder. Opening trio: ink → ember → orchid. Volume: flame ember (black ink) + ice→deep teal ocean.

### Oval lock

All disks / orbs / rings use `OVAL` (`sx: 1.28`, `sy: 0.78`) from `ShapeKit`: wider than tall, never perfect circles. Skew/pill transforms stack on top.

### Peripheral motif craft (avoid AI illustration tells)

- **Named corner subjects**: orbs, clouds, skewed pills.
- **Off-center**: corners only; mid band clear for the list.
- **Delete, don’t add**: if a shape has no name, remove it.
- Ban: unmotivated arc clusters, equal busy-ness, generic blob fields, white canvases.

Wrapped motion form (pacing only): [`../wrapped-ref/`](../wrapped-ref/).
