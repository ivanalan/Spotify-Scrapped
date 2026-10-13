"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Scene motion length — long enough for two text phases. Does not auto-advance. */
export const STORY_SCENE_MS = 8000;

type Options = {
  active: number;
  /** Bumps when the user re-enters a scene so motion + progress restart. */
  visitKey: number;
  sceneCount: number;
  /** Beats per scene (1 = single copy block, 2 = enter/exit pair). */
  beatCounts: readonly number[];
  /** When true, skip the progress clock (e.g. share finale). */
  holdActive?: boolean;
  paused: boolean;
  reduceMotion: boolean | null;
  /** Direct DOM write for the active segment fill (avoids 60fps React renders). */
  activeFillRef: RefObject<HTMLDivElement | null>;
};

/**
 * Drives in-scene progress + mid-scene beat index.
 * Progress fills 0→1 over the scene duration and stops — the user advances.
 */
export function useStoryAutoplay({
  active,
  visitKey,
  sceneCount,
  beatCounts,
  holdActive = false,
  paused,
  reduceMotion,
  activeFillRef,
}: Options) {
  const [beatIndex, setBeatIndex] = useState(0);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const beatRef = useRef(0);

  useEffect(() => {
    beatRef.current = 0;
    setBeatIndex(0);
    if (activeFillRef.current) {
      activeFillRef.current.style.transform = "scaleX(0)";
    }
  }, [active, visitKey, activeFillRef]);

  useEffect(() => {
    if (holdActive) {
      if (activeFillRef.current) {
        activeFillRef.current.style.transform = "scaleX(0)";
      }
      return;
    }
    if (active < 0 || active >= sceneCount) return;

    const duration = STORY_SCENE_MS;
    const beats = Math.max(1, beatCounts[active] ?? 1);
    const beatWindow = duration / beats;

    let raf = 0;
    let lastTs: number | null = null;
    let elapsed = 0;
    let done = false;

    const tick = (ts: number) => {
      if (done) return;

      if (pausedRef.current) {
        lastTs = null;
        raf = requestAnimationFrame(tick);
        return;
      }

      if (lastTs == null) lastTs = ts;
      const delta = ts - lastTs;
      lastTs = ts;

      elapsed += reduceMotion ? delta * 1.25 : delta;
      const nextProgress = Math.min(1, elapsed / duration);

      if (activeFillRef.current) {
        activeFillRef.current.style.transform = `scaleX(${nextProgress})`;
      }

      const nextBeat = Math.min(beats - 1, Math.floor(elapsed / beatWindow));
      if (nextBeat !== beatRef.current) {
        beatRef.current = nextBeat;
        setBeatIndex(nextBeat);
      }

      if (nextProgress >= 1) {
        done = true;
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      done = true;
      cancelAnimationFrame(raf);
    };
  }, [
    active,
    visitKey,
    sceneCount,
    beatCounts,
    holdActive,
    reduceMotion,
    activeFillRef,
  ]);

  return { beatIndex };
}
