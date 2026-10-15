"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard } from "./carnival-palette";

type Rail = {
  className: string;
  gradient: string;
  skewX: number;
  rotateY: number;
  rotateX: number;
  duration: number;
};

/** Thick parallelogram rails along the edges — Spotify “frame dressing” energy. */
const RAILS: Rail[] = [
  {
    className: "left-[-35%] top-[4%] h-[26%] w-[110%]",
    gradient: `linear-gradient(90deg, ${CARNIVAL.gold}, ${CARNIVAL.magenta}, ${CARNIVAL.violet})`,
    skewX: -18,
    rotateY: -28,
    rotateX: 18,
    duration: 14,
  },
  {
    className: "right-[-38%] top-[28%] h-[22%] w-[105%]",
    gradient: `linear-gradient(90deg, ${CARNIVAL.cyan}, ${CARNIVAL.yellow}, ${CARNIVAL.orange})`,
    skewX: 16,
    rotateY: 32,
    rotateX: 12,
    duration: 17,
  },
  {
    className: "left-[-30%] bottom-[18%] h-[24%] w-[115%]",
    gradient: `linear-gradient(90deg, ${CARNIVAL.violet}, ${CARNIVAL.cyan}, ${CARNIVAL.lime})`,
    skewX: -12,
    rotateY: -22,
    rotateX: -16,
    duration: 19,
  },
  {
    className: "right-[-32%] bottom-[4%] h-[20%] w-[100%]",
    gradient: `linear-gradient(90deg, ${CARNIVAL.orange}, ${CARNIVAL.magenta}, ${CARNIVAL.gold})`,
    skewX: 20,
    rotateY: 26,
    rotateX: -10,
    duration: 15,
  },
];

export function SlabRailsChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: CARNIVAL.deep }}>
      <div
        className="absolute inset-0"
        style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}
      >
        {RAILS.map((rail, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${rail.className}`}
            style={{
              background: rail.gradient,
              transformStyle: "preserve-3d",
              boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
            }}
            initial={{
              rotateX: rail.rotateX,
              rotateY: rail.rotateY,
              skewX: rail.skewX,
            }}
            animate={
              reduce
                ? {
                    rotateX: rail.rotateX,
                    rotateY: rail.rotateY,
                    skewX: rail.skewX,
                  }
                : {
                    rotateX: [
                      rail.rotateX,
                      rail.rotateX + 8,
                      rail.rotateX - 5,
                      rail.rotateX,
                    ],
                    rotateY: [
                      rail.rotateY,
                      rail.rotateY - 10,
                      rail.rotateY + 7,
                      rail.rotateY,
                    ],
                    x: [0, i % 2 === 0 ? 18 : -14, 0],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: rail.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>
      <ContentCard inset="14%" />
    </div>
  );
}
