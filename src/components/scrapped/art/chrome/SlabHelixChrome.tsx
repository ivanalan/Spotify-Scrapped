"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard } from "./carnival-palette";

const BANDS = [
  CARNIVAL.magenta,
  CARNIVAL.gold,
  CARNIVAL.cyan,
  CARNIVAL.violet,
  CARNIVAL.lime,
  CARNIVAL.orange,
] as const;

/** Vertical helix of thin perspective bands wrapping the content. */
export function SlabHelixChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: CARNIVAL.deep }}>
      <div
        className="absolute inset-0"
        style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}
      >
        {BANDS.map((color, i) => {
          const t = i / (BANDS.length - 1);
          const top = `${6 + t * 78}%`;
          const rotateY = -50 + t * 100;
          return (
            <motion.div
              key={i}
              className="absolute left-[-20%] h-[9%] w-[140%] rounded-full"
              style={{
                top,
                background: `linear-gradient(90deg, transparent 0%, ${color} 18%, ${color} 82%, transparent 100%)`,
                transformStyle: "preserve-3d",
                boxShadow: `0 8px 24px ${color}55`,
              }}
              initial={{ rotateY, rotateX: 55, rotateZ: -8 + i * 3 }}
              animate={
                reduce
                  ? { rotateY, rotateX: 55 }
                  : {
                      rotateY: [rotateY, rotateY + 25, rotateY - 15, rotateY],
                      x: [0, i % 2 === 0 ? 20 : -20, 0],
                    }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: 10 + i * 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }
              }
            />
          );
        })}
      </div>
      <ContentCard inset="15%" />
    </div>
  );
}
