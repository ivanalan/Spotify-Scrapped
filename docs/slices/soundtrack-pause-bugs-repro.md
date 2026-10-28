# Repro runbook: soundtrack same-URI loop

Companion to [soundtrack-pause-bugs.md](soundtrack-pause-bugs.md).  
Enable: open the API story with `?debug=soundtrack`.

HUD is focused on **A/B sample loop** failure (silence with `||` chrome after preview end). Prior pause/prime cases A–D are retired.

## On-device panel (preferred)

With the flag on, a bottom HUD appears:

1. Continue into a middeck act (volume ocean is fine). Sound on, chrome `||`.
2. **Do not tap.** Wait past preview end (~30s from when that act’s sample started).
3. For Cursor / desktop “dies after two loops”: wait through a second end (~60s+).
4. Mark **E First loop** / **F Second loop** when done.
5. Tap **Copy** and paste below.

No Mac Web Inspector required. Console still gets `[scrapped:soundtrack]` lines.

## Environment

| Field | Value |
|-------|--------|
| Target | iOS Safari (zero loops) or Cursor/desktop Safari (often 2 then stop) |
| URL | `/?debug=soundtrack` (canonical). `/scrapped?debug=soundtrack` redirects here. |
| Capture | Panel **Copy**, or console filter `[scrapped:soundtrack]` |

## Expected log signatures

### Case E: First loop (stay-put past preview end)

1. Clear the panel after the act is audible.
2. Hands off until silence or until you hear the sample restart.

**Healthy:** near end → `playback.nearEnd` → `loop.schedule action=armLead` (often at rem≈1–1.8s; outer window may `armEndTimer` first) → `beginLoopCutover path=play` → `tryLoopCutover` → audio continues; later `playback.nearEnd` again with rising `pos`.

**Bug (mobile class):** silence with `||`; look for `beginLoopCutover.skip`, `fallbackLoopRestart.skip`, `tryLoopCutover.timerSkip`, or **no** `beginLoopCutover` after the last `playback.nearEnd` / `loop.pausedAtEnd`.

**Maps to:** H-a2.

### Case F: Second loop

Same as E, but wait through two successful cutovers. Cursor often dies on the **second** arm (act→twin works; twin→act fails).

**Healthy:** two `tryLoopCutover` (or fallback) pairs with continuous audio.  
**Bug:** second `beginLoopCutover` skips / timerSkip / silence after second end.

## Loop events (amber in HUD)

| Event | Meaning |
|-------|---------|
| `playback.nearEnd` | Owning slot update with rem ≲ 5s (throttled 1s) |
| `loop.schedule` | `armLead` / `armEndTimer` / `endTimerFire` / skips |
| `beginLoopCutover` | Armed idle slot (`path=hot\|play`) or `path=fallback` |
| `beginLoopCutover.skip` | `canBeginLoop` blocked (`reason=…`) |
| `tryLoopCutover` | Ownership flipped to idle slot |
| `tryLoopCutover.timer` / `.timerSkip` | 450ms fallback cut |
| `fallbackLoopRestart` | Same-embed seek+play when twin not ready |
| `loop.pausedAtEnd` | Spotify paused at end; kick cutover |
| `ensureTwinUri` | Twin loaded for committed act |

## Paste logs here

### Run 1 (date / device)

```
(paste [scrapped:soundtrack] lines)
```

| Case | Result | Notes |
|------|--------|-------|
| E | | |
| F | | |
