# D-021 — Ghosted grass: rise-from-soil cascade

**Status:** Locked  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck scene 2 (ghosted entity). Motif grammar parent: [D-018](D-018-ghosted-ground-sky-s9.md).

## Decision

Entity ridge grass **grows by rising from underground**, not by `scaleY`:

| Axis | Choice |
|------|--------|
| Enter | Each ridge starts translated **down** by its tip→ground height, fully under a soil `clipPath` (`y ≤ H`), then animates `y → 0` |
| Cascade | **Near → mid → far** (front blades first; deeper ridges fill in behind) |
| Sway | Soft skew/x flow only **after** that ridge’s rise finishes |
| Ban | Motion/`framer` **`scaleY`** (and CSS `transform-origin` tricks) for grass grow-in |

## Why

`scaleY` on SVG `<g>` via Motion always reads as expanding from the **horizontal mid-line** — `transform-origin`, `transformBox: fill-box`, and translate→scale→translate wrappers all failed. Rising into a ground clip makes tips emerge from the soil line; cascade sells depth.

## Locked timing (production)

| Ridge | Rise distance (`H − tipY`) | Delay |
|-------|----------------------------|-------|
| Near | ~46 | 0.08s |
| Mid | ~70 | 0.34s |
| Far | ~98 | 0.60s |

Grow duration ≈ 0.85s, ease `[0.22, 1, 0.36, 1]`. Local band `H = 140`.

## Displaced

- Single-group or per-ridge `scaleY: 0 → 1` grow-in on `SpikyGrass`
- Simultaneous three-ridge enter

## Cost

Clip + rise needs rise distances kept in sync with path tip heights if the ridge paths change. No stretch “blade elongation” — growth is emergence, not squash.

## Source of truth

- `SpikyGrass` in `PeripheralMotifs.tsx` (`GhostedNightEntity` / `ListSpikyGrass`)
- Pair motifs: [D-018](D-018-ghosted-ground-sky-s9.md)
