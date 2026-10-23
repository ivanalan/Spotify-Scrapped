# D-041: Personal story snapshot (`/s/[token]`) after seat revoke

- **Date:** 2026-10-23
- **Status:** Locked
- **Closes future phase from:** [D-032](D-032-seat-invite-ready-resend.md)

## Why

Spotify Dev Mode seats are scarce. After Dashboard allowlist removal, OAuth cannot renew, and cookie/FS lab snapshots are not a durable keepsake. Visitors still need a way to reopen **their** interactive API story without burning a live seat.

## Decision

1. **Persist on ready:** Upsert a **deck-slim** `ScrappedApiReport` into Neon `story_snapshots` (token, `spotify_user_id`, year, jsonb report, ~1y `expires_at`) after a successful lab Load **and** when `/` serves a cookie/FS-ready deck (so Continue without re-Load still mints a link). Soft-fail if `DATABASE_URL` is missing.
2. **Slim shape:** Shared helpers in [`src/lib/scrapped-api-slim.ts`](../../src/lib/scrapped-api-slim.ts). Deck persist keeps soundtrack/list cards only (not full Lab prose / `likedUris`). Cookie slim still keeps all cards with Lab prose stripped.
3. **Replay route:** [`/s/[token]`](../../src/app/s/[token]/page.tsx) loads by unguessable token; mounts `ScrappedExperience` with `chromeMode="walkthrough"` (no OAuth, no Sign out). `robots: noindex`. Capability URL = access.
4. **Surface:** Delivery is the one-shot email + capability URL at `/s/[token]`. No in-deck **Copy story link** control on the share finale (Share / Replay only).
5. **One-shot email:** After a ready upsert, if the Spotify account email is known and `story_link_emailed_at` is null, send Resend template `story-link` with `STORY_URL`, then stamp. Never re-sends for that user+year. Soft-fail without `RESEND_*` or template. Link origin is `STORY_PUBLIC_URL` or else `AUTH_URL` (so local OAuth loopback does not leak into mailed URLs).
6. **Out of scope here:** Video capture; Plus multi-user hosting; magic links that grant live Web API seats; in-deck copy of the story URL.

## Displaced

- Relying on sealed cookies alone after seat revoke
- Embedding the full report in the URL as the primary share path

## Cost

Neon stores taste metadata (titles, artists, cover URLs) keyed by Spotify user id. Secret links can be forwarded; disclose in About Privacy. Cover CDN URLs may stale over the TTL.

## Key files

- `src/lib/story-snapshot/db.ts`, `src/lib/scrapped-api-slim.ts`
- `src/lib/load-scrapped-api-lab.ts` (upsert after Load), `src/app/page.tsx` (upsert + maybe email on ready)
- `src/lib/story-snapshot/email.ts`, mock [`docs/mocks/story-link-email-resend.html`](../mocks/story-link-email-resend.html)
- `src/app/s/[token]/page.tsx`
- About Privacy ([D-036](D-036-about-privacy-waitlist-consent.md) copy extended)
