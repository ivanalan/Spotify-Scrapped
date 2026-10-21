# D-004 — Sign in / sign out copy

- **Date:** 2026-10-16
- **Status:** Locked

## Why

Auth CTAs mixed **Log in**, **Log out**, **Connect Spotify**, **Disconnect**, and **Sign out** in the same product. Gate and confirm dialog already used “Sign out”; the trigger still said “Log out.” Agents need one pair of verbs.

## Decision

1. User-facing auth copy uses **sign in** and **sign out** only (sentence case as UI labels: `Sign in`, `Sign out`, `Signed in to Spotify as {name}`).
2. Gate auth chrome (top-right) uses the short labels **Sign in** / **Sign out**. **Sign in** is primary solid (light fill on the ink field); **Sign out** stays outline secondary. Prefer `aria-label="Sign in to Spotify"` on the Sign in control when the Spotify noun is not visible in the button text. About (top-left) uses the same outline secondary as Sign out — [D-022](D-022-about-page-gate-d6.md).
3. Do not use **log in / log out**, **connect / disconnect**, or mixed pairs for the same actions.
4. API route paths (`/api/spotify/login`, `/api/spotify/logout`) may keep technical names — they are not product copy.

## Displaced

- `Log in to Spotify` / `Log out`
- `Connect Spotify` / `Disconnect` as primary auth labels
- `Logged in to Spotify as…`
- Mid-gate primary CTA `Sign in to Spotify` (replaced by waitlist + top-right **Sign in**)

## Cost

Docs and mocks that still say “Connect Spotify” should be updated when touched. Prefer linking here over restating the glossary. Longer `Sign in to Spotify` button labels elsewhere should migrate to chrome **Sign in** when those surfaces are touched.

## Key files

- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/GateWaitlistForm.tsx`
- `src/components/scrapped/SignOutConfirmButton.tsx`
- `src/components/AuthControls.tsx`
