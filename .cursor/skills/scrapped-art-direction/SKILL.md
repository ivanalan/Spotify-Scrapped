---
name: scrapped-art-direction
description: >-
  Art direction for Spotify Scrapped story decks and share surfaces. Use when
  editing WrappedStorySlide, ApiScrappedDeck, ScrappedDeck, ShareRecapCard,
  wrapped/* visuals, /scrapped UI, or when the user asks about Scrapped look,
  anti-Wrapped aesthetics, or fixing AI-looking design.
---

# Scrapped art direction

Anti-Wrapped is a **conversation**, not a party. Visual system for main Scrapped =
light solid fills + staggered text. Narrative rules live in
[docs/WRAPPED.md](../../../docs/WRAPPED.md) — this skill is **look only**.

Reference mocks: [docs/mocks/](../../../docs/mocks/). Prefer implementing those
over inventing a parallel system.

**Official Wrapped motion capture (form only):** [docs/mocks/wrapped-ref/](../../../docs/mocks/wrapped-ref/)
— keyframes + named beat index from a 2023 Wrapped screen capture. Motion grammar
vs Scrapped today lives in [docs/WRAPPED.md §10](../../../docs/WRAPPED.md). Use it
to match *pacing / beat spine*, never to import neon art, ribbons, or carnival fills.

Also load when relevant: global `frontend-design`. Scrapped overrides on conflict.

## Locked POV — Scrapped (`/scrapped`)

| Axis | Choice |
|------|--------|
| Substrate | Light solid canvas per beat (`paper` / `cream` / `mist` / `blush` / `sage` / `sky` / `sand` / `slate`) |
| Ink | Near-black text; muted secondary |
| Accent | Progress + chrome only — no hazard neon floods |
| Type | Heavy sans headlines (sentence case); italic for emphasis (“scrapped”, “anti-wrapped”) |
| Geometry | Soft placeholder blocks for future art; no rails, grids, or corner marks for now |
| Motion | **Text first** — same copy enter/layout/outro on every slide; only the numbered 5-row list is special ([D-001](../../../docs/decisions/D-001-story-copy-vs-list-motion.md)). No blob parallax |

**Emotional register:** conversational, dry, slightly merciful — same as WRAPPED.md tone.

## Composition rules

1. **One job per slide** — setup line → reveal → optional aside. No competing heroes.
2. **Type is the graphic** — until real art lands, gray placeholders only.
3. **Solid fills only** — soft tinted backgrounds; no gradients, orbs, hatch, or watermark numerals.
4. **Quiet chrome** — “Scrapped” wordmark, story progress segments, info/close. Soundtrack stays secondary.
5. **Share finale** — same light system; screenshot-legible.

## Hard bans (AI-design tells)

Do **not** introduce:

- Full-bleed saturated neon / purple-indigo glow stacks
- Soft gradient orbs / blurred accent fields
- Diagonal stripe hatch, CRT scanlines, glassmorphism cards
- Multi-layer drop shadows, pill chip rows, emoji decoration
- Dark industrial “receipt” atmosphere on `/scrapped` unless the user asks to revert
- Claiming true skips from Web API affinity proxies

## Surfaces

| Surface | Look |
|---------|------|
| `/scrapped` (`wrapped-story`) | This skill — light conversational story |
| Scrapped Plus `/scrapped/plus` | May stay editorial Anysphere until intentionally unified |
| Scrapped Lab `/scrapped/lab` | Functional Anysphere; not a story carnival |

## Implementation checklist

Before shipping UI changes:

- [ ] Slide background is a solid tint, not art/atmosphere
- [ ] Headline → subline → aside are reading-timed line beats; respect `prefers-reduced-motion`
- [ ] Empty states keep a short honest line
- [ ] No new AI-slop patterns from the ban list
- [ ] Copy matches the API conversational spine in WRAPPED.md

## When stuck

1. Read [docs/WRAPPED.md](../../../docs/WRAPPED.md) for beat/tone (and §10 for motion vs Wrapped).
2. Open [docs/mocks/](../../../docs/mocks/) and match structure before inventing.
3. For “make motion more Wrapped,” compare [docs/mocks/wrapped-ref/named/](../../../docs/mocks/wrapped-ref/named/) to live deck timing — tighten clocks / handoffs, don’t port art.
4. For copy vs list motion bugs, read [SCARS.md](../../../SCARS.md) and [D-001](../../../docs/decisions/D-001-story-copy-vs-list-motion.md) before inventing a third path.
5. Prefer deleting decoration over adding a second treatment.
