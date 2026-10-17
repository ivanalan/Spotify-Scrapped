# D-004 — Sign in / sign out copy

- **Date:** 2026-10-16
- **Status:** Locked

## Why

Auth CTAs mixed **Log in**, **Log out**, **Connect Spotify**, **Disconnect**, and **Sign out** in the same product. Gate and confirm dialog already used “Sign out”; the trigger still said “Log out.” Agents need one pair of verbs.

## Decision

1. User-facing auth copy uses **sign in** and **sign out** only (sentence case as UI labels: `Sign in to Spotify`, `Sign out`, `Signed in to Spotify as {name}`).
2. Do not use **log in / log out**, **connect / disconnect**, or mixed pairs for the same actions.
3. API route paths (`/api/spotify/login`, `/api/spotify/logout`) may keep technical names — they are not product copy.

## Displaced

- `Log in to Spotify` / `Log out`
- `Connect Spotify` / `Disconnect` as primary auth labels
- `Logged in to Spotify as…`

## Cost

Docs and mocks that still say “Connect Spotify” should be updated when touched. Prefer linking here over restating the glossary.

## Key files

- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/SignOutConfirmButton.tsx`
- `src/components/AuthControls.tsx`
