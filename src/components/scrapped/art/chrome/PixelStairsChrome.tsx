"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard, PIXEL_COLORS } from "./carnival-palette";

type Step = { x: number; y: number; w: number; h: number; color: string };

function buildStairs(
  side: "tl" | "tr" | "bl" | "br",
  count: number,
): Step[] {
  const size = 22;
  const steps: Step[] = [];
  for (let i = 0; i < count; i += 1) {
    const color = PIXEL_COLORS[i % PIXEL_COLORS.length]!;
    if (side === "tl") {
      steps.push({
        x: i * size,
        y: (count - 1 - i) * size,
        w: size,
        h: size,
        color,
      });
    } else if (side === "tr") {
      steps.push({
        x: 360 - (i + 1) * size,
        y: (count - 1 - i) * size,
        w: size,
        h: size,
        color,
      });
    } else if (side === "bl") {
      steps.push({
        x: i * size,
        y: 640 - (count - i) * size,
        w: size,
        h: size,
        color,
      });
    } else {
      steps.push({
        x: 360 - (i + 1) * size,
        y: 640 - (count - i) * size,
        w: size,
        h: size,
        color,
      });
    }
  }
  return steps;
}

const ALL_STEPS = [
  ...buildStairs("tl", 7),
  ...buildStairs("tr", 6),
  ...buildStairs("bl", 6),
  ...buildStairs("br", 8),
];

/** Stepped pixel blocks along the edges — Wrapped pixel-border vibe. */
export function PixelStairsChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0" style={{ background: CARNIVAL.deep }}>
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${CARNIVAL.cyan}55 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 30% 70%, ${CARNIVAL.magenta}44 0%, transparent 50%), linear-gradient(160deg, ${CARNIVAL.purple} 0%, #0d0624 100%)`,
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {ALL_STEPS.map((step, i) => (
          <motion.rect
            key={`${step.x}-${step.y}-${i}`}
            x={step.x}
            y={step.y}
            width={step.w}
            height={step.h}
            fill={step.color}
            animate={
              reduce
                ? undefined
                : {
                    y: [step.y, step.y + (i % 2 === 0 ? 6 : -6), step.y],
                    opacity: [0.85, 1, 0.85],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: 2.4 + (i % 5) * 0.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (i % 8) * 0.12,
                  }
            }
          />
        ))}
      </svg>
      <ContentCard inset="14%" />
    </div>
  );
}
