import type { ReactNode } from "react";
import { isValidElement } from "react";

/** Soft enter / exit — transform + opacity only. */
export const STORY_MOTION = {
  copyEnterDelaySec: 0.04,
  titleY: 14,
  followY: 8,
  supportY: 10,
  titleScaleFrom: 0.985,
  titleFadeSec: 0.32,
  titleTravelSec: 0.52,
  followFadeSec: 0.32,
  followTravelSec: 0.52,
  exitFadeSec: 0.32,
  exitTravelSec: 0.42,
  exitY: -8,
  layoutStiffness: 160,
  layoutDamping: 28,
  layoutMass: 0.85,
} as const;

export type StoryCopyLines = {
  headline?: ReactNode;
  subline?: ReactNode;
  aside?: ReactNode;
};

/** Flatten React copy to plain text for reading-time estimates. */
export function plainText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(plainText).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return plainText(node.props.children);
  }
  return "";
}

/**
 * On-screen reading pace for story beats — brisk, still readable.
 * Clamped so short titles get a beat and long lines don’t stall.
 */
export function estimateReadingMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words <= 0) return 750;
  const wpm = 260;
  const raw = (words / wpm) * 60_000 + 220;
  return Math.min(2800, Math.max(850, Math.round(raw)));
}

/** How many title / subtitle / aside beats a copy block has. */
export function countCopyLineBeats(beat: StoryCopyLines): number {
  let n = beat.headline != null && beat.headline !== false ? 1 : 0;
  if (beat.subline != null && beat.subline !== false) n += 1;
  if (beat.aside != null && beat.aside !== false) n += 1;
  return Math.max(1, n);
}

export type StoryLinePhase = {
  narrativeIndex: number;
  /** 1 = title, 2 = title+sub, 3 = title+sub+aside */
  linesVisible: number;
};

/** Flatten narrative beats into per-line phases (progressive within a beat). */
export function buildStoryLinePhases(
  beats: readonly StoryCopyLines[],
): StoryLinePhase[] {
  const phases: StoryLinePhase[] = [];
  beats.forEach((beat, narrativeIndex) => {
    const lines = countCopyLineBeats(beat);
    for (let linesVisible = 1; linesVisible <= lines; linesVisible += 1) {
      phases.push({ narrativeIndex, linesVisible });
    }
  });
  return phases.length > 0
    ? phases
    : [{ narrativeIndex: 0, linesVisible: 1 }];
}

function lineTextAt(beat: StoryCopyLines, line: 1 | 2 | 3): string {
  if (line === 1) return plainText(beat.headline);
  if (line === 2) return plainText(beat.subline);
  return plainText(beat.aside);
}

/**
 * Duration for one line beat: enter motion + time to read that line.
 * First phase of a scene can add copyEnterDelaySec (intro gate).
 */
export function lineBeatDurationMs(
  beat: StoryCopyLines,
  linesVisible: number,
  options?: { copyEnterDelaySec?: number; isSceneStart?: boolean },
): number {
  const line = Math.min(3, Math.max(1, linesVisible)) as 1 | 2 | 3;
  const travelSec =
    line === 1 ? STORY_MOTION.titleTravelSec : STORY_MOTION.followTravelSec;
  const enterMs = travelSec * 1000;
  const delayMs =
    options?.isSceneStart && line === 1
      ? (options.copyEnterDelaySec ?? 0) * 1000
      : 0;
  return Math.round(delayMs + enterMs + estimateReadingMs(lineTextAt(beat, line)));
}

/** Per-phase durations for a scene’s narrative beats. */
export function storyLineBeatDurationsMs(
  beats: readonly StoryCopyLines[],
  options?: { copyEnterDelaySec?: number },
): number[] {
  const phases = buildStoryLinePhases(beats);
  return phases.map((phase, i) => {
    const beat = beats[phase.narrativeIndex] ?? {};
    let ms = lineBeatDurationMs(beat, phase.linesVisible, {
      copyEnterDelaySec: options?.copyEnterDelaySec,
      isSceneStart: i === 0,
    });
    // Budget previous-block exit at the *start* of a new narrative title beat
    // so the clock doesn’t eat the title-only window during mode="wait" exit.
    if (phase.narrativeIndex > 0 && phase.linesVisible === 1) {
      ms += STORY_MOTION.exitTravelSec * 1000;
    }
    return ms;
  });
}

export function sumMs(durations: readonly number[]): number {
  return durations.reduce((a, b) => a + b, 0);
}
