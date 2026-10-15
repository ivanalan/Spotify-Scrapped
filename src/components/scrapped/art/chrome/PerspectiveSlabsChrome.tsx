"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard } from "./carnival-palette";

type Slab = {
  className: string;
  gradient: string;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  duration: number;
};

const SLABS: Slab[] = [
  {
    className: "left-[-18%] top-[8%] h-[38%] w-[70%]",
    gradient: `linear-gradient(135deg, ${CARNIVAL.magenta} 0%, ${CARNIVAL.gold} 55%, ${CARNIVAL.violet} 100%)`,
    rotateX: 28,
    rotateY: -42,
    rotateZ: -8,
    duration: 16,
  },
  {
    className: "right-[-22%] top-[18%] h-[32%] w-[65%]",
    gradient: `linear-gradient(200deg, ${CARNIVAL.cyan} 0%, ${CARNIVAL.lime} 40%, ${CARNIVAL.yellow} 100%)`,
    rotateX: 18,
    rotateY: 48,
    rotateZ: 12,
    duration: 18,
  },
  {
    className: "bottom-[6%] left-[-10%] h-[40%] w-[80%]",
    gradient: `linear-gradient(45deg, ${CARNIVAL.violet} 0%, ${CARNIVAL.orange} 50%, ${CARNIVAL.yellow} 100%)`,
    rotateX: -32,
    rotateY: 22,
    rotateZ: 6,
    duration: 20,
  },
  {
    className: "bottom-[22%] right-[-16%] h-[28%] w-[55%]",
    gradient: `linear-gradient(320deg, ${CARNIVAL.magenta} 0%, ${CARNIVAL.cyan} 100%)`,
    rotateX: -20,
    rotateY: -36,
    rotateZ: -14,
    duration: 14,
  },
];

/** CSS perspective gradient panels — original orbiting slabs. */
export function PerspectiveSlabsChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: CARNIVAL.void }}>
      <div
        className="absolute inset-0"
        style={{
          perspective: "900px",
          perspectiveOrigin: "50% 45%",
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
            initial={{
              rotateX: slab.rotateX,
              rotateY: slab.rotateY,
              rotateZ: slab.rotateZ,
            }}
            animate={
              reduce
                ? {
                    rotateX: slab.rotateX,
                    rotateY: slab.rotateY,
                    rotateZ: slab.rotateZ,
                  }
                : {
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
                    y: [0, i % 2 === 0 ? 12 : -10, 0],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: slab.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>
      <ContentCard inset="13%" />
    </div>
  );
}
