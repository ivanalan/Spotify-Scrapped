"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Default scene motion length — long enough for two text phases. Does not auto-advance. */
export const STORY_SCENE_MS = 6000;

/** Stable fallback so the effect deps array never gains/loses a slot. */
const NO_SCENE_DURATIONS: readonly number[] = [];
const NO_BEAT_DURATIONS: readonly (readonly number[] | undefined)[] = [];

type Options = {
  active: number;
  /** Bumps when the user re-enters a scene so motion + progress restart. */
  visitKey: number;
  sceneCount: number;
  /** Beats per scene (line phases: title / subtitle / aside). */
  beatCounts: readonly number[];
  /** Per-scene duration in ms; falls back to STORY_SCENE_MS. */
  sceneDurationsMs?: readonly number[];
  /**
   * Optional per-beat durations (ms) per scene. When present for the active
   * scene, drives beat index + progress instead of an equal split.
   */
  beatDurationsMs?: readonly (readonly number[] | undefined)[];
  /** When true, skip the progress clock (e.g. gate-held premount). */
  holdActive?: boolean;
  paused: boolean;
  reduceMotion: boolean | null;
  /** Direct DOM write for the active segment fill (avoids 60fps React renders). */
  activeFillRef: RefObject<HTMLDivElement | null>;
};

function resolveBeatSchedule(
  beatCount: number,
  sceneDurationMs: number,
  beatDurations: readonly number[] | undefined,
): { totalMs: number; cumulative: number[] } {
  if (beatDurations && beatDurations.length > 0) {
    const durations = [...beatDurations];
    while (durations.length < beatCount) {
      durations.push(durations[durations.length - 1] ?? 2500);
    }
    const trimmed = durations.slice(0, Math.max(1, beatCount));
    const cumulative: number[] = [];
    let sum = 0;
    for (const d of trimmed) {
      sum += d;
      cumulative.push(sum);
    }
    return { totalMs: sum, cumulative };
  }

  const beats = Math.max(1, beatCount);
  const windowMs = sceneDurationMs / beats;
  const cumulative: number[] = [];
  for (let i = 0; i < beats; i += 1) {
    cumulative.push(windowMs * (i + 1));
  }
  return { totalMs: sceneDurationMs, cumulative };
}

/**
 * Drives in-scene progress + mid-scene beat index.
 * Progress fills 0→1 over the scene duration and stops — the user advances.
 */
export function useStoryAutoplay({
  active,
  visitKey,
  sceneCount,
  beatCounts,
  sceneDurationsMs = NO_SCENE_DURATIONS,
  beatDurationsMs = NO_BEAT_DURATIONS,
  holdActive = false,
  paused,
  reduceMotion,
  activeFillRef,
}: Options) {
  const [beatIndex, setBeatIndex] = useState(0);
  // Track scene identity so we can reset beatIndex during render (before
  // paint). A post-paint useEffect left one frame of the *previous* scene’s
  // beat on the incoming slide — e.g. “Top ghosted song” flashing first.
  const [sceneEpoch, setSceneEpoch] = useState({ active, visitKey });
  if (active !== sceneEpoch.active || visitKey !== sceneEpoch.visitKey) {
    setSceneEpoch({ active, visitKey });
    setBeatIndex(0);
  }

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const beatRef = useRef(0);
  beatRef.current = beatIndex;

  useEffect(() => {
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

    const beats = Math.max(1, beatCounts[active] ?? 1);
    const { totalMs, cumulative } = resolveBeatSchedule(
      beats,
      sceneDurationsMs?.[active] ?? STORY_SCENE_MS,
      beatDurationsMs[active],
    );

    // Always start this scene’s clock from beat 0 (render reset may have
    // already zeroed state; keep the ref in lockstep before the first RAF).
    beatRef.current = 0;

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
      const nextProgress = Math.min(1, elapsed / totalMs);

      if (activeFillRef.current) {
        activeFillRef.current.style.transform = `scaleX(${nextProgress})`;
      }

      let nextBeat = beats - 1;
      for (let i = 0; i < cumulative.length; i += 1) {
        if (elapsed < cumulative[i]!) {
          nextBeat = i;
          break;
        }
      }

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
    sceneDurationsMs,
    beatDurationsMs,
    holdActive,
    reduceMotion,
    activeFillRef,
  ]);

  return { beatIndex };
}
