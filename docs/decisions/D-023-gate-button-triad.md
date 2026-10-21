# D-023 — Gate button triad (primary / secondary / tertiary)

- **Date:** 2026-10-21
- **Status:** Locked

## Why

Gate chrome settled on a clear primary/secondary pair (solid Sign in · outline glass About / Sign out), but About’s Back used shadcn `ghost` with an ink wash hover — a gray pill that felt like a fourth, heavier control. Tertiary needs a no-background affordance that still reads as chrome.

## Decision

1. **Primary** — Solid ink fill, canvas text; hover **color-mix ~22% toward canvas** (noticeably darker, not opacity fade). Gate **Sign in** ([D-004](D-004-sign-in-sign-out-copy.md)).
2. **Secondary** — Outline + light glass (`ink/10` + `backdrop-blur-md`); hover strengthens border / wash. Gate **About** and **Sign out** share one tone ([D-022](D-022-about-page-gate-d6.md)).
3. **Tertiary** — No fill. Underline is **always on**; rest uses transparent decoration, hover fades decoration to ink (shadcn `link` + `gateTertiaryTone` — no muted wash). About **← Back**.
4. Hover ease: shared `transition-[background-color,border-color,color,opacity,text-decoration-color]` · `duration-300` · `--ease-out` (`gateChromeTransition`).
5. Still **shadcn** `Button` / `buttonVariants` + product tone via `className` ([D-003](D-003-shadcn-standard-controls.md)). Shared tones live in `gateChrome.ts`.

## Displaced

- Tertiary ghost with `hover:bg-ink/10` (gray pill)
- Brighten / opacity-only / translate tertiary hover experiments
- Tertiary hover that toggles `underline` on/off (cannot interpolate)
- Primary hover via `opacity-90` (too subtle; muddies text)
- Divergent About vs Sign out secondary skins

## Cost

Underline reads more “nav link” than “button” — acceptable for Back on an editorial page. Icon-only deck close stays its own solid circle (not this triad).

## Key files

- `src/components/scrapped/gateChrome.ts`
- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/SignOutConfirmButton.tsx`
- `src/components/scrapped/ScrappedAboutPage.tsx`
