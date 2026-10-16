# Decisions

What we chose, why, what it displaced, and at what cost.

**One fact, one place** — the locked choice lives in a `D-NNN` file; other docs link here instead of restating.

## How to add a decision

1. Next ID = last `D-NNN` + 1 (zero-pad to three digits).
2. Create `D-NNN-short-kebab-title.md` using the template below.
3. Link it from `SCARS.md` / `SOUL.md` / code comments only when needed — don’t duplicate the full text.
4. **Ship the decision file in the same commit as the change** that locks it.

## Template

```markdown
# D-NNN — Title

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
