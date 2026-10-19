"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  DotField,
  MotifStage,
  RadialWash,
  makeDotGrid,
} from "./ShapeKit";
import type { SlideArtProps } from "./types";
import { themeFor } from "./themes";

function orbitDots(cx: number, cy: number, r: number, n: number, size: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      r: size,
    };
  });
}

/** Direction B — Dot Orbit (mid soft). */
export function DirectionDotOrbitArt({
  slideIndex,
  pattern,
  static: freeze,
}: SlideArtProps) {
  const t = themeFor("dot-orbit", slideIndex);
  const reduce = useReducedMotion() || freeze;
  const accent2 = t.accent2 ?? t.accent;
  const motionOff = freeze ? ("none" as const) : undefined;
  const washId = useId();

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: t.bg }}>
      <MotifStage>
        {pattern === "intro" && (
          <>
            <RadialWash
              id={washId}
              cx={90}
              cy={120}
              r={220}
              from={accent2}
              to={t.bg}
              opacity={0.7}
              animate={!freeze}
            />
            <DotField
              fill={t.accent}
              animate={motionOff ?? "drift"}
              opacity={0.75}
              dots={makeDotGrid(5, 7, 40, 80, 70, 70, 6, 12)}
            />
          </>
        )}

        {pattern === "volume" && (
          <DotField
            fill={t.accent}
            animate={motionOff ?? "stagger"}
            opacity={0.8}
            dots={makeDotGrid(8, 10, 24, 160, 42, 42, 5, 8)}
          />
        )}

        {pattern === "entity" && (
          <>
            <circle
              cx={180}
              cy={290}
              r={88}
              fill="none"
              stroke={accent2}
              strokeWidth={2}
              opacity={0.5}
            />
            <motion.g
              animate={reduce ? undefined : { rotate: 360 }}
              transition={
                reduce
                  ? undefined
                  : { duration: 8, repeat: Infinity, ease: "linear" }
              }
              style={{ transformOrigin: "180px 290px" }}
            >
              <DotField
                fill={t.accent}
                animate="none"
                opacity={0.9}
                dots={orbitDots(180, 290, 118, 14, 5)}
              />
            </motion.g>
          </>
        )}

        {pattern === "list" && (
          <DotField
            fill={t.accent}
            animate={motionOff ?? "stagger"}
            opacity={0.85}
            dots={[
              { x: 28, y: 210, r: 4 },
              { x: 28, y: 270, r: 4 },
              { x: 28, y: 330, r: 4 },
              { x: 28, y: 390, r: 4 },
              { x: 28, y: 450, r: 4 },
              { x: 48, y: 210, r: 3 },
              { x: 48, y: 270, r: 3 },
              { x: 48, y: 330, r: 3 },
              { x: 48, y: 390, r: 3 },
              { x: 48, y: 450, r: 3 },
            ]}
          />
        )}

        {pattern === "reunion" && (
          <>
            <motion.g
              animate={
                reduce
                  ? undefined
                  : { x: [0, 18, 0] }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <DotField
                fill={t.accent}
                animate="none"
                dots={makeDotGrid(3, 4, 60, 240, 28, 28, 5, 4)}
              />
            </motion.g>
            <motion.g
              animate={
                reduce
                  ? undefined
                  : { x: [0, -18, 0] }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <DotField
                fill={accent2}
                animate="none"
                dots={makeDotGrid(3, 4, 220, 240, 28, 28, 5, 4)}
              />
            </motion.g>
          </>
        )}

        {pattern === "close" && (
          <DotField
            fill={t.accent}
            animate={motionOff ?? "pulse"}
            opacity={0.45}
            dots={[
              { x: 80, y: 200, r: 4 },
              { x: 280, y: 360, r: 3 },
              { x: 160, y: 480, r: 5 },
            ]}
          />
        )}

        {pattern === "share" && (
          <DotField
            fill={t.accent}
            animate="none"
            opacity={0.7}
            dots={[
              ...Array.from({ length: 12 }, (_, i) => ({
                x: 40 + i * 25,
                y: 100,
                r: 3,
              })),
              ...Array.from({ length: 12 }, (_, i) => ({
                x: 40 + i * 25,
                y: 540,
                r: 3,
              })),
              ...Array.from({ length: 16 }, (_, i) => ({
                x: 40,
                y: 120 + i * 26,
                r: 3,
              })),
              ...Array.from({ length: 16 }, (_, i) => ({
                x: 320,
                y: 120 + i * 26,
                r: 3,
              })),
            ]}
          />
        )}
      </MotifStage>
    </div>
  );
}
