"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ConcentricDisks,
  ConcentricGradientDisks,
  MotifStage,
  OceanWave,
  ovalRx,
  ovalRy,
} from "./ShapeKit";
import {
  FunkyOrbRain,
  FunkyShareArt,
  GradOrb,
  type FunkyShareKind,
} from "./FunkyShapes";
import { ListFrame } from "./PeripheralMotifs";
import {
  EMBER_FIELD_GRADIENT,
  INTRO_DISK_COLORS,
} from "@/lib/scrapped-card-palette";
import { SLIDE_SPECS } from "./orbitCascade";
import type { SlideArtProps } from "./types";

export type OrbitCascadeArtProps = SlideArtProps & {
  shareKind?: FunkyShareKind;
  /** Shortlist palette override for 07/09 funky art. */
  funkyPalette?: { a: string; b: string; bg?: string };
  /** Opening-trio / intro-scheme override (bg + accents + disk ladder). */
  paletteOverride?: {
    bg?: string;
    accent?: string;
    accent2?: string;
    diskColors?: string[];
  };
  /** Volume ocean tide (storyboard preview). */
  tide?: "low" | "high";
};

/** Perimeter-biased spiral — clear mid hole for copy / cover. */
function spiralOrbs(
  cx: number,
  cy: number,
  n: number,
  turns = 2.85,
  r0 = 168,
  r1 = 305,
) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(n - 1, 1);
    const a = t * Math.PI * 2 * turns - Math.PI * 0.65;
    const orbitR = r0 + (r1 - r0) * t;
    const rx = orbitR * 1.12;
    const ry = orbitR * 0.92;
    return {
      x: cx + Math.cos(a) * rx,
      y: cy + Math.sin(a) * ry,
      r: 5.5 + (i % 5) * 1.4 + t * 2,
      delay: t * 2.4,
      skew:
        i % 2 === 0
          ? "skewX(-10) scale(1.08 0.9)"
          : "skewX(8) scale(1.04 0.94)",
    };
  });
}

/** Single solidified direction — Orbit Cascade. */
export function OrbitCascadeArt({
  slideIndex,
  pattern,
  static: freeze,
  shareKind = "double-stack",
  funkyPalette,
  paletteOverride,
  tide = "low",
}: OrbitCascadeArtProps) {
  const base = SLIDE_SPECS[slideIndex] ?? SLIDE_SPECS[0];
  const spec = {
    ...base,
    bg: paletteOverride?.bg ?? base.bg,
    accent: paletteOverride?.accent ?? base.accent,
    accent2: paletteOverride?.accent2 ?? base.accent2,
  };
  const reduce = useReducedMotion() || freeze;
  const motionOff = freeze ? ("none" as const) : undefined;
  const funkyA = funkyPalette?.a ?? spec.accent;
  const funkyB = funkyPalette?.b ?? spec.accent2;
  const canvas =
    (pattern === "close" || pattern === "reunion") && funkyPalette?.bg
      ? funkyPalette.bg
      : pattern === "volume"
        ? EMBER_FIELD_GRADIENT
        : spec.bg;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: canvas }}
    >
      <MotifStage>
        {pattern === "intro" && (
          <ConcentricDisks
            cx={-10}
            cy={-20}
            count={6}
            startR={55}
            step={44}
            rotate={45}
            oval={{ sx: 1.08, sy: 0.94 }}
            colors={
              paletteOverride?.diskColors ?? [...INTRO_DISK_COLORS]
            }
            animate={freeze || reduce ? "none" : "cascade-breathe"}
          />
        )}

        {pattern === "volume" && (
          <OceanWave
            from={spec.accent}
            to={spec.accent2}
            tide={tide}
            freeze={!!freeze || !!reduce}
          />
        )}

        {pattern === "entity" && slideIndex === 2 && (
          <SpiralCascadeDots
            cx={180}
            cy={290}
            fill={spec.accent}
            accent={spec.accent2}
            freeze={!!reduce}
          />
        )}

        {pattern === "entity" && slideIndex === 5 && (
          <motion.g
            animate={reduce ? undefined : { rotate: [0, 1.8, 0, -1.5, 0] }}
            transition={
              reduce
                ? undefined
                : { duration: 14, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ transformOrigin: "180px 300px" }}
          >
            <RadialGlow
              cx={180}
              cy={300}
              r={240}
              from={spec.accent}
              to={spec.bg}
            />
            <ConcentricGradientDisks
              cx={180}
              cy={300}
              count={5}
              startR={70}
              step={34}
              from={spec.accent}
              to={spec.accent2}
              animate={motionOff ?? "cascade-soft"}
            />
          </motion.g>
        )}

        {pattern === "list" && (
          <ListFrame
            accent={spec.accent}
            accent2={spec.accent2}
            animate={freeze || reduce ? "none" : "soft"}
          />
        )}

        {pattern === "reunion" && (
          <FunkyOrbRain a={funkyA} b={funkyB} freeze={!!reduce} />
        )}

        {pattern === "close" && (
          <FunkyShareArt
            kind={shareKind}
            a={funkyA}
            b={funkyB}
            freeze={!!reduce}
          />
        )}

        {/* 09 share — blank canvas; card only */}
      </MotifStage>
    </div>
  );
}

function RadialGlow({
  cx,
  cy,
  r,
  from,
  to,
}: {
  cx: number;
  cy: number;
  r: number;
  from: string;
  to: string;
}) {
  const id = useId();
  return (
    <g opacity={0.5}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={from} stopOpacity={0.65} />
          <stop offset="75%" stopColor={to} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={ovalRx(r)}
        ry={ovalRy(r)}
        fill={`url(#${id})`}
      />
    </g>
  );
}

/** Slide 2 — perimeter spiral orbs; spiral-in, then drift. */
function SpiralCascadeDots({
  cx,
  cy,
  fill,
  accent,
  freeze,
}: {
  cx: number;
  cy: number;
  fill: string;
  accent: string;
  freeze: boolean;
}) {
  const orbs = spiralOrbs(cx, cy, 32);

  return (
    <motion.g
      animate={
        freeze
          ? undefined
          : { x: [0, 5, 0, -4, 0], y: [0, -3, 0, 3, 0] }
      }
      transition={
        freeze
          ? undefined
          : { duration: 18, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {orbs.map((d, i) => {
        const from = i % 2 === 0 ? fill : accent;
        const to = i % 2 === 0 ? accent : fill;
        return (
          <motion.g
            key={i}
            initial={freeze ? false : { scale: 0.55, opacity: 0 }}
            animate={freeze ? undefined : { scale: 1, opacity: 0.92 }}
            transition={{
              duration: 1.35,
              delay: d.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: `${d.x}px ${d.y}px` }}
          >
            <motion.g
              animate={
                freeze
                  ? undefined
                  : {
                      x: [0, i % 2 === 0 ? 4 : -3, 0],
                      y: [0, i % 3 === 0 ? -4 : 3, 0],
                    }
              }
              transition={
                freeze
                  ? undefined
                  : {
                      duration: 14 + (i % 4),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2.8 + d.delay,
                    }
              }
            >
              <GradOrb
                cx={d.x}
                cy={d.y}
                r={d.r}
                from={from}
                to={to}
                transform={d.skew}
              />
            </motion.g>
          </motion.g>
        );
      })}
    </motion.g>
  );
}
