"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContentCard } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

/** Organic Wrapped ribbon grammar: stroke-draw then slow float. */
export function RibbonDriftArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);

  return (
    <div className="absolute inset-0 bg-[#2a1458]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ opacity: overview ? 1 : 0.65 }}
      >
        <defs>
          <linearGradient id="lab-ribbon-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d8d" />
            <stop offset="45%" stopColor="#ffc93c" />
            <stop offset="100%" stopColor="#3de0ff" />
          </linearGradient>
          <linearGradient id="lab-ribbon-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b44dff" />
            <stop offset="50%" stopColor="#ff6b3d" />
            <stop offset="100%" stopColor="#ffe66d" />
          </linearGradient>
          <linearGradient id="lab-ribbon-c" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3de0ff" />
            <stop offset="55%" stopColor="#ff4d8d" />
            <stop offset="100%" stopColor="#7cff6b" />
          </linearGradient>
        </defs>

        {(
          [
            {
              id: "a",
              d: "M-40 120 C 40 40, 120 200, 200 80 S 340 20, 420 140",
              stroke: "url(#lab-ribbon-a)",
              width: 56,
            },
            {
              id: "b",
              d: "M-60 360 C 80 280, 160 420, 260 300 S 380 240, 460 380",
              stroke: "url(#lab-ribbon-b)",
              width: 72,
            },
            {
              id: "c",
              d: "M-20 540 C 100 480, 180 620, 300 500 S 400 460, 440 580",
              stroke: "url(#lab-ribbon-c)",
              width: 48,
            },
          ] as const
        ).map((r, i) => (
          <motion.path
            key={r.id}
            d={r.d}
            fill="none"
            stroke={r.stroke}
            strokeWidth={r.width}
            strokeLinecap="round"
            initial={
              reduce || !overview
                ? { pathLength: 1, opacity: 0.9 }
                : { pathLength: 0, opacity: 0 }
            }
            animate={
              reduce
                ? { pathLength: 1, opacity: 0.9 }
                : overview
                  ? {
                      pathLength: [0, 1, 1],
                      opacity: [0, 0.95, 0.9],
                      rotate: [0, 6, -3, 0],
                      y: [0, -10, 6, 0],
                    }
                  : { pathLength: 1, opacity: 0.7 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : overview
                  ? {
                      pathLength: {
                        duration: 1.4,
                        delay: i * 0.25,
                        ease: "easeOut",
                        repeat: Infinity,
                        repeatDelay: 3.2,
                      },
                      opacity: {
                        duration: 1.4,
                        delay: i * 0.25,
                        repeat: Infinity,
                        repeatDelay: 3.2,
                      },
                      rotate: {
                        duration: 14 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5,
                      },
                      y: {
                        duration: 14 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5,
                      },
                    }
                  : { duration: 0.35 }
            }
          />
        ))}
      </svg>
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
