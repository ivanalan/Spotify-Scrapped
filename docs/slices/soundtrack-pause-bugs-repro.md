# Repro runbook: soundtrack / pause bugs

Companion to [soundtrack-pause-bugs.md](soundtrack-pause-bugs.md).  
Enable: open the API story with `?debug=soundtrack`.

## On-device panel (preferred)

With the flag on, a bottom HUD appears on `/scrapped`:

1. Run **A Autoplay**, **B Long-press**, **C Control Center**, **D Tap-advance** (tap each chip when done).
2. Watch the live log (amber = cutover / sticky / visibility / prime).
3. Tap **Copy** and paste into the table below (or the investigation slice).

No Mac Web Inspector required. Console still gets the same `[scrapped:soundtrack]` lines.

## Environment

| Field | Value |
|-------|--------|
| Target | iOS Safari (same class as `recordingbugs.MP4`) or desktop |
| URL | `/?debug=soundtrack` (canonical). `/scrapped?debug=soundtrack` redirects here and keeps the query. |
| Capture | On-device panel **Copy**, or console filter `[scrapped:soundtrack]` |

## Expected log signatures

### Case A: Hands-off autoplay (first 3 slides)

1. Continue from gate; do not tap zones.
2. Watch Liked → next volume-ish slides.

**Healthy:** occasional `cutTo` path `cold` (or uri sync without prime); audio continuous or brief overlap.  
**P1/P4 bug:** `cutoverFallback` then multi-second silence **without** `sticky` / `visibilitychange`. Snapshot shows `enabled: true`, `playingUri` set, but no audible progress.  
**Maps to:** H-a1, H-c1, H-c2.

### Case B: Long-press right zone (≥500ms)

1. Mid-slide with sound on, press and hold the right tap zone.
2. Prefer release without a click if the browser allows; also note if a click still fires.

**Healthy (post-fix):** `zonePointerDown` → `primeTo` → (~550ms) `primeHoldCancel` → `cancelPrime` + reject latch; next URI silent after cancel; no `zoneClick`/`goTo`/`cutTo` unless a click committed.  
**Still a bug if:** next URI stays audible after `cancelPrime`; or `zoneClick`/`cutTo` after a hold (H-d3).  
**Maps to:** H-d1, H-d2, H-d3.

### Case C: Control Center mid-slide

1. Playing with `||` chrome; open Control Center; dismiss; look at chrome.

**If iOS sets `document.hidden`:** `visibilitychange` (ApiScrappedDeck + DeckSoundtrack) → `sticky` source `pauseStory` / state `pausedSticky: true`. Staying paused on return is [D-031](../decisions/D-031-pause-on-tab-hide.md) (document, not a bug).  
**If chrome pauses without those logs:** look for `notifyExternalPause` (H-p2) or accidental `togglePaused` (H-p3).  
**Maps to:** H-p1 (likely for recording ~37.6s), H-p2, H-p3.

### Case D: Tap-advance each slide

1. Tap right through soft close; note gap length by ear.

**Healthy (post-fix):** `zonePointerDown` → `primeTo` → `zoneClick` → `cutTo` path `hot` or `priming-hot`; no ~1s hole. Cold path rare on normal taps.  
**Still a bug if:** most taps are `path=cold` or `priming` + `cutoverFallback` with audible silence.

## Paste logs here

### Run 1 (date / device)

```
(paste [scrapped:soundtrack] lines)
```

| Case | Result | Hypothesis IDs |
|------|--------|----------------|
| A | | |
| B | | |
| C | | |
| D | | |

## Recordingbugs crosswalk (no device required)

Already observed in `recordingbugs.MP4` (audio RMS + frames). Use to prioritize which cases to run first:

| Recording moment | Pain | First case to run |
|------------------|------|-------------------|
| 5.0–10.4s silence, `\|\|` chrome | P1 | A, then D |
| 4.1–5.0 / 10.4–11.0 chirps | P3 / P4 | B, D |
| ~22.6s gap after restart | P2 vs P4 | D, then C |
| ~30s AssistiveTouch / Control Center | P2 / gesture | C, B |
| ~37.6s pause + play icon | P2 | C |
