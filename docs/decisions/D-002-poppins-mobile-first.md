# D-002: Poppins type system + mobile-first gate

- **Date:** 2026-10-16
- **Status:** Locked

## Why

Intro/login typography mixed Gentium (serif headings) and Fustat (sans body), and the gate was a centered stack. We needed one product face and a phone-first layout that matches the Figma left-aligned intro.

## Decision

1. **Poppins** is the sole UI typeface. `--font-sans`, `--font-heading`, and `--font-display` all resolve to Poppins (`@fontsource/poppins` Latin weights 400/500/600/700 + italics).
2. Shared type roles live in `src/app/globals.css`: `text-display`, `text-title`, `text-body`, `text-caption`. Prefer these over one-off clamp stacks on new UI.
3. **Mobile-first, responsive**: design for the phone first, then scale. Surfaces **fill the viewport** (full-bleed paper/canvas). Do not letterbox with dark gutters. Content stays left-aligned; do not center-stack as a marketing poster.
4. **Gate** (`ScrappedGate`) is a left-aligned stack on a full-bleed Orbit ink field: top-left `About` → top-right primary `Sign out` when signed in (unsigned: no top-right Sign in: [D-027](D-027-sign-in-under-waitlist.md)) → year → *Scrapped* → blurb → mid CTA (waitlist join when signed out; `Continue` when ready) → optional “Signed in to Spotify as {name}” → footer credit. Auth verbs: [D-004](D-004-sign-in-sign-out-copy.md). About page + gate disk kit D6: [D-022](D-022-about-page-gate-d6.md).

## Displaced

- Gentium Book Basic + Fustat Variable dual-font system
- Centered gate hero with personalized year title (`Your 2026` / `{Name}’s 2026`) as the primary identity line
- Serif `font-heading` personality on Lab/Plus
- Phone-width (`max-w-md`) gate column with dark side gutters on desktop

## Cost

Agents must not reintroduce a second display face “for contrast.” Identity under the CTA (logged-in caption) replaces year-line personalization on the gate. Mobile-first means composition order and density; not clipping the canvas to a phone frame on large screens.

## Key files

- `src/app/globals.css`
- `src/components/scrapped/ScrappedGate.tsx`
- `.cursor/skills/scrapped-art-direction/SKILL.md`
