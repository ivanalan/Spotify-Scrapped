# Fix plan: Soundtrack / pause bugs

**Status:** Shipped (2026-10-28). Investigation: [soundtrack-pause-bugs.md](soundtrack-pause-bugs.md).

## What shipped

| ID | Change |
|----|--------|
| H-hold200 | `PRIME_HOLD_CANCEL_MS` **200 → 550** in `ApiScrappedDeck.tsx` |
| H-b2 / hot | `cutTo` hot uses `play()` via `takeActOwnershipNow`; audible priming → `path=priming-hot` immediate ownership |
| H-a1 / H-c1 | `scheduleCutoverFallback` calls `play()` when next entry is already audible |
| H-d1 | `cancelPrime` sets ~700ms reject latch; late `playback_started` / `playback_update` pause+seek |
| H-a2 | Loop A/B `seek+play`; cut only after idle progress proof; iOS / latched `path=same-act`; silent twin → timer/watchdog → `restartLoopOnAct` + `sameActOnly` latch (avoids Cursor start×2 stutter); `LOOP_CUT_LEAD_MS` 1800 |

## By design (not a code bug)

- **P2 Control Center / tab hide:** `visibilitychange` → sticky pause and stay paused is [D-031](../decisions/D-031-pause-on-tab-hide.md). Open system UI may hide the document; user taps play to continue.

## Verify

`/?debug=soundtrack`: tap-advance should log mostly `cutTo path=hot` (or `priming-hot`); hold ≥600ms should `primeHoldCancel` without sustained next-act bleed; no multi-second silence with `||` chrome on normal taps.

Loop stay-put (cases E/F): desktop `path=play` + `tryLoopCutover`; iPhone `path=same-act` + `restartLoopOnAct` then further `playback.nearEnd` on act. Silent twin should `loop.watchdog` → `restartLoopOnAct`.

## Out of scope (still)

- Autoplay-only next-URI prime (H-c2): story does not auto-advance slides.
- Changing D-031 stay-paused-on-return.
- Removing `?debug=soundtrack` panel (kept for regression).
