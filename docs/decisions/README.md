# Decisions

What we chose, why, what it displaced, and at what cost.

**One fact, one place**: the locked choice lives in a `D-NNN` file; other docs link here instead of restating.

## How to add a decision

1. Next ID = last `D-NNN` + 1 (zero-pad to three digits).
2. Create `D-NNN-short-kebab-title.md` using the template below.
3. Link it from `SCARS.md` / `SOUL.md` / code comments only when needed; don’t duplicate the full text.
4. **Ship the decision file in the same commit as the change** that locks it.

## Template

```markdown
# D-NNN: Title

- **Date:** YYYY-MM-DD
- **Status:** Locked | Superseded by D-MMM

## Why

What forced a choice.

## Decision

What we locked.

## Displaced

What we did *not* choose (and might revisit).

## Cost

What we give up, or what agents must remember forever.
```

## Index

| ID | Title | Status |
|----|--------|--------|
| [D-001](D-001-story-copy-vs-list-motion.md) | Story copy motion vs 5-row list pattern | Locked |
| [D-002](D-002-poppins-mobile-first.md) | Poppins type system + mobile-first gate | Locked |
| [D-003](D-003-shadcn-standard-controls.md) | shadcn for standard controls (Button, etc.) | Locked |
| [D-004](D-004-sign-in-sign-out-copy.md) | Sign in / sign out copy (not log / connect) | Locked |
| [D-005](D-005-handwritten-api-story-copy.md) | Handwritten API story copy (voice + closer beats) | Locked |
| [D-006](D-006-api-story-headline-style.md) | API story headline style (≤6 words, favs, open compounds) | Locked |
| [D-031](D-031-pause-on-tab-hide.md) | Pause story on tab / app hide; stay paused on return | Locked |
| [D-042](D-042-share-finale-card-pager.md) | Share finale multi-card pager + dots | Locked |
| [D-043](D-043-share-all-time-favs-g3-spine.md) | Share card 1 All time favs G3 spine left | Locked |
