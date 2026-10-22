# D-006: API story headline style

- **Date:** 2026-10-16
- **Status:** Locked

## Why

Mobile hero headlines were wrapping into dense walls (`40 of your all-time favorites got ghosted`). We need short, scannable display lines without hyphenated compounds that look stiff on a phone.

## Decision

Applies to **authored** `/scrapped` story copy in `ApiScrappedDeck.tsx` (not Spotify entity titles).

1. **Headlines ≤6 words**: split on whitespace; numbers count as one word. Extra detail goes in the subline / aside. Entity-name headlines from data (e.g. reunion song title) are uncapped.
2. **No hyphenated compounds** in authored lines: open them: `all time`, `multi year`, `one hit`, `one ghost`.
3. Prefer **favs** / **fav** over “favorites” / “favorite”.
4. Prefer **1 like** over “one-like” / “one like” as the product label for that metric.

Handwritten lock + voice / soft-empty / closer beat count: [D-005](D-005-handwritten-api-story-copy.md).

## Displaced

- Long explanatory headlines that restated the metric mechanics
- Hyphenated display compounds (`all-time`, `one-like`, `multi-year`, `one-ghost`)
- “favorites” / “favorite” in authored deck lines

## Cost

Opening a compound increases word count; re-check the 6-word cap after edits. Soft-empty headlines must follow the same style. Keep `sceneCopyPlans` and slide JSX in sync.

## Key files

- `src/components/scrapped/ApiScrappedDeck.tsx`
- [D-005](D-005-handwritten-api-story-copy.md)
