"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard } from "./carnival-palette";

const RINGS = [
  {
    inset: "2%",
    gradient: `linear-gradient(135deg, ${CARNIVAL.magenta}, ${CARNIVAL.gold}, ${CARNIVAL.cyan})`,
    duration: 22,
  },
  {
    inset: "7%",
    gradient: `linear-gradient(225deg, ${CARNIVAL.violet}, ${CARNIVAL.orange})`,
    duration: 18,
  },
  {
    inset: "12%",
    gradient: `linear-gradient(45deg, ${CARNIVAL.cyan}, ${CARNIVAL.lime}, ${CARNIVAL.yellow})`,
    duration: 15,
  },
] as const;

/** Nested perspective frames receding toward the content card. */
export function SlabTunnelChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: CARNIVAL.void }}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1100px", perspectiveOrigin: "50% 48%" }}
      >
        {RINGS.map((ring, i) => (
          <motion.div
            key={i}
            className="absolute rounded-3xl"
            style={{
              inset: ring.inset,
              background: ring.gradient,
              transformStyle: "preserve-3d",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
            initial={{ rotateX: 8 + i * 4, rotateY: -10 + i * 6, z: -40 * i }}
            animate={
              reduce
                ? { rotateX: 8 + i * 4, rotateY: -10 + i * 6 }
                : {
                    rotateX: [8 + i * 4, 14 + i * 3, 4 + i * 2, 8 + i * 4],
                    rotateY: [-10 + i * 6, 8 - i * 2, -16 + i * 4, -10 + i * 6],
                    z: [-40 * i, -28 * i, -48 * i, -40 * i],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: ring.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }
            }
          />
        ))}
      </div>
      <ContentCard inset="18%" />
    </div>
  );
}
