# D-039: Gate tertiary vs link (body + caption)

- **Date:** 2026-10-23
- **Status:** Locked
- **Extends:** [D-023](D-023-gate-button-triad.md)

## Why

D-023 used one tertiary chrome (always-on underline, decoration fade) for both About **← Back** and inline **Sign in** / **Privacy**. Caption links need a permanent underline and a brighter ink hover; Back is chrome, not a text link. Sharing one tone muddied the difference.

Body CTAs (About **View an example**, About **Sign in**) need ink at body size; caption helpers need smaller muted type that lifts on hover. One link tone could not do both. About **← Back** settled on secondary glass (same as gate About), not tertiary ghost.

## Decision

1. **Tertiary**: No fill, no underline. Hover translucent wash is soft `ink/6`. shadcn `ghost` + `gateTertiaryTone` / `gateTertiaryChromeClass`. Reserved; no current surface ([D-023](D-023-gate-button-triad.md)).
2. **Body link**: Underline always on. Ink rest + decoration (`--wrapped-ink`); `text-body`. shadcn `link` + `gateLinkTone` / `gateLinkChromeClass`. Height/padding zeroed (`h-auto px-0`) so type aligns with body. Use for About **View an example**, About “Already have access? **Sign in**”, and gate body inline helpers (e.g. **View example** in the default subtitle). Add `inline` in flow.
3. **Caption link**: Underline always on. Muted rest; hover lifts text + decoration to body ink. `text-caption`. shadcn `link` + `gateCaptionLinkTone` / `gateCaptionLinkChromeClass`. Same height/padding zeroing. Use for gate footer **Sign in**, seats-full / ready caption pairs. Inline caption adds `inline`. Waitlist helper **Privacy** keeps caption tone + `text-xs` but drops underline (`no-underline hover:no-underline`) so it reads as quiet helper copy, not a second caption CTA.
4. About **← Back** uses **secondary** chrome (`gateSecondaryChromeClass`), not tertiary or link ([D-023](D-023-gate-button-triad.md)). Primary / field / shared `gateChromeTransition` unchanged.

## Displaced

- Single tertiary that was underline-always + decoration fade for Back and Sign in / Privacy
- Tertiary ghost with gray muted wash (`hover:bg-ink/10` as the only story) without naming link separately
- Tertiary ghost for About **← Back** (now secondary glass)
- One muted link tone for both body CTAs and caption helpers
- One-off `gateAltLinkClass` ink underlines on the seats-full caption pair

## Cost

Link has two type scales. Agents must pick body link vs caption link deliberately; About Back is secondary, not a link.

## Key files

- `src/components/scrapped/gateChrome.ts`
- `src/components/scrapped/ScrappedAboutPage.tsx`
- `src/components/scrapped/ScrappedGate.tsx`
- `src/components/scrapped/GateWaitlistForm.tsx`
