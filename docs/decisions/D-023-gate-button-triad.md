# D-023: Gate button triad (primary / secondary / tertiary)

- **Date:** 2026-10-21
- **Status:** Locked
- **See also:** [D-039](D-039-gate-tertiary-vs-link.md) (tertiary vs link split)

## Why

Gate chrome settled on a clear primary/secondary pair (solid mid CTAs · outline glass About), but About’s Back used shadcn `ghost` with an ink wash hover; a gray pill that felt like a fourth, heavier control. Tertiary needs a no-background affordance that still reads as chrome.

## Decision

1. **Primary**: Solid ink fill (`--wrapped-ink` light on ink field = white-ish), canvas text; hover **color-mix ~22% toward canvas** (noticeably darker, not opacity fade). Gate **Join waitlist** / **Continue** / signed-in **Sign out** (not top-right Sign in: [D-027](D-027-sign-in-under-waitlist.md)).
2. **Secondary**: Outline + light glass (`ink/16` + `backdrop-blur-md`; blur path `ink/14`); hover strengthens border / wash (`ink/24`). Gate **About** ([D-022](D-022-about-page-gate-d6.md)); About **← Back** (same glass as gate About).
3. **Tertiary**: No fill, no underline; hover soft `ink/6` wash. Reserved chrome (no current surface). Text links are **body link** or **caption link**, not tertiary: [D-039](D-039-gate-tertiary-vs-link.md), [D-024](D-024-example-walkthrough-snapshot.md).
4. Hover ease: shared `transition-[background-color,border-color,color,opacity,text-decoration-color]` · `duration-300` · `--ease-out` (`gateChromeTransition`).
5. Still **shadcn** `Button` / `buttonVariants` + product tone via `className` ([D-003](D-003-shadcn-standard-controls.md)). Shared tones live in `gateChrome.ts`.

## Displaced

- Tertiary ghost with `hover:bg-ink/10` as a heavy gray pill (pre-D-023)
- Brighten / opacity-only / translate tertiary hover experiments (pre-link split)
- Tertiary hover that toggles `underline` on/off (cannot interpolate)
- Primary hover via `opacity-90` (too subtle; muddies text)
- Outline-glass **Sign out** matching About (Sign out is primary fill when signed in)
- One underline tertiary for both Back and Sign in / Privacy (see [D-039](D-039-gate-tertiary-vs-link.md))

## Cost

Underline reads more “nav link” than “button” for link chrome; acceptable for inline Sign in / Privacy. Icon-only deck close stays its own solid circle (not this triad).

## Key files

- `src/components/scrapped/gateChrome.ts`
- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/SignOutConfirmButton.tsx` (gate text appearance → primary)
- `src/components/scrapped/ScrappedAboutPage.tsx`
- `src/components/scrapped/GateWaitlistForm.tsx` (helper Privacy → link; [D-039](D-039-gate-tertiary-vs-link.md))
