# D-050: Striped tent deck colors (parked)

**Status:** Parked (not production)  
**Date:** 2026-10-27  
**Surfaces:** Explore only. Live deck remains D-045 / D-046 / D-047 / D-049.

## Decision

**Do not wire** the striped tent circus-primary kit into production for now. Keep it as a revisit option.

Explore board: [`docs/mocks/story-color-presets.html`](../mocks/story-color-presets.html) (Striped tent layouts + tokens).

| Role | Parked choice |
|------|--------|
| Volume (1) | Sunflower sky `#FFE08A → #FFB020 → #F07800` + blue water `#9ED0FF → #003A8C` |
| Plot twist (7) | Same sky as volume (no water) |
| Ghosted (2↔3) | Dark `#0C0C14` |
| One-like (4) | Flat cobalt `#2F6FDB` + scarlet / sky hearts |
| Left on read (5↔6) | Shared scarlet `#E10600` + scarlet-deep wash; water bloom on pin/bubbles |
| Soft close (8) | Scarlet-deep `#A10000` + heart iris (geometry still D-047) |
| Intro / share | Ghosted ink + cobalt wash; cobalt share card 0 |

Hard locks in the explore: volume sky+water, setlist reuses sky, ghosted stays dark, left-on-read pair shares scarlet.

## Why parked

Tried as a consistency pass over the rose / ocean / ember middeck. Rolled back so production keeps the locked ocean nest + rose left-on-read + ember volume spine. The carnival alternate is worth keeping for a later color pass without re-deriving the kit.

## Production remains

- Volume / plot sky: [D-046](D-046-plot-twist-ember-field.md)
- One-like ocean + hearts: [D-045](D-045-one-like-ocean-circle-heart.md)
- Soft close ocean + iris: [D-047](D-047-soft-close-heart-iris.md)
- Left on read rose + ocean bloom: [D-049](D-049-left-on-read-rose-ocean.md)

## How to revisit

1. Open `docs/mocks/story-color-presets.html` and confirm Striped tent (or a child iteration).
2. Promote tokens into `STRIPED_TENT` + `SLIDE_SWATCH` in `scrapped-card-palette.ts`.
3. Flip this doc to Locked and update AGENTS / agent-memory in the same change.

## Cost of parking

- Explore HTML + this decision stay in-repo; production palette has a pointer comment only.
- Do not treat mock colors as live until explicitly promoted.
