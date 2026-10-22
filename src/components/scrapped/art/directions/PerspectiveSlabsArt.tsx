"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  CARNIVAL,
  ContentCard,
} from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

type Slab = {
  className: string;
  gradient: string;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  duration: number;
  enterX: number;
  enterY: number;
};

const SLABS: Slab[] = [
  {
    className: "left-[-18%] top-[8%] h-[38%] w-[70%]",
    gradient: `linear-gradient(135deg, ${CARNIVAL.orange} 0%, ${CARNIVAL.gold} 55%, ${CARNIVAL.magenta} 100%)`,
    rotateX: 28,
    rotateY: -42,
    rotateZ: -8,
    duration: 16,
    enterX: -120,
    enterY: -80,
  },
  {
    className: "right-[-22%] top-[18%] h-[32%] w-[65%]",
    gradient: `linear-gradient(200deg, ${CARNIVAL.cyan} 0%, ${CARNIVAL.lime} 40%, ${CARNIVAL.yellow} 100%)`,
    rotateX: 18,
    rotateY: 48,
    rotateZ: 12,
    duration: 18,
    enterX: 140,
    enterY: -60,
  },
  {
    className: "bottom-[6%] left-[-10%] h-[40%] w-[80%]",
    gradient: `linear-gradient(45deg, ${CARNIVAL.violet} 0%, ${CARNIVAL.orange} 50%, ${CARNIVAL.yellow} 100%)`,
    rotateX: -32,
    rotateY: 22,
    rotateZ: 6,
    duration: 20,
    enterX: -80,
    enterY: 120,
  },
  {
    className: "bottom-[22%] right-[-16%] h-[28%] w-[55%]",
    gradient: `linear-gradient(320deg, ${CARNIVAL.magenta} 0%, ${CARNIVAL.cyan} 100%)`,
    rotateX: -20,
    rotateY: -36,
    rotateZ: -14,
    duration: 14,
    enterX: 100,
    enterY: 90,
  },
];

/** Fake-3D tumbling panels: fly in on rails, settle, slow orbit. */
export function PerspectiveSlabsArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);
  const intensity = overview ? 1 : 0.45;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: CARNIVAL.void }}
    >
      <div
        className="absolute inset-0"
        style={{
          perspective: "900px",
          perspectiveOrigin: "50% 45%",
          opacity: overview ? 1 : 0.75,
        }}
      >
        {SLABS.map((slab, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-2xl ${slab.className}`}
            style={{
              background: slab.gradient,
              transformStyle: "preserve-3d",
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            }}
            initial={
              reduce || !overview
                ? {
                    rotateX: slab.rotateX,
                    rotateY: slab.rotateY,
                    rotateZ: slab.rotateZ,
                    x: 0,
                    y: 0,
                    opacity: intensity,
                  }
                : {
                    rotateX: slab.rotateX + 40,
                    rotateY: slab.rotateY - 30,
                    rotateZ: slab.rotateZ,
                    x: slab.enterX,
                    y: slab.enterY,
                    opacity: 0,
                  }
            }
            animate={
              reduce
                ? {
                    rotateX: slab.rotateX,
                    rotateY: slab.rotateY,
                    rotateZ: slab.rotateZ,
                    opacity: intensity,
                  }
                : overview
                  ? {
                      rotateX: [
                        slab.rotateX,
                        slab.rotateX + 10,
                        slab.rotateX - 6,
                        slab.rotateX,
                      ],
                      rotateY: [
                        slab.rotateY,
                        slab.rotateY - 12,
                        slab.rotateY + 8,
                        slab.rotateY,
                      ],
                      rotateZ: [
                        slab.rotateZ,
                        slab.rotateZ + 4,
                        slab.rotateZ - 3,
                        slab.rotateZ,
                      ],
                      x: 0,
                      y: 0,
                      opacity: 1,
                    }
                  : {
                      rotateX: slab.rotateX,
                      rotateY: slab.rotateY,
                      rotateZ: slab.rotateZ,
                      opacity: intensity,
                    }
            }
            transition={
              reduce
                ? { duration: 0 }
                : overview
                  ? {
                      opacity: { duration: 0.6, delay: i * 0.12 },
                      x: { duration: 0.9, delay: i * 0.12, ease: "easeOut" },
                      y: { duration: 0.9, delay: i * 0.12, ease: "easeOut" },
                      rotateX: {
                        duration: slab.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1 + i * 0.12,
                      },
                      rotateY: {
                        duration: slab.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1 + i * 0.12,
                      },
                      rotateZ: {
                        duration: slab.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1 + i * 0.12,
                      },
                    }
                  : { duration: 0.4 }
            }
          />
        ))}
      </div>
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
