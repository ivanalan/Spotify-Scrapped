# D-022: About page (Layout A) + gate disk kit D6

- **Date:** 2026-10-21
- **Status:** Locked

## Why

The waitlist gate needed a place for “what is this,” waitlist rationale, and a clear non-affiliation line, without crowding the mid CTA. Adding top-left **About** put chrome on the hot intro oval ladder, so `About` and `2026 Scrapped` became hard to read.

## Decision

1. **Entry**: Top-left outline secondary `About` with slight glass fill (`ink/10` + `backdrop-blur-md`; not plain text / chip / `?`). Unsigned: no top-right auth control: **Sign in** is under the waitlist helper ([D-027](D-027-sign-in-under-waitlist.md)). Signed in: top-right `Sign out` is primary fill ([D-023](D-023-gate-button-triad.md), [D-004](D-004-sign-in-sign-out-copy.md)). Mid CTA stays waitlist / Continue ([D-002](D-002-poppins-mobile-first.md)).
2. **Route**: `/about` · Layout A long-scroll editorial: What is this (+ in-app example → `/example`, [D-024](D-024-example-walkthrough-snapshot.md)) → Why a waitlist (includes “Already have access? **Sign in**” → `/api/spotify/login`, same helper as the gate: [D-027](D-027-sign-in-under-waitlist.md), [D-004](D-004-sign-in-sign-out-copy.md)) → Not Spotify → Privacy (`#privacy`, [D-036](D-036-about-privacy-waitlist-consent.md)) → Is this all of 2026? (Web API affinity windows + Liked; ghosted/left-on-read as set diffs, not skips). Back → `/`. Full-bleed like `/` (no product nav / `max-w-3xl` shell) via `ProductChrome`. About-only readability: art layer `blur-2xl` + full frost (`canvas/45` + `backdrop-blur-md`): gate stays sharp.
3. **Gate intro disks (kit D6)**: Gate-only (`introKit="gate-d6"`). Story intro + share keep the default ladder.
   - Opacity `0.7` · `mix-blend-screen`
   - Nudge `translate(-4%, 14%)` (exploration: top `-4%` / left `-46%` vs baseline)
   - Default ring ladder (not soft-rings)
   - Top chrome scrim ~`22%` height @ opacity `0.75` between art and type

## Displaced

- About as plain text / chip / `?` icon / accordion / topic-index hub
- Top-right outline-only / primary solid `Sign in` (removed; Sign in under waitlist; [D-027](D-027-sign-in-under-waitlist.md))
- Applying D6 dim/scrim to deck intro slide 0 or share-finale stage disks

## Cost

Gate and story intro can diverge visually on the oval ladder; intentional. Example walkthrough is an in-app frozen snapshot ([D-024](D-024-example-walkthrough-snapshot.md)). Legal copy is product-facing, not counsel-reviewed.

## Key files

- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/ScrappedAboutPage.tsx`
- `src/app/about/page.tsx`
- `src/components/scrapped/orbit/ScrappedOrbitArt.tsx` (`introKit`)
