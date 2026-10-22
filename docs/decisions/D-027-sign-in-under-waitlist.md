# D-027: Sign in under waitlist (no top-right primary)

- **Date:** 2026-10-22
- **Status:** Locked

## Why

Auth gate mid band is waitlist-first. A solid top-right **Sign in** competed with **Join waitlist** and duplicated the path already offered under the form helper (“Already have access? Sign in”). One Sign in affordance is enough.

## Decision

1. Unsigned auth gate: top chrome is **About** only (left). No top-right **Sign in**.
2. Sign in lives under the waitlist form as a secondary text link: “Already have access? **Sign in**” → `/api/spotify/login` ([D-004](D-004-sign-in-sign-out-copy.md) verbs; `aria-label="Sign in to Spotify"`).
3. Signed-in modes keep top-right **Sign out** as primary fill (light `--wrapped-ink` on the ink field). Waitlist Join / Continue share that primary tone ([D-023](D-023-gate-button-triad.md)).
4. Seats-full (`not_allowlisted`) uses the same chrome; About only; retry via the waitlist helper link ([D-025](D-025-not-allowlisted-seats-full-gate.md)).

## Displaced

- Top-right primary solid **Sign in** on unsigned / seats-full gates ([D-004](D-004-sign-in-sign-out-copy.md), [D-022](D-022-about-page-gate-d6.md))
- `gatePrimaryChromeClass` (anchor-shaped primary chrome for that control)

## Cost

Visitors who only scan the top corners may miss Sign in until they read the form helper. Acceptable: waitlist is the intended primary path; Sign in is the alternate.

## Key files

- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/GateWaitlistForm.tsx`
- `src/components/scrapped/gateChrome.ts`
