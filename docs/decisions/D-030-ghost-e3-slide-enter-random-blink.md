# D-030 — List ghosts: E3 slide enter + random blink

**Status:** Locked  
**Date:** 2026-10-22  
**Surfaces:** Ghosted songs list perimeter ghosts (`RisingColumnGhosts` / `FloatingBlobGhost`). Haunt + share keep prior enter; haunt also blinks.

## Decision

| Axis | Choice |
|------|--------|
| Enter | **E3** — slide in from the **outer** edge (L ghosts from further left, R from further right) → land at slot → **local bob** on an inner layer |
| Nesting | Outer motion = opacity + `x` enter→land; inner = bob `y` / slight `x` / rotate (same grammar as the HTML explore) |
| Outset | ~48 viewBox units · enter dur ~1.2s · ease `[0.22, 1, 0.36, 1]` · float starts at **55%** of enter |
| Stagger | Unchanged list-beat pad + stagger (D-018 gate) |
| Blink | **Random per ghost** (1.8–7.5s, occasional double); both eyes together; **no cascade** |

Face/hem remain [D-028](D-028-ghost-four-scallop-hem.md) / [D-029](D-029-ghost-outline-blush.md).

## Why

Fade-in-place read as soft but static. E3 matches the hearts “move in then live” idea without exiting the top — ghosts frame the list. Nested bob fixes the settle jump (bob must not retarget `y`/`top`). Random blinks feel alive; staggered CSS delays read as a wave.

## Displaced

- D-018 list ghost enter: opacity fade at rest + bob on the same transform layer

## Cost

Slightly more motion on scene 3; reduced-motion still snaps to landed opacity with no bob/blink. Explore kit: `docs/mocks/ghost-motion-ideas.html` (E3).
