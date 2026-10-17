"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContentCard } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

const BG = "#3a1560";
const STRIPE = "#f4efe8";
const COUNT = 14;

/** Hard diagonal / chevron force field — wipe reveal like printed ink. */
export function StripeForceArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BG }}>
      <div
        className="absolute inset-[-40%] flex origin-center"
        style={{
          transform: "rotate(-28deg)",
          gap: overview ? 14 : 18,
          opacity: overview ? 1 : 0.55,
        }}
      >
        {Array.from({ length: COUNT }, (_, i) => (
          <motion.div
            key={i}
            className="h-[160%] w-[22px] shrink-0 rounded-sm"
            style={{
              background: STRIPE,
              transformOrigin: i % 2 === 0 ? "top center" : "bottom center",
            }}
            initial={
              reduce || !overview
                ? { scaleY: 1, opacity: overview ? 0.95 : 0.5 }
                : { scaleY: 0, opacity: 0 }
            }
            animate={
              reduce
                ? { scaleY: 1, opacity: 0.95 }
                : overview
                  ? {
                      scaleY: [0, 1, 1, 0],
                      opacity: [0, 1, 1, 0],
                    }
                  : { scaleY: 1, opacity: 0.5 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : overview
                  ? {
                      duration: 4.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.08,
                      times: [0, 0.22, 0.72, 1],
                    }
                  : { duration: 0.3 }
            }
          />
        ))}
      </div>
      <motion.div
        className="absolute left-1/2 top-[18%] h-0 w-0 -translate-x-1/2 border-l-[48px] border-r-[48px] border-t-[72px] border-l-transparent border-r-transparent border-t-[#c4a8ff]"
        initial={
          reduce || !overview
            ? { opacity: 0.7, scale: 1 }
            : { opacity: 0, scale: 0.4 }
        }
        animate={
          reduce
            ? { opacity: 0.7 }
            : overview
              ? { opacity: [0, 0.85, 0.85, 0], scale: [0.4, 1, 1, 0.9] }
              : { opacity: 0.35, scale: 1 }
        }
        transition={
          reduce
            ? undefined
            : overview
              ? { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
        }
      />
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
