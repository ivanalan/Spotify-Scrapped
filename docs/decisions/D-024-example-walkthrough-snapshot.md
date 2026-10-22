# D-024: Example walkthrough (frozen Guest snapshot)

- **Date:** 2026-10-21
- **Status:** Locked

## Why

About needed a real “View an example” path for waitlisted visitors. Hitting Spotify Web API per visitor (or sharing one refresh token) would burn **app-wide** quota and couple demo traffic to real Loads. The deck already consumes a `ScrappedApiReport`; playback uses public Embed iframes, not OAuth.

## Decision

1. **Data**: Commit a redacted `ScrappedApiReport` at [`src/data/walkthrough-report.json`](../../src/data/walkthrough-report.json). `profileName` is **Guest**; no `userId` / `likedUris`. Music entity labels + `trackId`s stay (needed for copy + embeds). One-save rows use current shape (`label`=song, `sublabel`=artist); `/example` also runs `ensureApiReportSummary` so older sealed shapes still migrate. Refresh by re-exporting a Load snapshot and re-redacting.
2. **Route**: `/example` mounts [`ScrappedExperience`](../../src/components/scrapped/ScrappedExperience.tsx) with `chromeMode="walkthrough"`. No OAuth, no artist-top-track resolve. Full-bleed via `ProductChrome` like `/` and `/about`. **No ready gate**: open on slide 0; sound starts when the visitor taps volume (autoplay policy).
3. **Chrome**: Toolbar: back (left) → `/about`; pause + volume on the right; **no** sign-out X.
4. **Ingress**: About “What is this?” section → in-app `Link` to `/example` (replaces `NEXT_PUBLIC_SCRAPPED_WALKTHROUGH_URL` stub).

## Displaced

- Live demo account / per-visit Web API fetch for the example
- External env URL as the About CTA
- Soft “exit deck” X that still signs out
- Fake “Continue / Signed in as Guest” gate before the example stories

## Cost

Sample tastes go stale until the fixture is re-exported. Public repo exposes which songs/artists appear in the sample (not the author’s display name). Embed playback still follows Spotify’s listener rules (account / Premium).

## Key files

- `src/data/walkthrough-report.json`
- `src/app/example/page.tsx`
- `src/components/scrapped/ApiScrappedDeck.tsx` (`chromeMode`)
- `src/components/scrapped/ScrappedAboutPage.tsx`
- `src/components/ProductChrome.tsx`
