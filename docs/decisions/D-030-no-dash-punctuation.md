# D-030: No dash punctuation in writing

- **Date:** 2026-10-22
- **Status:** Locked

## Why

Em dashes (`—`), en dashes used as clause breaks (`–`), double hyphens (`--`), and spaced hyphens (` - `) as rhetorical punctuation read as default AI prose. Scrapped copy should sound human: full sentences, commas, semicolons, or colons.

## Decision

1. **Product copy, Lab means/calculated, About/gate UI, story headlines/sublines, and agent docs** never use dash punctuation to join clauses. Prefer a period and a new sentence, a semicolon, or a colon.
2. **Allowed hyphens:** compound modifiers and IDs (`4-week`, `left-on-read`, `sign-in`, `D-030`), CSS custom properties (`--wrapped-ink`), numeric ranges written with a plain hyphen (`0-100`), markdown list markers, and Spotify metadata that already contains ` - ` in a title.
3. **Empty placeholder glyph:** a lone `—` (or similar) for missing artist/detail is OK; it is not clause punctuation.
4. Decision titles use a colon: `# D-030: Title` (not an em dash).

## Displaced

- Em dash clause breaks in UI strings, Lab blurbs, About, gate helpers, and memory docs
- `# D-NNN: Title` heading form

## Cost

Older comments and mocks may still contain dashes until touched. New writing follows this lock. Handwritten story lines that used a dash for voice (`Wow; …`) are rewritten without losing dryness ([D-005](D-005-handwritten-api-story-copy.md)).

## Key files

- `SOUL.md`, `AGENTS.md`, `.cursor/rules/agent-memory.mdc`
- `src/components/scrapped/ScrappedAboutPage.tsx`
- `src/components/scrapped/ApiScrappedDeck.tsx`
- `src/lib/scrapped-api.ts`
