"use client";

import { motion, useReducedMotion } from "motion/react";
import { MotifStage, QuarterDisk } from "./ShapeKit";
import type { SlideArtProps } from "./types";
import { themeFor } from "./themes";

/** Direction C: Quarter Construct (light conversational). */
export function DirectionQuarterArt({
  slideIndex,
  pattern,
  static: freeze,
}: SlideArtProps) {
  const t = themeFor("quarter-construct", slideIndex);
  const reduce = useReducedMotion() || freeze;
  const accent2 = t.accent2 ?? t.accent;
  const motionOff = freeze ? ("none" as const) : undefined;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: t.bg }}>
      <MotifStage>
        {pattern === "intro" && (
          <>
            <QuarterDisk
              cx={0}
              cy={0}
              r={160}
              corner="br"
              fill={t.accent}
              animate={motionOff ?? "wipe"}
            />
            <QuarterDisk
              cx={360}
              cy={640}
              r={140}
              corner="tl"
              fill={accent2}
              animate={motionOff ?? "wipe"}
              delay={0.15}
            />
          </>
        )}

        {pattern === "volume" && (
          <QuarterDisk
            cx={40}
            cy={280}
            r={220}
            corner="br"
            fill={t.accent}
            animate={motionOff ?? "wipe"}
          />
        )}

        {pattern === "entity" && (
          <>
            <QuarterDisk
              cx={70}
              cy={260}
              r={100}
              corner="br"
              fill={t.accent}
              animate={motionOff ?? "rotate-in"}
            />
            <QuarterDisk
              cx={290}
              cy={420}
              r={80}
              corner="tl"
              fill={accent2}
              animate={motionOff ?? "rotate-in"}
              delay={0.12}
            />
          </>
        )}

        {pattern === "list" && (
          <>
            {[210, 270, 330, 390, 450].map((y, i) => (
              <QuarterDisk
                key={y}
                cx={28}
                cy={y}
                r={14}
                corner="br"
                fill={i % 2 === 0 ? t.accent : accent2}
                animate={motionOff ?? "wipe"}
                delay={i * 0.08}
              />
            ))}
          </>
        )}

        {pattern === "reunion" && (
          <motion.g
            animate={
              reduce
                ? undefined
                : { rotate: [0, 4, 0, -3, 0] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 7, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ transformOrigin: "180px 320px" }}
          >
            <QuarterDisk
              cx={180}
              cy={320}
              r={120}
              corner="tl"
              fill={t.accent}
              animate="none"
            />
            <QuarterDisk
              cx={180}
              cy={320}
              r={120}
              corner="br"
              fill={accent2}
              animate="none"
            />
          </motion.g>
        )}

        {pattern === "close" && (
          <QuarterDisk
            cx={360}
            cy={0}
            r={100}
            corner="bl"
            fill={t.accent}
            animate="none"
          />
        )}

        {pattern === "share" && (
          <QuarterDisk
            cx={300}
            cy={160}
            r={56}
            corner="bl"
            fill={t.accent}
            animate="none"
          />
        )}
      </MotifStage>
    </div>
  );
}
