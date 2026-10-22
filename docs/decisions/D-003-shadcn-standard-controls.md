# D-003: shadcn for standard controls

- **Date:** 2026-10-16
- **Status:** Locked

## Why

Gate “Log out” was plain muted text with a hand-rolled opacity hover; not an obvious control, and not our existing button system. Agents kept inventing one-off button looks beside the shadcn primitives already in `src/components/ui/`.

## Decision

1. **Standard interactive controls** (buttons, dialog actions, icon buttons, form CTAs that are buttons) use **shadcn** components under `src/components/ui/`: especially [`Button`](../../src/components/ui/button.tsx) / `buttonVariants`.
2. **Do not** invent parallel button components, style plain text/links as buttons with custom hover, or re-implement padding / focus / disabled states by hand.
3. Prefer **`variant` + `size`** over long `className` stacks. Extra classes are for layout placement or unavoidable product-tone contrast; not a second design system. Tap height is locked at **40px** ([D-026](D-026-button-tap-target-40.md)); do not override with `h-*` / `size-*`.
4. **Composite widgets are fine** (e.g. sign-out confirm = alert dialog + logout). Their chrome still composes shadcn `Button` / dialog primitives.

## Displaced

- Hand-styled text “buttons” (`transition-opacity hover:opacity-70`, bare `<a>` / `<button>` with one-off skins for standard actions)
- New bespoke button components when `Button` already covers the need

## Cost

Wrapped paper surfaces (`--wrapped-*`) still invert the global dark theme tokens, so some ink/canvas `className` overrides remain until theme scope is fixed. That is temporary tone bridging; not permission to skip `Button`. Story **art** and non-control motion stay outside this rule.

**Portal trap:** AlertDialog (and other portaled UI) mounts outside `.wrapped-story`, so `--wrapped-*` does not apply. Use literal paper hex (`#f4f4f2` / `#1c1c1c`) on dialog chrome, or the panel goes transparent.

## Key files

- `src/components/ui/button.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/scrapped/SignOutConfirmButton.tsx`
