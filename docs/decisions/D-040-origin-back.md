# D-040: Origin back (return to prior in-app screen)

- **Date:** 2026-10-23
- **Status:** Locked

## Why

About and the example walkthrough used hardcoded Back targets (`/` and `/about`). Visitors who opened those screens from elsewhere (gate **View example**, `/ready` **Why a waitlist?**, seats-full caption links) were dumped onto the wrong surface. Back should mean “where I was,” not a fixed parent route.

## Decision

1. **Chrome labeled Back** (About `← Back`, walkthrough toolbar back) returns to the **prior in-tab App Router path** via `history.back()` when this tab already visited another Scrapped path.
2. **Cold entry** (direct open / new tab with no prior path in the session stack) uses a **fallback**: `/` for About and the example walkthrough, via `router.replace` (not `push`) so browser Back doesn't return to the screen the user just left.
3. **Not Back:** intentional destination controls stay fixed (`Go home` on 404, logo → `/`, Sign in, forward CTAs). Those are not origin-back chrome.
4. **Implementation:** `trackOriginBackPath` in `ProductMain` (pathname commits); `OriginBackButton` + `originBack()` in `src/lib/origin-back.ts`. No `backHref` prop on the walkthrough deck.

## Displaced

- About Back always → `/` ([D-022](D-022-about-page-gate-d6.md) prior wording)
- Example walkthrough Back always → `/about` ([D-024](D-024-example-walkthrough-snapshot.md) prior wording)
- `backHref` wiring on `ScrappedExperience` / `ApiScrappedDeck`

## Cost

Session stack is tab-local (`sessionStorage`). Browser Back and our Back share history; the stack pops when the prior path reappears. Deep-linking into `/about` or `/example` still lands on `/` when leaving. Seats-full → About → Back now restores seats-full (query intact), which supersedes the D-025 note that Back always cleared `spotify_error`.

## Violations found (fixed)

| Surface | Was | Now |
|--------|-----|-----|
| `/about` ← Back | `Link` → `/` | Origin back; cold → `/` |
| `/example` toolbar back | `backHref="/about"` | Origin back; cold → `/` |

## Key files

- `src/lib/origin-back.ts`
- `src/components/scrapped/OriginBackButton.tsx`
- `src/components/ProductChrome.tsx`
- `src/components/scrapped/ScrappedAboutPage.tsx`
- `src/components/scrapped/ApiScrappedDeck.tsx`
- `src/app/example/page.tsx`
