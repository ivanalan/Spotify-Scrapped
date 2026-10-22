"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArcStroke,
  CascadeRings,
  DotField,
  MotifStage,
  QuarterDisk,
  SemiDisk,
} from "./ShapeKit";
import type { SlideArtProps } from "./types";
import { themeFor } from "./themes";

/** Direction A: Cascade Rings (dark carnival). */
export function DirectionCascadeArt({
  slideIndex,
  pattern,
  static: freeze,
}: SlideArtProps) {
  const t = themeFor("cascade-rings", slideIndex);
  const reduce = useReducedMotion() || freeze;
  const accent2 = t.accent2 ?? t.accent;
  const motionOff = freeze ? ("none" as const) : undefined;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: t.bg }}>
      <MotifStage>
        {pattern === "intro" && (
          <>
            <CascadeRings
              cx={-20}
              cy={-10}
              count={6}
              startR={70}
              step={42}
              stroke={t.accent}
              strokeWidth={22}
              animate={motionOff ?? "cascade"}
            />
            <CascadeRings
              cx={-20}
              cy={-10}
              count={6}
              startR={70}
              step={42}
              stroke={accent2}
              strokeWidth={8}
              animate={motionOff ?? "hue-idle"}
              delayBase={0.8}
            />
          </>
        )}

        {pattern === "volume" && (
          <SemiDisk
            cx={180}
            cy={720}
            r={320}
            face="up"
            fill={t.accent}
            animate={motionOff ?? "breathe"}
          />
        )}

        {pattern === "entity" && (
          <motion.g
            animate={
              reduce
                ? undefined
                : { rotate: [0, 2.5, 0, -2, 0] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 12, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ transformOrigin: "180px 300px" }}
          >
            <CascadeRings
              cx={180}
              cy={300}
              count={4}
              startR={90}
              step={38}
              stroke={t.accent}
              strokeWidth={16}
              animate={motionOff ?? "cascade"}
            />
            <QuarterDisk
              cx={180}
              cy={300}
              r={70}
              corner="tl"
              fill={accent2}
              animate="none"
            />
            <QuarterDisk
              cx={180}
              cy={300}
              r={70}
              corner="br"
              fill={t.accent}
              animate="none"
            />
          </motion.g>
        )}

        {pattern === "list" && (
          <>
            <ArcStroke
              cx={180}
              cy={80}
              r={200}
              startDeg={200}
              endDeg={340}
              stroke={t.accent}
              strokeWidth={12}
              animate={motionOff ?? "draw"}
            />
            <DotField
              fill={accent2}
              animate={motionOff ?? "pulse"}
              opacity={0.9}
              dots={[
                { x: 36, y: 220, r: 5 },
                { x: 36, y: 280, r: 5 },
                { x: 36, y: 340, r: 5 },
                { x: 36, y: 400, r: 5 },
                { x: 36, y: 460, r: 5 },
              ]}
            />
          </>
        )}

        {pattern === "reunion" && (
          <>
            <ArcStroke
              cx={140}
              cy={320}
              r={110}
              startDeg={40}
              endDeg={250}
              stroke={t.accent}
              strokeWidth={14}
              animate={motionOff ?? "draw"}
            />
            <ArcStroke
              cx={220}
              cy={320}
              r={110}
              startDeg={220}
              endDeg={430}
              stroke={accent2}
              strokeWidth={14}
              animate={motionOff ?? "draw"}
            />
          </>
        )}

        {pattern === "close" && (
          <CascadeRings
            cx={180}
            cy={300}
            count={1}
            startR={160}
            step={0}
            stroke={t.accent}
            strokeWidth={10}
            animate={motionOff ?? "hue-idle"}
          />
        )}

        {pattern === "share" && (
          <>
            <QuarterDisk
              cx={180}
              cy={200}
              r={140}
              corner="tl"
              fill={t.accent}
              animate="none"
            />
            <QuarterDisk
              cx={180}
              cy={200}
              r={140}
              corner="tr"
              fill={accent2}
              animate="none"
            />
            <QuarterDisk
              cx={180}
              cy={200}
              r={140}
              corner="bl"
              fill={accent2}
              animate="none"
            />
            <QuarterDisk
              cx={180}
              cy={200}
              r={140}
              corner="br"
              fill={t.accent}
              animate="none"
            />
            {!reduce && (
              <motion.circle
                cx={180}
                cy={200}
                r={28}
                fill="#f5f5f5"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </>
        )}
      </MotifStage>
    </div>
  );
}
