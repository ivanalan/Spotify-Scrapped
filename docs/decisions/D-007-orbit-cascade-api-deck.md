# D-007 — Orbit Cascade on the API Scrapped deck

**Status:** Locked  
**Date:** 2026-10-18  
**Surfaces:** `/scrapped` API deck (`ApiScrappedDeck`) + landing gate / home loading — not Plus or Lab.

## Decision

The API story deck uses **Orbit Cascade**: a card palette with peripheral oval / orb / skewed-pill art (plus one ocean-wave exception on the liked-volume beat). Light paper/cream/mist canvases are displaced on this surface.

## Why

Storyboard research at `/scrapped/art/storyboard` locked a Wrapped-*form* look (hard card cuts, recycled fields, corner motifs) without cloning Wrapped neon ribbons. Ink open + ember volume ocean + orchid ghosted spiral read clearer than soft paper tints while staying Scrapped (anti-party, conversational copy still owns the beat).

## Locked choices

| Axis | Choice |
|------|--------|
| Palette | `ink · orchid · ember · mango · gold · teal · rose` — see `src/lib/scrapped-card-palette.ts` |
| Intro | Ink field + orchid concentric oval ladder |
| Opening trio | ink → ember → orchid (slides 00–02); rest recycle the swatches |
| Ghosted spiral | Orchid field; gold→aqua GradOrbs on a perimeter-biased spiral; slow in-place cascade then drift |
| Volume | Bright ember field (**light theme** / black ink) + aqua→blue ocean; tide rises on “joined this year” |
| Geometry | Ovals (`OVAL` sx/sy) by default; volume may use a bottom ocean wave (not a disk) |
| Art role | Peripheral chrome behind copy; clear mid band for type and lists |
| Motion | D-001 unchanged — shared copy motion; only the 5-row list is special. Volume tide is art chrome keyed to narrative beat, not a copy-motion fork. |
| Theme | **Each story is dark or light** — from the swatch’s ink mode (`dark` = light foreground, `light` = dark foreground). See `slideChromeTheme()`. |
| Ink | Dark theme → `#f5f5f5` text; light theme → `#1c1c1c` text |
| Deck chrome | Wordmark, progress, pause/sound/close **follow the active slide’s theme** (`data-wrapped-tone` on the chrome host in `ApiScrappedDeck`) |

## Contrast rules

- Every tone sets `--wrapped-canvas`, `--wrapped-ink`, `--wrapped-muted`, `--wrapped-panel`, and progress vars together.
- Target WCAG AA: large display ≥ 3:1, body ≥ 4.5:1 vs the solid field (not vs decorative disks).
- Prefer clear mid-band over darkening vibrant art under type.
- No white / cream / mist paper fills on the API deck.
- Never leave deck chrome on a stale theme while the active story field has switched.

## Displaced

Light conversational paper tones (`paper` / `cream` / `mist` / …) as the `/scrapped` substrate.

## Cost

Denser art; risk of type/art collision if mid-band is ignored. Plus / Lab stay on prior looks until intentionally unified. Gate matches intro (ink + orchid ladder).

## Source of truth

- Tokens: `src/lib/scrapped-card-palette.ts`
- CSS: `.wrapped-story[data-wrapped-tone=…]` in `src/app/globals.css`
- Art: `src/components/scrapped/orbit/ScrappedOrbitArt.tsx`
- Skill: `.cursor/skills/scrapped-art-direction/SKILL.md`
