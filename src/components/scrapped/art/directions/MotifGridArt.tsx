"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContentCard } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

const BG = "#1f6b4a";
const MOTIF = "#f2a7c3";
const COLS = 8;
const ROWS = 14;

/** City-poster density — one glyph cascaded into a field. */
export function MotifGridArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);
  const cells = COLS * ROWS;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BG }}>
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          opacity: overview ? 1 : 0.55,
          padding: 10,
          gap: 6,
        }}
      >
        {Array.from({ length: cells }, (_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const cx = col / (COLS - 1) - 0.5;
          const cy = row / (ROWS - 1) - 0.5;
          // Clear center for content
          if (Math.abs(cx) < 0.28 && Math.abs(cy) < 0.32) {
            return <div key={i} />;
          }
          const delay = overview
            ? (Math.abs(cx) + Math.abs(cy)) * 0.55 + (col + row) * 0.02
            : 0;
          return (
            <motion.div
              key={i}
              className="flex items-center justify-center"
              initial={
                reduce || !overview
                  ? { scale: 1, opacity: overview ? 1 : 0.55 }
                  : { scale: 0, opacity: 0 }
              }
              animate={
                reduce
                  ? { scale: 1, opacity: 1 }
                  : overview
                    ? {
                        scale: [0, 1.15, 1, 1, 0],
                        opacity: [0, 1, 1, 1, 0],
                      }
                    : { scale: 1, opacity: 0.55 }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : overview
                    ? {
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay,
                        times: [0, 0.12, 0.2, 0.75, 1],
                      }
                    : { duration: 0.25 }
              }
            >
              <span
                className="block h-[55%] w-[55%] rounded-full"
                style={{ background: MOTIF }}
              />
            </motion.div>
          );
        })}
      </div>
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
