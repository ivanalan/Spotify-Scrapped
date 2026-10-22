# D-011: Scrapped logo is always italic

**Status:** Locked  
**Date:** 2026-10-19  
**Surfaces:** Product chrome wordmark (API deck toolbar, Plus/Lab nav), gate / intro display title, and any other place “Scrapped” is shown as the brand logo; not body copy.

## Decision

**Scrapped** is the product logo / wordmark. Whenever it appears as a logo (standalone brand mark in chrome, nav, gate hero title, share brand lockup where “Scrapped” is the mark), it is **always italic**.

Body sentences that mention the product name (“Scrapped is your anti-wrapped…”) stay roman unless italics are used for separate emphasis.

## Why

The deck toolbar wordmark was roman while the gate hero already used italic “Scrapped.” One logo treatment keeps the brand recognizable and matches the conversational, slightly off-axis register of the anti-Wrapped story.

## Locked choices

| Axis | Choice |
|------|--------|
| Logo / wordmark | Always `italic` (Poppins) |
| Deck chrome | Toolbar “Scrapped” left of controls; italic |
| Nav home link | Plus/Lab header wordmark; italic |
| Gate / intro display | `text-display` + italic (already) |
| Body copy | Roman product name in running text |

## Displaced

Roman “Scrapped” in product chrome / logo slots.

## Cost

Agents must not “normalize” the wordmark to roman for chrome consistency with controls. Italic is the brand, not decoration.

## Source of truth

- Deck chrome: `src/components/scrapped/ApiScrappedDeck.tsx` (toolbar wordmark)
- Plus/Lab nav: `src/components/Nav.tsx`
- Gate hero: `src/components/scrapped/ScrappedGate.tsx`
