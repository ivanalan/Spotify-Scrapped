# Portable agent memory framework

> **The file is the memory, not the conversation.**  
> Every agent session starts from zero. Whatever isn’t written down is gone by the next one.

A light kit any repo can copy so humans and AI agents share the same page. Inspired by City Café / Project Wonderkid documentation practice (PaaS UX All Hands, Oct 2026).

## Files to copy

| File | Answers |
|------|---------|
| `AGENTS.md` (or `CLAUDE.md`) | How do we work here? |
| `SOUL.md` | What must we protect? |
| `SCARS.md` | What has already hurt us? |
| `docs/decisions/` | What did we choose, and at what cost? |

Optional later: `docs/systems/<System>/README.md` (how it works today), slice docs (what we’re proving + stop line), `active.md` / board (where we are right now).

## Install in a new project

1. Copy this folder’s sibling patterns into the repo root / `docs/`:
   - Create `SOUL.md`, `SCARS.md`, `docs/decisions/README.md`
   - Add an always-on agent rule (Cursor: `.cursor/rules/agent-memory.mdc`) that points at those files
2. In `AGENTS.md`, add the reading-list table above and the contribution loop below
3. Fill `SOUL.md` with **this** product’s fantasy, non-negotiables, kill switch, and audience
4. Leave `SCARS.md` / decisions empty except a one-line “how to append” note — or seed from a real incident
5. Ship framework files in git next to the code

## Five rules

1. **Keep docs in the repo**, and ship them in the **same commit** as the change.
2. **Split by system** (how it works today) and by **slice** (what we’re proving, with a stop line).
3. **One fact, one place** — status on the board, not buried in old plans; decisions in `D-NNN`, not restated everywhere.
4. **Write scars down**, with the **symptom as the title**.
5. **Enforce** with rules, hooks, and checks — or expect drift.

## Contribution loop (every agent)

```
1 Start     Read SOUL.md. If diagnosing, skim SCARS.md / recent decisions.
2 Plan      Multi-step work: skeleton in the repo (not only chat).
3 Build     Implement; tick evidence in-repo when you have a board/task list.
4 Decide    Under uncertainty: add docs/decisions/D-NNN-*.md (why, displaced, cost).
5 Hand off  If something hurt: append SCARS.md. Do not leave traps only in chat.
```

Agents **write the docs as part of the work**. Chat is disposable.

## SCARS format

```markdown
## <Symptom in the reporter’s words>
- **Not:** …
- **Cause:** …
- **Proof:** …
- **Avoid:** …
```

## Decisions format

See [docs/decisions/README.md](../decisions/README.md). IDs: `D-001`, `D-002`, …

## AGENTS.md style

- Short and pointed; **every rule has a story** (name the incident).
- **Point, don’t copy** — link to the source of truth.
- Scope heavy rules to paths when possible so they load when relevant.

## SOUL.md style

One page. Holds the fantasy, locked non-negotiables, kill switch, and who you write for.  
Rules tell an agent how. The soul tells it what to protect when the rules run out.

## Do not

- Rely on prior chat transcripts as project memory
- Duplicate standards into five places that will diverge
- Automate giant checkpoint logs nobody reads (prune or don’t add)
- Leave an approved plan only in a temp folder — copy it into the repo
