# D-025: Not-allowlisted seats-full gate

- **Date:** 2026-10-21
- **Status:** Locked

## Why

Dev Mode rejects Spotify accounts that aren’t on the Dashboard allowlist after OAuth authorize. Surfacing that as a muted caption above the normal auth gate under-explained the system and re-invited the bounce-loop scar ([SCARS.md](../../SCARS.md); non-allowlisted sign-in).

## Decision

1. On `?spotify_error=not_allowlisted` (and legacy allowlist-shaped payloads), the auth gate uses a **state-first** mid band: year + italic *Scrapped* → one body paragraph → waitlist form → **View an example · Why a waitlist?** (centered; extra gap under the form helper).
2. Body copy (locked): “Seats are full for now. We can only register a small set of users with Spotify while Scrapped is in beta. Your sign in wasn’t kept.”
3. Top chrome matches unsigned auth: **About** only. No **Sign out**: no session was sealed (token path never attaches `spotify_session`). Retry is the waitlist helper **Sign in** link ([D-027](D-027-sign-in-under-waitlist.md)); copy clarifies the attempt didn’t stick so that link is retry, not “still connected.”
4. Drop the marketing blurb and divider rule on this state only; other auth errors keep caption + waitlist (+ helper Sign in).
5. Links: `/example` (D-024); `/about#why-waitlist` for the About section.

## Displaced

- Caption-only `authError` under the normal gate blurb for allowlist failures
- Hiding **Sign in** entirely after `not_allowlisted` (they’re unsigned; retry via helper link is valid; [D-027](D-027-sign-in-under-waitlist.md))
- Top-right primary **Sign in** on seats-full (same as unsigned; [D-027](D-027-sign-in-under-waitlist.md))
- **Sign out** on seats-full (implied a Scrapped session that does not exist)
- Hairline rule between copy and waitlist
- Eyebrow / multi-paragraph status copy from the HTML explore

## Cost

Auth gate branches on error code. Visitors who land with a stale non-code query string only get the seats-full UI when the payload still looks like an allowlist failure. Leaving About (`← Back` → `/`) drops the query param, so they return to the normal auth gate.

## Key files

- `src/components/scrapped/ScrappedGate.tsx`
- `src/app/page.tsx` (`seatsFull` from `isNotAllowlistedAuthError`)
- `src/lib/spotify/oauth.ts` (`isNotAllowlistedAuthError`)
- `src/components/scrapped/ScrappedAboutPage.tsx` (`#why-waitlist`)
- Explore: `docs/mocks/not-allowlisted-gate.html`
