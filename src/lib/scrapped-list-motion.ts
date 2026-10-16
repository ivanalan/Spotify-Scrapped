/** Discrete enter styles for 5-row story lists (ghosted / reunion / one-like). */

export type ListMotionId =
  | "rise"
  | "cascade"
  | "snap"
  | "slide"
  | "drop"
  | "pop"
  | "cover-lead"
  | "index-first";

export type ListMotionMeta = {
  id: ListMotionId;
  label: string;
  technique: string;
  when: string;
};

export type ListMotionGroup = {
  title: string;
  note: string;
  styles: ListMotionMeta[];
};

export const LIST_MOTION_GROUPS: ListMotionGroup[] = [
  {
    title: "Stagger rise",
    note: "Same family as the live deck — opacity + travel.",
    styles: [
      {
        id: "rise",
        label: "Rise",
        technique: "Fade + short rise; 70ms row gap",
        when: "Quieter alternate — shorter stagger than cascade",
      },
      {
        id: "cascade",
        label: "Cascade (live)",
        technique: "Wider stagger; each row’s enter runs longer than the last",
        when: "Production default for every 5-row story list",
      },
      {
        id: "snap",
        label: "Snap",
        technique: "Shorter duration, tighter stagger",
        when: "Brisk lists after a long setup line",
      },
    ],
  },
  {
    title: "Direction",
    note: "Still transform + opacity only.",
    styles: [
      {
        id: "slide",
        label: "Slide in",
        technique: "Rows enter from the left",
        when: "Setlist / ranked-list energy without bounce",
      },
      {
        id: "drop",
        label: "Drop in",
        technique: "Rows settle from above",
        when: "Slightly more weight than rise",
      },
      {
        id: "pop",
        label: "Soft pop",
        technique: "Subtle scale + fade per row",
        when: "Covers matter — a touch of presence",
      },
    ],
  },
  {
    title: "Part choreography",
    note: "Row pieces enter on different clocks.",
    styles: [
      {
        id: "cover-lead",
        label: "Cover lead",
        technique: "Cover lands first; title follows",
        when: "Album art is half the joke",
      },
      {
        id: "index-first",
        label: "Index first",
        technique: "Number ticks, then the row",
        when: "Ranked setlist / countdown feel",
      },
    ],
  },
];

export const DEFAULT_LIST_MOTION: ListMotionId = "cascade";

export type ListRowMotionPlan = {
  row: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    inactive: Record<string, number>;
    duration: number;
    delay: number;
    ease: readonly [number, number, number, number];
  };
  cover?: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    duration: number;
    delay: number;
  };
  text?: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    duration: number;
    delay: number;
  };
  index?: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    duration: number;
    delay: number;
  };
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Live cascade defaults — also the slider lab’s starting point. */
export const CASCADE_DEFAULTS = {
  rowY: 14,
  startDelaySec: 0.06,
  staggerSec: 0.15,
  durationBaseSec: 0.52,
  durationStepSec: 0.16,
} as const;

export type ListMotionOverrides = {
  rowY?: number;
  startDelaySec?: number;
  staggerSec?: number;
  durationBaseSec?: number;
  durationStepSec?: number;
};

export function planListRowMotion(
  id: ListMotionId,
  index: number,
  options: {
    active: boolean;
    reduceMotion: boolean;
    overrides?: ListMotionOverrides;
  },
): ListRowMotionPlan {
  const { active, reduceMotion, overrides } = options;

  if (reduceMotion) {
    return {
      row: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        inactive: { opacity: 0.85 },
        duration: 0,
        delay: 0,
        ease,
      },
    };
  }

  const baseDelay = (extra: number) => (active ? extra : 0);

  switch (id) {
    case "cascade": {
      const rowY = overrides?.rowY ?? CASCADE_DEFAULTS.rowY;
      const start = overrides?.startDelaySec ?? CASCADE_DEFAULTS.startDelaySec;
      const stagger = overrides?.staggerSec ?? CASCADE_DEFAULTS.staggerSec;
      const durBase =
        overrides?.durationBaseSec ?? CASCADE_DEFAULTS.durationBaseSec;
      const durStep =
        overrides?.durationStepSec ?? CASCADE_DEFAULTS.durationStepSec;
      return {
        row: {
          initial: { opacity: 0, y: rowY },
          animate: { opacity: 1, y: 0 },
          inactive: { opacity: 0.2, y: rowY },
          // Each successive row takes longer to settle.
          duration: durBase + index * durStep,
          delay: baseDelay(start + index * stagger),
          ease,
        },
      };
    }
    case "snap":
      return {
        row: {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          inactive: { opacity: 0.2, y: 12 },
          duration: 0.28,
          delay: baseDelay(0.06 + index * 0.045),
          ease,
        },
      };
    case "slide":
      return {
        row: {
          initial: { opacity: 0, x: -18 },
          animate: { opacity: 1, x: 0 },
          inactive: { opacity: 0.2, x: -10 },
          duration: 0.4,
          delay: baseDelay(0.1 + index * 0.07),
          ease,
        },
      };
    case "drop":
      return {
        row: {
          initial: { opacity: 0, y: -16 },
          animate: { opacity: 1, y: 0 },
          inactive: { opacity: 0.2, y: -8 },
          duration: 0.42,
          delay: baseDelay(0.1 + index * 0.075),
          ease,
        },
      };
    case "pop":
      return {
        row: {
          initial: { opacity: 0, y: 8, scale: 0.96 },
          animate: { opacity: 1, y: 0, scale: 1 },
          inactive: { opacity: 0.2, y: 8, scale: 0.96 },
          duration: 0.38,
          delay: baseDelay(0.1 + index * 0.065),
          ease,
        },
      };
    case "cover-lead": {
      const rowDelay = baseDelay(0.08 + index * 0.08);
      return {
        row: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          inactive: { opacity: 0.2 },
          duration: 0.28,
          delay: rowDelay,
          ease,
        },
        cover: {
          initial: { opacity: 0, scale: 0.88 },
          animate: { opacity: 1, scale: 1 },
          duration: 0.4,
          delay: rowDelay,
        },
        text: {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          duration: 0.34,
          delay: rowDelay + 0.1,
        },
        index: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          duration: 0.28,
          delay: rowDelay + 0.04,
        },
      };
    }
    case "index-first": {
      const tick = baseDelay(0.08 + index * 0.09);
      return {
        row: {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          inactive: { opacity: 0.2 },
          duration: 0,
          delay: 0,
          ease,
        },
        index: {
          initial: { opacity: 0, y: 8, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          duration: 0.32,
          delay: tick,
        },
        cover: {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          duration: 0.36,
          delay: tick + 0.07,
        },
        text: {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          duration: 0.36,
          delay: tick + 0.1,
        },
      };
    }
    case "rise":
    default:
      return {
        row: {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          inactive: { opacity: 0.2, y: 14 },
          duration: 0.4,
          delay: baseDelay(0.12 + index * 0.07),
          ease,
        },
      };
  }
}

export function allListMotionStyles(): ListMotionMeta[] {
  return LIST_MOTION_GROUPS.flatMap((g) => g.styles);
}

/** Seconds until the last row (and its parts) finish entering. */
export function listMotionSettleSec(
  id: ListMotionId,
  rowCount = 5,
): number {
  if (rowCount <= 0) return 0;
  const last = planListRowMotion(id, rowCount - 1, {
    active: true,
    reduceMotion: false,
  });
  let end = last.row.delay + last.row.duration;
  for (const part of [last.cover, last.text, last.index]) {
    if (part) end = Math.max(end, part.delay + part.duration);
  }
  return end;
}
