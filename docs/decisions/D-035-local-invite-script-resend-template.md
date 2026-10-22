# D-035: Local invite script + Resend template `seat-invite`

- **Date:** 2026-10-22
- **Status:** Locked
- **Supersedes (trigger only):** [D-032](D-032-seat-invite-ready-resend.md) admin UI / `ADMIN_SECRET` / `/api/admin/*`

## Why

Ops only needs 1–5 seat invites at a time. A discoverable `/admin/waitlist` plus shared `ADMIN_SECRET` in the browser was more surface than the job required. The invite HTML now lives in Resend as published template `seat-invite`; sending should stay on the operator machine with env secrets, not on a public route.

## Decision

1. **Trigger:** Local CLI [`scripts/invite.ts`](../../scripts/invite.ts) via `npm run invite -- <email>…` (1–5 addresses). Loads `.env.local` (`RESEND_API_KEY`, `RESEND_FROM`). Optional Neon stamp of `invite_email_sent_at` when the address is on the waitlist.
2. **Send:** Resend batch API with template id/alias **`seat-invite`** (one message per recipient). Design/copy for the mail body is owned in Resend. CTA remains production `/ready` (set in the template; same landing as D-032).
3. **Removed:** `/admin/waitlist`, `AdminWaitlistInvite`, `/api/admin/invite`, `/api/admin/waitlist`, `ADMIN_SECRET`, inline app HTML send.
4. **Unchanged from D-032:** No send on waitlist join; Spotify Dashboard allowlist stays manual; `/ready` off-waitlist Sign in + soft ~24h copy.

## Displaced

- Secret-gated web admin for invites
- Inline app HTML as the production send path

## Cost

Operators must run the script locally (or CI with secrets). Waitlist browsing is no longer in-app; use Neon or a DB client. Template edits happen in Resend; keep [`docs/mocks/invite-email-resend.html`](../mocks/invite-email-resend.html) in sync when redesigning.

## Key files

- `scripts/invite.ts`, `src/lib/invite/send.ts`
- `src/app/ready/page.tsx`, `ScrappedGate.tsx` (`offWaitlist`)
- `.env.example` (`RESEND_*` only for invites)
