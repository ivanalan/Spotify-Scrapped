"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard } from "./carnival-palette";

const CARDS = [
  {
    gradient: `linear-gradient(160deg, ${CARNIVAL.magenta} 0%, ${CARNIVAL.violet} 100%)`,
    rotateZ: -18,
    rotateY: -35,
    x: "-8%",
    y: "10%",
  },
  {
    gradient: `linear-gradient(160deg, ${CARNIVAL.gold} 0%, ${CARNIVAL.orange} 100%)`,
    rotateZ: -6,
    rotateY: -18,
    x: "-2%",
    y: "6%",
  },
  {
    gradient: `linear-gradient(160deg, ${CARNIVAL.cyan} 0%, ${CARNIVAL.lime} 100%)`,
    rotateZ: 8,
    rotateY: 20,
    x: "6%",
    y: "8%",
  },
  {
    gradient: `linear-gradient(160deg, ${CARNIVAL.violet} 0%, ${CARNIVAL.cyan} 100%)`,
    rotateZ: 16,
    rotateY: 38,
    x: "12%",
    y: "14%",
  },
] as const;

/** Fanned stack of perspective cards behind the content — deck-of-cards energy. */
export function SlabFanChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: CARNIVAL.void }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${CARNIVAL.purple}cc, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}
      >
        {CARDS.map((card, i) => (
          <motion.div
            key={i}
            className="absolute left-[12%] top-[16%] h-[58%] w-[76%] rounded-2xl"
            style={{
              background: card.gradient,
              left: `calc(12% + ${card.x})`,
              top: `calc(16% + ${card.y})`,
              transformStyle: "preserve-3d",
              boxShadow: "0 22px 48px rgba(0,0,0,0.4)",
            }}
            initial={{
              rotateZ: card.rotateZ,
              rotateY: card.rotateY,
              rotateX: 12,
            }}
            animate={
              reduce
                ? {
                    rotateZ: card.rotateZ,
                    rotateY: card.rotateY,
                    rotateX: 12,
                  }
                : {
                    rotateZ: [
                      card.rotateZ,
                      card.rotateZ + 4,
                      card.rotateZ - 3,
                      card.rotateZ,
                    ],
                    rotateY: [
                      card.rotateY,
                      card.rotateY + 6,
                      card.rotateY - 5,
                      card.rotateY,
                    ],
                    y: [0, i % 2 === 0 ? -10 : 10, 0],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: 12 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.25,
                  }
            }
          />
        ))}
      </div>
      <ContentCard inset="16%" />
    </div>
  );
}
