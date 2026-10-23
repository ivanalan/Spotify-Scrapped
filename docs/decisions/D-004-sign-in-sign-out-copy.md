# D-004: Sign in / sign out copy

- **Date:** 2026-10-16
- **Status:** Locked

## Why

Auth CTAs mixed **Log in**, **Log out**, **Connect Spotify**, **Disconnect**, and **Sign out** in the same product. Gate and confirm dialog already used “Sign out”; the trigger still said “Log out.” Agents need one pair of verbs.

## Decision

1. User-facing auth copy uses **sign in** and **sign out** only (sentence case as UI labels: `Sign in`, `Sign out`, `Signed in to Spotify as {name}`).
2. Gate placement: unsigned **Sign in** is the gate footer link (“Already have access? Sign in”); not top-right chrome ([D-027](D-027-sign-in-under-waitlist.md)). Prefer `aria-label="Sign in to Spotify"` when the Spotify noun is not in the visible label. Top-right **Sign out** (when signed in) is primary fill; About (top-left) stays outline secondary; [D-022](D-022-about-page-gate-d6.md), [D-023](D-023-gate-button-triad.md).
3. Do not use **log in / log out**, **connect / disconnect**, or mixed pairs for the same actions.
4. API route paths (`/api/spotify/login`, `/api/spotify/logout`) may keep technical names; they are not product copy.

## Displaced

- `Log in to Spotify` / `Log out`
- `Connect Spotify` / `Disconnect` as primary auth labels
- `Logged in to Spotify as…`
- Mid-gate primary CTA `Sign in to Spotify` (replaced by waitlist; Sign in under the form helper; [D-027](D-027-sign-in-under-waitlist.md))
- Top-right primary solid **Sign in** (see [D-027](D-027-sign-in-under-waitlist.md))

## Cost

Docs and mocks that still say “Connect Spotify” should be updated when touched. Prefer linking here over restating the glossary. Longer `Sign in to Spotify` button labels elsewhere should migrate to the short **Sign in** label when those surfaces are touched.

## Key files

- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/GateWaitlistForm.tsx`
- `src/components/scrapped/SignOutConfirmButton.tsx`
- `src/components/AuthControls.tsx`
