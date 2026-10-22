# D-026: Button tap target 40px

- **Date:** 2026-10-22
- **Status:** Locked

## Why

Gate chrome (`About` / primary `Sign out` at shadcn `lg` = 36px) sat next to waitlist / Continue CTAs forced to `h-12` (48px). Deck icon chrome used `size-8` (32px). Tap targets were inconsistent. We lock one shared height for product controls.

## Decision

1. **All shadcn `Button` / `buttonVariants` sizes are 40px tall**: `h-10` for text sizes, `size-10` for icon sizes. Tokens (`default` / `sm` / `lg` / `icon*`) remain for API compatibility; height does not differ by token.
2. **Do not override height** with `h-11` / `h-12` / `size-8` / `size-11` on product buttons. Hierarchy stays in **variant** + tone ([D-023](D-023-gate-button-triad.md)), not size.
3. Controls paired with buttons (e.g. waitlist email `Input`) use the same **40px** row height (`Input` default is `h-10`). Gate fields use `gateFieldTone`: same glass as secondary buttons ([D-023](D-023-gate-button-triad.md)).
4. Still compose via shadcn ([D-003](D-003-shadcn-standard-controls.md)).

## Displaced

- One-off `h-12` on Join waitlist / Continue / Load
- `h-10` overrides that fought an earlier 36px `lg` (superseded by shared `h-10` token)
- Deck / sign-out icon `size-8` overrides
- Finale Share `h-auto` + `sharePadYPx` padding as the size source
- Hand-rolled underline Refresh on rate-limit wait
- Brief 44px (`h-11`) lock before settling on 40px

## Cost

40px is below Apple HIG / WCAG AAA (44×44). Acceptable tradeoff for denser chrome on phone; still above WCAG AA minimum (24×24) and prior 32-36px tokens. Dense lab / Plus dot-nav chrome is out of this lock until those surfaces move onto `Button`.

## Key files

- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/scrapped/gateChrome.ts`
- `src/components/scrapped/GateWaitlistForm.tsx`
- `src/components/scrapped/ApiScrappedDeck.tsx`
