"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContentCard } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

const BG = "#e8f4f6";
const PANES = [
  {
    className: "left-[-18%] top-[-4%] h-[52%] w-[78%]",
    color: "rgba(90, 190, 210, 0.45)",
    rotateX: 28,
    rotateY: -36,
    enterX: -80,
    enterY: -40,
  },
  {
    className: "right-[-20%] top-[12%] h-[48%] w-[72%]",
    color: "rgba(255, 180, 160, 0.4)",
    rotateX: 20,
    rotateY: 40,
    enterX: 90,
    enterY: -30,
  },
  {
    className: "left-[-12%] bottom-[-6%] h-[46%] w-[85%]",
    color: "rgba(200, 210, 255, 0.42)",
    rotateX: -26,
    rotateY: 20,
    enterX: -50,
    enterY: 80,
  },
  {
    className: "right-[-14%] bottom-[8%] h-[40%] w-[68%]",
    color: "rgba(160, 220, 200, 0.38)",
    rotateX: -18,
    rotateY: -32,
    enterX: 70,
    enterY: 60,
  },
] as const;

/** Soft editorial translucent planes — University / Theology boards. */
export function GlassSlabsArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: BG }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #dff3f6 0%, #e8f4f6 45%, #f2e8e4 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          perspective: "900px",
          perspectiveOrigin: "50% 45%",
          opacity: overview ? 1 : 0.7,
        }}
      >
        {PANES.map((pane, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-3xl ${pane.className}`}
            style={{
              background: pane.color,
              transformStyle: "preserve-3d",
              border: "1px solid rgba(255,255,255,0.55)",
              boxShadow: "0 12px 36px rgba(40,80,100,0.12)",
              backdropFilter: "blur(2px)",
            }}
            initial={
              reduce || !overview
                ? {
                    rotateX: pane.rotateX,
                    rotateY: pane.rotateY,
                    x: 0,
                    y: 0,
                    opacity: overview ? 1 : 0.65,
                  }
                : {
                    rotateX: pane.rotateX + 20,
                    rotateY: pane.rotateY,
                    x: pane.enterX,
                    y: pane.enterY,
                    opacity: 0,
                  }
            }
            animate={
              reduce
                ? { opacity: 1, rotateX: pane.rotateX, rotateY: pane.rotateY }
                : overview
                  ? {
                      x: 0,
                      y: 0,
                      opacity: [1, 0.85, 1],
                      rotateX: [
                        pane.rotateX,
                        pane.rotateX + 8,
                        pane.rotateX,
                      ],
                      rotateY: [
                        pane.rotateY,
                        pane.rotateY - 6,
                        pane.rotateY,
                      ],
                    }
                  : {
                      opacity: 0.65,
                      rotateX: pane.rotateX,
                      rotateY: pane.rotateY,
                    }
            }
            transition={
              reduce
                ? { duration: 0 }
                : overview
                  ? {
                      x: { duration: 1, delay: i * 0.15, ease: "easeOut" },
                      y: { duration: 1, delay: i * 0.15, ease: "easeOut" },
                      opacity: {
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.2 + i * 0.15,
                      },
                      rotateX: {
                        duration: 14 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.2,
                      },
                      rotateY: {
                        duration: 16 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.2,
                      },
                    }
                  : { duration: 0.35 }
            }
          />
        ))}
      </div>
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
