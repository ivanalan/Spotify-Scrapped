# D-034: Simple 404 (orchid wash · logo top · centered)

**Status:** Locked  
**Date:** 2026-10-22  
**Surfaces:** `src/app/not-found.tsx` · mock [`docs/mocks/404-page.html`](../mocks/404-page.html)

## Decision

Keep the global 404 minimal:

| Axis | Choice |
|------|--------|
| Field | Ink + A3 orchid corners (`data-scrapped-field="intro-dusk"`); no disks, ghosts, or scrim |
| Brand | Italic **Scrapped** at the top, centered |
| Mid | Centered “Page not found” + one blurb + one primary **Go home** → `/` |
| Chrome | Fixed full-bleed overlay so unknown paths don’t show product nav / max-w shell |

## Why

A missing URL is not a story beat. Matching gate ink + wash keeps brand continuity without borrowing ghost / soft-close / share motifs.

## Displaced

- Motif-heavy 404 explorations (ghosts, teal iris, ember scrub, share nest)
- Secondary About / example CTAs on this surface

## Cost

Unknown routes still mount root layout under the overlay; the fixed layer is the escape hatch instead of teaching `ProductChrome` every bad path.
