"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContentCard } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

const BG = "#4a9fd8";
const PETAL = "#1f6b5a";
const RINGS = 5;
const PETALS = 12;

function petalPath(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  const tipX = cx + Math.cos(rad) * r;
  const tipY = cy + Math.sin(rad) * r;
  const left = rad - 0.22;
  const right = rad + 0.22;
  const mid = r * 0.55;
  return `M ${cx} ${cy} Q ${cx + Math.cos(left) * mid} ${cy + Math.sin(left) * mid} ${tipX} ${tipY} Q ${cx + Math.cos(right) * mid} ${cy + Math.sin(right) * mid} ${cx} ${cy}`;
}

/** Radial petal / fan — Rome / Hong Kong city posters. */
export function ConcentricBloomArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);
  const cx = 180;
  const cy = 280;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BG }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ opacity: overview ? 1 : 0.6 }}
      >
        {Array.from({ length: RINGS }, (_, ring) => {
          const r = 48 + ring * 38;
          return Array.from({ length: PETALS }, (_, p) => {
            const angle = (360 / PETALS) * p + ring * 8;
            const delay = overview ? ring * 0.18 + p * 0.04 : 0;
            return (
              <motion.path
                key={`${ring}-${p}`}
                d={petalPath(cx, cy, r, angle)}
                fill={PETAL}
                fillOpacity={0.85 - ring * 0.1}
                initial={
                  reduce || !overview
                    ? { scale: 1, opacity: overview ? 1 : 0.5 }
                    : { scale: 0, opacity: 0 }
                }
                style={{ transformOrigin: `${cx}px ${cy}px` }}
                animate={
                  reduce
                    ? { scale: 1, opacity: 1 }
                    : overview
                      ? {
                          scale: [0, 1.05, 1, 1, 0.85],
                          opacity: [0, 1, 1, 1, 0],
                          rotate: [0, 0, 12, 12, 0],
                        }
                      : { scale: 1, opacity: 0.5 }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : overview
                      ? {
                          duration: 5.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay,
                          times: [0, 0.2, 0.35, 0.7, 1],
                        }
                      : { duration: 0.3 }
                }
              />
            );
          });
        })}
        <motion.circle
          cx={cx}
          cy={cy}
          r={22}
          fill="#f5e6c8"
          initial={reduce || !overview ? { scale: 1 } : { scale: 0 }}
          animate={
            reduce
              ? { scale: 1 }
              : overview
                ? { scale: [0, 1.2, 1, 1, 0] }
                : { scale: 1 }
          }
          transition={
            reduce
              ? undefined
              : overview
                ? {
                    duration: 5.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.15, 0.3, 0.7, 1],
                  }
                : { duration: 0.3 }
          }
        />
      </svg>
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
