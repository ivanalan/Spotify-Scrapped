"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ovalRx, ovalRy } from "./ShapeKit";

type MotifProps = {
  accent: string;
  accent2: string;
  animate?: "soft" | "none";
};

/**
 * List peripheral art:
 * - Top: a couple of simple clouds drifting slowly across
 * - Bottom-left: simple gradient orb (2 stops)
 */
export function ListFrame({ accent, accent2, animate = "soft" }: MotifProps) {
  const reduce = useReducedMotion();
  const freeze = reduce || animate === "none";

  return (
    <g>
      <DriftingClouds from={accent} to={accent2} freeze={freeze} />
      <g transform="translate(-40, 480)">
        <SimpleOrb from={accent} to={accent2} freeze={freeze} />
      </g>
    </g>
  );
}

/** Minimal cloud — three bumps, flat bottom. */
function cloudPath() {
  return "M 20 56 C 8 56 4 40 18 34 C 14 18 36 8 52 20 C 62 8 88 12 92 30 C 110 28 118 48 102 56 Z";
}

function DriftingClouds({
  from,
  to,
  freeze,
}: {
  from: string;
  to: string;
  freeze: boolean;
}) {
  const g1 = useId();
  const g2 = useId();

  return (
    <g>
      <defs>
        <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={g2} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={to} />
          <stop offset="100%" stopColor={from} />
        </linearGradient>
      </defs>

      {/* Cloud A — larger, higher, drifts L→R */}
      <motion.g
        initial={false}
        animate={
          freeze
            ? { x: 40, y: 6 }
            : { x: [-80, 320], y: [8, 4, 8] }
        }
        transition={
          freeze
            ? undefined
            : {
                x: {
                  duration: 28,
                  repeat: Infinity,
                  ease: "linear",
                },
                y: {
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        <g transform="scale(1.15)">
          <path d={cloudPath()} fill={`url(#${g1})`} opacity={0.92} />
        </g>
      </motion.g>

      {/* Cloud B — smaller, lower, drifts opposite / offset phase */}
      <motion.g
        initial={false}
        animate={
          freeze
            ? { x: 200, y: 28 }
            : { x: [300, -100], y: [30, 24, 30] }
        }
        transition={
          freeze
            ? undefined
            : {
                x: {
                  duration: 36,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 4,
                },
                y: {
                  duration: 11,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                },
              }
        }
      >
        <g transform="scale(0.78)">
          <path d={cloudPath()} fill={`url(#${g2})`} opacity={0.8} />
        </g>
      </motion.g>
    </g>
  );
}

/** Simple corner orb — locked oval, two-stop radial gradient. */
function SimpleOrb({
  from,
  to,
  freeze,
}: {
  from: string;
  to: string;
  freeze: boolean;
}) {
  const gradId = useId();
  const r = 120;

  return (
    <g>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor={to} />
          <stop offset="100%" stopColor={from} />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx={110}
        cy={130}
        rx={ovalRx(r)}
        ry={ovalRy(r)}
        fill={`url(#${gradId})`}
        initial={freeze ? false : { scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "110px 130px" }}
      />
    </g>
  );
}
