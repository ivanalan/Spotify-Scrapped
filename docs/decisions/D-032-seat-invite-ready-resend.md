# D-032: Seat invite email (Resend) + `/ready`

- **Date:** 2026-10-22
- **Status:** Locked (landing + product copy). **Trigger superseded by [D-035](D-035-local-invite-script-resend-template.md).**

## Why

Spotify Dev Mode caps live OAuth seats (~5). Waitlist join already stores emails in Neon and About promises an invite email, but nothing could send one. Seat add/remove on the Spotify Dashboard stays manual. We need a **human-triggered** HTML invite that lands people on a clear Sign in page, without auto-mailing on waitlist join and without personalized live-seat tokens.

## Decision

1. **Send stack:** Resend. Original path used inline app HTML (removed; design now in Resend template `seat-invite` + [`docs/mocks/invite-email-resend.html`](../mocks/invite-email-resend.html)). CTA → production `/ready`.
2. **Trigger (historical):** Ops `/admin/waitlist` + `ADMIN_SECRET`. **Now:** local `npm run invite` ([D-035](D-035-local-invite-script-resend-template.md)). No cron; no send on `/api/waitlist` join.
3. **Landing:** [`/ready`](../../src/app/ready/page.tsx) is a gate variant (`offWaitlist`): off-waitlist copy, soft **~24h** window note, primary **Sign in** → `/api/spotify/login`. Not linked from main UI (same idea as `/example`). `robots: noindex`.
4. **Stamp:** `waitlist_signups.invite_email_sent_at` (best-effort from the invite script when the email is on the waitlist).
5. **Out of scope here:** Automating Spotify allowlist CRUD. Frozen personal snapshot replay (`/s/[token]`) after seat revoke is locked in [D-041](D-041-personal-story-snapshot-token.md).

## Displaced

- Pasting HTML into a personal mail client as the primary path
- Unattended invite send on waitlist join
- Per-user magic links that grant live API access (seat proof remains the Spotify Dashboard allowlist)

## Cost

Soft 24h copy is messaging only until you remove the user from the Dashboard. See D-035 for current ops cost.

## Key files

- `src/app/ready/page.tsx`, `ScrappedGate.tsx` (`offWaitlist`)
- Invite send: [D-035](D-035-local-invite-script-resend-template.md)
