# D-019 — Left-on-read orchid corners + frame tune

**Status:** Locked  
**Date:** 2026-10-20  
**Surfaces:** `/scrapped` API deck scenes 5–6. Kit **B1**.

## Decision

Promote the left-on-read pair tune for scenes 5→6:

| Axis | Choice |
|------|--------|
| Field | Ink canvas + **B1 orchid corners** wash (orchid-deep TL · orchid-ink BR, wash op `0.75`) on both beats |
| Scene 5 pin | Typing bubble **horizontally centered**, below “Top artist left on read” · `84×43` — `left: calc(50% - half-width)` / `top: calc(50% + 128px)` |
| Scene 6 frame | Softer / larger edge stack — col scale `0.85` @ op `0.35`, top `8%`; mirror scale `0.9` @ op `0.21`, bottom `11.5%`; skew Y `11°` / Z `-3°` |
| Quiet→frame | Same geometry (no remount jump — keeps prior SCARS fix) |

## Why

Flat ink made the typing pin / edge bubbles feel stranded next to ghosted night and film beats. A quiet corner wash gives atmosphere without a second hero. Larger, quieter bubbles frame the list instead of competing with rows.

## Displaced

- Flat ink-only field on scenes 5–6 (motif-only escalation from [D-017](D-017-entity-list-pair-rhymes.md))
- Prior tight edge frame (scale ~0.55 / op ~0.8 · mirror ~0.62 / op ~0.38)
- Corner-pinned pin (chrome TL / cover TL) — pin is centered under the cover-lead headline instead

## Cost

Two more ink slides with orchid wash — must stay softer than bubble bloom so type/list remain the mid-band heroes ([D-015](D-015-list-art-frames-not-heroes.md)).

## Source of truth

- Chrome: `LeftOnReadChatChrome` + `middeck-metaphors.css` (`.mm-chat` / `.mm-chat-field`)
- Pair grammar unchanged: [D-017](D-017-entity-list-pair-rhymes.md) T1 pin → edge chorus
