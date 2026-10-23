# D-036: About Privacy section + gate waitlist consent

- **Date:** 2026-10-22
- **Status:** Locked
- **Extends:** [D-022](D-022-about-page-gate-d6.md)

## Why

The gate collects waitlist emails and the app seals session + story cookies, but About only answered “password” and overclaimed that listening data “stays yours.” A separate `/privacy` route would add chrome for a beta; About already owns trust FAQ and hash deep-links (`#why-waitlist`).

## Decision

1. **Placement:** Privacy lives on `/about#privacy` (Layout A section). No dedicated `/privacy` route until a platform or counsel asks for a standalone URL.
2. **About copy:** Privacy section on `/about#privacy`: OAuth (no password), ~30d encrypted session cookie, ~30d sealed story snapshot cookies (cleared on sign out), durable private story link on Neon after Load ([D-041](D-041-personal-story-snapshot-token.md); ~1y TTL; capability URL), waitlist email storage and seat-only email use, how to leave the waitlist, no sale of data. Soften the trademark blurb (drop “listening data stays yours”).
3. **Gate waitlist:** Default helper is one caption line: “Join with your Spotify email. Seat emails only.” + link **Privacy** → `/about#privacy` (same link chrome as Sign in; [D-039](D-039-gate-tertiary-vs-link.md)). Error / success helpers replace that line. **Already have access? Sign in** lives in the gate footer ([D-027](D-027-sign-in-under-waitlist.md)).

## Displaced

- Standalone `/privacy` page for the beta
- Privacy only in footer legalese with no gate path

## Cost

About grows one more section. Waitlist removal still depends on replying to / writing the invite From address (no in-app delete yet). Legal copy remains product-facing, not counsel-reviewed.

## Key files

- `src/components/scrapped/ScrappedAboutPage.tsx`
- `src/components/scrapped/GateWaitlistForm.tsx`
