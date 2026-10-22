"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContentCard } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

const BG = "#1a0f2e";
const CURVES = [
  {
    d: "M-20 180 C 60 40, 140 320, 220 120 S 340 60, 400 200",
    color: "#ff6b9d",
    width: 28,
  },
  {
    d: "M-40 360 C 80 240, 160 480, 280 300 S 380 260, 440 400",
    color: "#5ce1e6",
    width: 36,
  },
  {
    d: "M-30 520 C 100 440, 180 600, 300 480 S 390 440, 430 560",
    color: "#c4f542",
    width: 22,
  },
  {
    d: "M40 -20 C 80 100, 40 200, 120 280 S 200 400, 160 520",
    color: "#ff9f43",
    width: 18,
  },
] as const;

/** Soft Surfaces album language: thick organic strokes on saturated flats. */
export function SoftCurvesArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BG }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {CURVES.map((c, i) => (
          <motion.path
            key={i}
            d={c.d}
            fill="none"
            stroke={c.color}
            strokeWidth={c.width}
            strokeLinecap="round"
            initial={
              reduce || !overview
                ? { pathLength: 1, opacity: overview ? 0.95 : 0.5 }
                : { pathLength: 0, opacity: 0 }
            }
            animate={
              reduce
                ? { pathLength: 1, opacity: 0.95 }
                : overview
                  ? {
                      pathLength: [0, 1, 1, 0],
                      opacity: [0, 1, 1, 0],
                      y: [0, -8, 6, 0],
                    }
                  : { pathLength: 1, opacity: 0.5 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : overview
                  ? {
                      duration: 5.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.35,
                      times: [0, 0.35, 0.7, 1],
                    }
                  : { duration: 0.4 }
            }
          />
        ))}
      </svg>
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
