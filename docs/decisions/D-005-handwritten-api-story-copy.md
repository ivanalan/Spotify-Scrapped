# D-005 — Handwritten API story copy

- **Date:** 2026-10-16
- **Status:** Locked

## Why

`/scrapped` deck copy was regenerating toward generic AI voice and drifting from the anti-Wrapped ritual. Canvas review (`scrapped-story-copy.canvas.tsx`, `scenePicks_v3`) locked handwritten lines — prefer `pick=custom` “Your text”, else the chosen A/B/C proposal. Agents need that lock so they don’t rewrite the spine on every pass.

## Decision

1. **Shipped lines** for the API story deck live in `ApiScrappedDeck.tsx` (`sceneCopyPlans` for beat timing + matching slide JSX). Don’t invent a parallel copy source.
2. **Voice:** dry / merciful conversational roast. Per beat: headline → optional subline → optional aside. Across a scene: hook/setup → scale or sting → name the receipt (metric or list). Never claim true skips from affinity proxies.
3. **Headline style** (≤6 words, open compounds, favs, 1 like): [D-006](D-006-api-story-headline-style.md).
4. **Soft-empty:** when a gate fails, keep the beat with an honest soft line — don’t drop the slot or invent filler.
5. **Closer (scene 8)** is **two beats** (warm exit, then forward look) before the share finale. Update [WRAPPED.md](../WRAPPED.md) conversational spine when beat *jobs* or beat counts change — not for every wording tweak.
6. Exact wording is locked as shipped; revise only with an explicit copy pass (re-open this decision or supersede it).

## Displaced

- Regenerating scene copy from proposals / LLM defaults without a handwritten pass
- One-beat closer (“That was fun.” / “Same time next year?”)
- Industrial / receipt-chrome phrasing that fights the conversational mock voice

## Cost

`sceneCopyPlans` and slide JSX must stay in sync (timing vs on-screen). Soft-empty variants are part of the lock — changing a headline means checking its empty gate. Spine beat jobs stay in WRAPPED.md; don’t paste full lines into every doc.

## Key files

- `src/components/scrapped/ApiScrappedDeck.tsx`
- `docs/WRAPPED.md` (conversational spine beat jobs)
- Canvas review artifact: `scrapped-story-copy.canvas.tsx` / `scenePicks_v3` (not runtime SoT)
