# D-031: Pause story on tab / app hide

- **Date:** 2026-10-22
- **Status:** Locked

## Why

Chrome keeps playing tab audio when the user switches tabs or backgrounds the browser. Scrapped is a watched story, not a background music player. Leaving mid-deck with audio still running feels broken.

## Decision

1. On `visibilitychange` to hidden (`document.hidden`), sticky-pause the API story the same way as spacebar / the pause control: stop progress, mute soundtrack via existing `onPausedChange`, and cancel any speculative soundtrack prime.
2. **`DeckSoundtrack` pauses Spotify embeds synchronously in that same event.** Do not wait for React `enabled=false`; background Chrome throttles renders while audio tabs keep playing.
3. On return to visible, **stay paused**. The user taps play (or space) to continue. Do not auto-resume.
4. Media-key resume (`onExternalResume`) only fires after a real paused update while disabled. “Still playing right after we disabled” must keep calling `pause()`, not clear sticky pause.

## Displaced

- Auto-resume when the tab becomes visible again (MDN’s default audio example)
- Pausing audio only while leaving story progress running
- Relying only on sticky React state → `enabled` prop to stop embeds on hide

## Cost

Leaving during the gate still sticky-pauses; after Continue the deck may start paused until they tap play. Force-quit / process kill may not fire the handler; audio usually dies with the tab anyway.

## Key files

- `src/components/scrapped/DeckSoundtrack.tsx` (sync pause + hide latch + resume heuristic)
- `src/components/scrapped/ApiScrappedDeck.tsx` (`visibilitychange` → `setPausedSticky(true)`)
- `src/components/scrapped/ScrappedExperience.tsx` (`onPausedChange` / `onExternalPause` → sticky pause)
