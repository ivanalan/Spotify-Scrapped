---
name: scrapped-art-direction
description: >-
  Art direction for Spotify Scrapped story decks and share surfaces. Use when
  editing WrappedStorySlide, ApiScrappedDeck, ScrappedDeck, ShareRecapCard,
  wrapped/* visuals, /scrapped UI, or when the user asks about Scrapped look,
  anti-Wrapped aesthetics, or fixing AI-looking design.
---

# Scrapped art direction

Anti-Wrapped is a **conversation**, not a party. Narrative rules live in
[docs/WRAPPED.md](../../../docs/WRAPPED.md); this skill is **look only**.

Reference mocks: [docs/mocks/](../../../docs/mocks/). Prefer implementing those
over inventing a parallel system.

**Official Wrapped motion capture (form only):** [docs/mocks/wrapped-ref/](../../../docs/mocks/wrapped-ref/)
(2023) and [docs/mocks/wrapped-ref-2024/](../../../docs/mocks/wrapped-ref-2024/)
(2024 Music Evolution / AI podcast); keyframes + named beat indexes. Motion grammar
vs Scrapped today lives in [docs/WRAPPED.md §10](../../../docs/WRAPPED.md). Use it
to match *pacing / beat spine*, never to import neon ribbons or Sound Town.

Also load when relevant: global `frontend-design`. Scrapped overrides on conflict.

## Locked POV; Scrapped (`/scrapped`); [D-007](../../../docs/decisions/D-007-orbit-cascade-api-deck.md)

| Axis | Choice |
|------|--------|
| Direction | **Orbit Cascade**: ovals / orbs / skewed pills; hard card-cut fields |
| Substrate | Card palette: `ink · orchid · ember · mango · gold · teal · rose` ([`scrapped-card-palette.ts`](../../../src/lib/scrapped-card-palette.ts)) |
| Intro | A3 orchid corners (`INTRO_FIELD_GRADIENT`) + orchid concentric oval ladder; gate + slide 0 only. **Gate** uses kit D6 (dim + down/outboard + top scrim); [D-022](../../../docs/decisions/D-022-about-page-gate-d6.md); story intro / share keep default ladder |
| Opening | ink → ember → ink (ghosted: grass · entity S9 grow-in · cover-TL haunt fade → list TR-corner moon · 5 slow-fade ghosts; [D-018](../../../docs/decisions/D-018-ghosted-ground-sky-s9.md)) |
| Volume | Flame ember field (light theme / black ink) + ice→deep teal ocean; high tide on “joined” beat; fish = liked-this-year (1:1, cap 15) from subtitle → viewport bottom |
| Theme | **Per-story dark or light**: swatch ink mode; deck chrome (wordmark / progress / controls) must match the active slide |
| Ink | Dark theme → light text (`#f5f5f5`); light theme → dark text (`#1c1c1c`) |
| Accent | Motif gradients within the 6 swatches; not hazard neon floods / ribbons |
| Type | **Poppins** everywhere; heavy display headlines (sentence case); italic for emphasis (“scrapped”, “anti-wrapped”). **Logo wordmark “Scrapped” is always italic** ([D-011](../../../docs/decisions/D-011-scrapped-logo-italic.md)). Roles: `text-display` / `text-title` / `text-body` / `text-caption` ([D-002](../../../docs/decisions/D-002-poppins-mobile-first.md)) |
| Viewport | **Mobile-first, responsive**: compose for phone first; canvas fills the viewport (no dark side gutters). Wide: corner pins ([D-009](../../../docs/decisions/D-009-responsive-motif-pins.md)); phone keeps legacy `MotifStage` slice except intro + soft-close bookends (pinned) |
| Geometry | Locked ovals (`OVAL`) by default; volume uses a bottom ocean wave; art in corners / edges; **clear mid band** for copy + lists |
| #1 artist | Oval ladder grammar; [D-008](../../../docs/decisions/D-008-entity-artist-opaque-orbit-ovals.md). Live **left-on-read** entity uses **T1 typing pin**: [D-017](../../../docs/decisions/D-017-entity-list-pair-rhymes.md) |
| Ghosted list | **Slide 3 only**: TR-corner moon (no halo) · 5 slow-fade-then-float ghosts · C8 chrome scrim · **no stars**: [D-018](../../../docs/decisions/D-018-ghosted-ground-sky-s9.md) |
| Ghosted entity | **Slide 2**: ink · grass (rise-from-soil cascade; [D-021](../../../docs/decisions/D-021-ghosted-grass-rise-from-soil.md)) · entity S9 grow-in · cover-TL haunt slow-fade · no moon; [D-018](../../../docs/decisions/D-018-ghosted-ground-sky-s9.md) |
| List beats | Art **frames** the list (edges only); never a mid-band hero over rows; [D-015](../../../docs/decisions/D-015-list-art-frames-not-heroes.md). Scene 4 rising hearts · scene 6 chat frame; [D-016](../../../docs/decisions/D-016-middeck-metaphor-promote.md) |
| Soft close | **Teal** field (flat) · **8B mono teal iris** shrink-to-stop; [D-016](../../../docs/decisions/D-016-middeck-metaphor-promote.md) |
| Middeck 4-7 | Scene 4: **teal nest** (`TEAL_NEST_GRADIENT` / share C0) + **4A** heart (s03 cascade) · **T1** typing pin · **7L** film letterbox; [D-016](../../../docs/decisions/D-016-middeck-metaphor-promote.md) / [D-017](../../../docs/decisions/D-017-entity-list-pair-rhymes.md) |
| Left on read 5→6 field | Ink + **B1 orchid corners** wash · pin/frame geometry; [D-019](../../../docs/decisions/D-019-left-on-read-orchid-corners.md) |
| Entity→list rhyme | Ghosted D-018 · left-on-read T1; [D-018](../../../docs/decisions/D-018-ghosted-ground-sky-s9.md) / [D-017](../../../docs/decisions/D-017-entity-list-pair-rhymes.md) |
| Share finale | **9:16** inset card(s) + dots + Share / Replay; locked **300×533** canvas scaled to shell; metrics flow under lists; [D-012](../../../docs/decisions/D-012-share-finale-inset.md), [D-042](../../../docs/decisions/D-042-share-finale-card-pager.md). Production: **ink** stage · **plain teal** · TR moon · mixed-z hero ghosts · centered `myscrapped.com`; [D-033](../../../docs/decisions/D-033-share-finale-b2-plain-teal.md). Stage/card split; [D-013](../../../docs/decisions/D-013-share-finale-deck-rhyme-explore.md). No stage Spotify credit; covers/rows display-only; [D-038](../../../docs/decisions/D-038-no-deck-spotify-attribution.md) |
| Motion | **Text first**: same copy enter/layout/outro on every slide; only the numbered 5-row list is special ([D-001](../../../docs/decisions/D-001-story-copy-vs-list-motion.md)). Art is peripheral chrome, not a second copy-motion path |

**Emotional register:** conversational, dry, slightly merciful: same as WRAPPED.md tone.

## Composition rules

1. **Mobile-first, full-bleed**: design phone density first; on larger screens keep left-aligned content and let the canvas fill the viewport. Wide orbit chrome uses motif pins ([D-009](../../../docs/decisions/D-009-responsive-motif-pins.md)); phone `MotifStage` stays for mid patterns: intro + soft close stay pinned (slice crops bookends).
2. **One job per slide**: setup line → reveal → optional aside. No competing heroes.
3. **Type owns the mid band**: art stays TL / BL / top drift / corner rain. Prefer clear field over putting body type on vibrant disks. On **list** beats, art only frames edges: [D-015](../../../docs/decisions/D-015-list-art-frames-not-heroes.md); do not scale the entity hero onto the list.
4. **Contrast**: every tone sets canvas + ink + muted + panel + progress together. Muted stays near ink (`INK_MUTED` ≈ 90%/88%), not washed grey. WCAG AA vs solid field (large ≥ 3:1, body ≥ 4.5:1).
5. **Quiet chrome**: italic “Scrapped” wordmark ([D-011](../../../docs/decisions/D-011-scrapped-logo-italic.md)), story progress segments, info/close: same theme as the active story. Soundtrack stays secondary.
6. **Share finale**: **9:16** inset card + Share / Replay ([D-012](../../../docs/decisions/D-012-share-finale-inset.md)); locked 300×533 canvas scaled to the shell; metrics under lists; production art plain teal + TR moon + mixed-z ghosts ([D-033](../../../docs/decisions/D-033-share-finale-b2-plain-teal.md)). Stage behind / card in front; no edge bleed ([D-013](../../../docs/decisions/D-013-share-finale-deck-rhyme-explore.md)).

## Hard bans (AI-design tells)

Do **not** introduce:

- Full-bleed neon ribbon / purple-indigo glow stacks / Sound Town maps
- Soft blurred ambient orbs with no named subject
- Diagonal stripe hatch, CRT scanlines, glassmorphism cards
- Multi-layer drop shadows, pill chip rows, emoji decoration
- White / cream / mist paper fills on the API deck
- Claiming true skips from Web API affinity proxies
- **Unmotivated peripheral soup** (random arcs + dots): prefer authored motifs ([`hand-*.png`](../../../docs/mocks/art-refs/))

## Surfaces

| Surface | Look |
|---------|------|
| `/scrapped` (`wrapped-story`) | Orbit Cascade; D-007 |
| Scrapped Plus `/scrapped/plus` | May stay editorial Anysphere until intentionally unified |
| Scrapped Lab `/scrapped/lab` | Functional Anysphere; not a story carnival |
| Gate / loading | Same as intro; orchid corners + orchid concentric chrome |
| `/scrapped/art` | **Research**: iterate motifs/palettes; production tokens live in `src/lib/scrapped-card-palette.ts`. Promoting further changes still needs an explicit decision. |

## Implementation checklist

Before shipping UI changes:

- [ ] Slide uses a CARD_PALETTE swatch with matching ink mode (dark vs light theme)
- [ ] Deck chrome inherits the active slide tone (`data-wrapped-tone` on chrome host)
- [ ] Headline → subline → aside are reading-timed line beats; respect `prefers-reduced-motion`
- [ ] Art is static (or settled) under reduced-motion; mid band stays clear
- [ ] Wide viewport uses motif pins; phone `MotifStage` for non-exception patterns; intro + soft close pinned ([D-009](../../../docs/decisions/D-009-responsive-motif-pins.md))
- [ ] Empty states keep a short honest line
- [ ] No new AI-slop patterns from the ban list
- [ ] Copy matches the API conversational spine in WRAPPED.md

## When stuck

1. Read [docs/WRAPPED.md](../../../docs/WRAPPED.md) for beat/tone (and §10 for motion vs Wrapped).
2. Read [D-007](../../../docs/decisions/D-007-orbit-cascade-api-deck.md) for palette / contrast; [D-008](../../../docs/decisions/D-008-entity-artist-opaque-orbit-ovals.md) for the #1 artist orbit; [D-018](../../../docs/decisions/D-018-ghosted-ground-sky-s9.md) for ghosted pair chrome; [D-019](../../../docs/decisions/D-019-left-on-read-orchid-corners.md) for left-on-read 5→6.
3. Open [docs/mocks/](../../../docs/mocks/) and match structure before inventing.
4. For “make motion more Wrapped,” compare [docs/mocks/wrapped-ref/named/](../../../docs/mocks/wrapped-ref/named/) to live deck timing; tighten clocks / handoffs, don’t port ribbons.
5. For copy vs list motion bugs, read [SCARS.md](../../../SCARS.md) and [D-001](../../../docs/decisions/D-001-story-copy-vs-list-motion.md) before inventing a third path.
6. Prefer deleting decoration over adding a second treatment.
