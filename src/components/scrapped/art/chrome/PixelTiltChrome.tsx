"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard, PIXEL_COLORS } from "./carnival-palette";

/** Pixel stairs with perspective tilt — bridge between your two favorites. */
export function PixelTiltChrome() {
  const reduce = useReducedMotion();
  const size = 24;
  const stairs: { side: "L" | "R"; steps: number; top: number }[] = [
    { side: "L", steps: 6, top: 40 },
    { side: "R", steps: 5, top: 80 },
    { side: "L", steps: 7, top: 320 },
    { side: "R", steps: 6, top: 400 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: CARNIVAL.deep }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${CARNIVAL.magenta}22, transparent 65%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}
      >
        {stairs.map((row, ri) => (
          <motion.div
            key={ri}
            className="absolute flex"
            style={{
              top: row.top,
              left: row.side === "L" ? 0 : undefined,
              right: row.side === "R" ? 0 : undefined,
              flexDirection: row.side === "L" ? "row" : "row-reverse",
              transformStyle: "preserve-3d",
            }}
            initial={{
              rotateY: row.side === "L" ? 42 : -42,
              rotateX: 18,
            }}
            animate={
              reduce
                ? {
                    rotateY: row.side === "L" ? 42 : -42,
                    rotateX: 18,
                  }
                : {
                    rotateY: [
                      row.side === "L" ? 42 : -42,
                      row.side === "L" ? 52 : -52,
                      row.side === "L" ? 36 : -36,
                      row.side === "L" ? 42 : -42,
                    ],
                    y: [0, ri % 2 === 0 ? 8 : -8, 0],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: 12 + ri,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            {Array.from({ length: row.steps }, (_, i) => (
              <div
                key={i}
                style={{
                  width: size,
                  height: size,
                  marginTop: i * (size * 0.35),
                  background: PIXEL_COLORS[(ri + i) % PIXEL_COLORS.length],
                  boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
                }}
              />
            ))}
          </motion.div>
        ))}
      </div>
      <ContentCard inset="14%" />
    </div>
  );
}
