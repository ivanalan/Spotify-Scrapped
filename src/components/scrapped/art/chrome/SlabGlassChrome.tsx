"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard } from "./carnival-palette";

const PANES = [
  {
    className: "left-[-20%] top-[-5%] h-[55%] w-[80%]",
    color: "rgba(255,77,141,0.55)",
    rotateX: 35,
    rotateY: -40,
    duration: 16,
  },
  {
    className: "right-[-25%] top-[10%] h-[50%] w-[75%]",
    color: "rgba(61,224,255,0.5)",
    rotateX: 25,
    rotateY: 45,
    duration: 18,
  },
  {
    className: "left-[-15%] bottom-[-8%] h-[48%] w-[90%]",
    color: "rgba(255,230,109,0.45)",
    rotateX: -30,
    rotateY: 25,
    duration: 20,
  },
  {
    className: "right-[-18%] bottom-[5%] h-[42%] w-[70%]",
    color: "rgba(180,77,255,0.5)",
    rotateX: -22,
    rotateY: -38,
    duration: 14,
  },
  {
    className: "left-[10%] top-[30%] h-[35%] w-[80%]",
    color: "rgba(124,255,107,0.35)",
    rotateX: 15,
    rotateY: -15,
    duration: 22,
  },
] as const;

/** Translucent overlapping slabs — depth via see-through layers. */
export function SlabGlassChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: CARNIVAL.void }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(165deg, ${CARNIVAL.purple} 0%, ${CARNIVAL.void} 55%, #0a0418 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ perspective: "900px", perspectiveOrigin: "50% 45%" }}
      >
        {PANES.map((pane, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-3xl backdrop-blur-[1px] ${pane.className}`}
            style={{
              background: pane.color,
              transformStyle: "preserve-3d",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            }}
            initial={{
              rotateX: pane.rotateX,
              rotateY: pane.rotateY,
            }}
            animate={
              reduce
                ? { rotateX: pane.rotateX, rotateY: pane.rotateY }
                : {
                    rotateX: [
                      pane.rotateX,
                      pane.rotateX + 12,
                      pane.rotateX - 8,
                      pane.rotateX,
                    ],
                    rotateY: [
                      pane.rotateY,
                      pane.rotateY - 14,
                      pane.rotateY + 10,
                      pane.rotateY,
                    ],
                    scale: [1, 1.04, 0.98, 1],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: pane.duration,
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
