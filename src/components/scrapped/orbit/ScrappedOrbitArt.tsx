"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  accentsForSlide,
  cardForSlide,
  INTRO_DISK_COLORS,
  type SlideArtPattern,
} from "@/lib/scrapped-card-palette";
import {
  ConcentricDisks,
  ConcentricGradientDisks,
  MotifStage,
  OceanWave,
  ovalRx,
  ovalRy,
} from "@/components/scrapped/art/storyboard/ShapeKit";
import {
  FunkyOrbRain,
  FunkyShareArt,
  GradOrb,
} from "@/components/scrapped/art/storyboard/FunkyShapes";
import { ListFrame } from "@/components/scrapped/art/storyboard/PeripheralMotifs";

type Props = {
  slideIndex: number;
  pattern: SlideArtPattern;
  /** When false / reduced-motion, art settles static. */
  active?: boolean;
  /**
   * Bumps when the scene is (re)visited so enter motion remounts.
   * Required for spiral-in — chrome stays mounted in the snap scroller.
   */
  replayKey?: number;
  /**
   * Volume ocean: low under the liked-pile beat; high when the
   * “joined this year” narrative beat lands.
   */
  tide?: "low" | "high";
};

/**
 * Perimeter-biased spiral (viewBox 360×640).
 * Inner hole stays clear for copy / cover; outer ring hugs the edges.
 */
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
    // Slightly oval so the spiral fills the portrait frame edges.
    const orbitR = r0 + (r1 - r0) * t;
    const rx = orbitR * 1.12;
    const ry = orbitR * 0.92;
    return {
      x: cx + Math.cos(a) * rx,
      y: cy + Math.sin(a) * ry,
      r: 5.5 + (i % 5) * 1.4 + t * 2,
      // Spiral order: slow cascade along the arm (no travel).
      delay: t * 2.4,
      skew:
        i % 2 === 0
          ? "skewX(-10) scale(1.08 0.9)"
          : "skewX(8) scale(1.04 0.94)",
    };
  });
}

/**
 * Production Orbit Cascade chrome for the API deck (D-007).
 * Canvas color comes from `data-wrapped-tone` on the slide — this layer is motifs only.
 */
export function ScrappedOrbitArt({
  slideIndex,
  pattern,
  active = true,
  replayKey = 0,
  tide = "low",
}: Props) {
  const card = cardForSlide(slideIndex);
  const { accent, accent2 } = accentsForSlide(slideIndex);
  const reduceMotion = useReducedMotion();
  const play = Boolean(active && !reduceMotion);
  const freeze = !play;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
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
            colors={[...INTRO_DISK_COLORS]}
            animate={freeze ? "none" : "cascade-breathe"}
          />
        )}

        {pattern === "volume" && (
          <OceanWave
            from={accent}
            to={accent2}
            tide={tide}
            freeze={freeze}
          />
        )}

        {pattern === "entity-song" && (
          <SpiralCascadeDots
            // Remount on visit — otherwise freeze→play never re-runs initial.
            key={play ? `spiral-${replayKey}` : "spiral-settled"}
            cx={180}
            cy={290}
            fill={accent}
            accent={accent2}
            freeze={freeze}
          />
        )}

        {pattern === "entity-artist" && (
          <motion.g
            animate={freeze ? undefined : { rotate: [0, 1.8, 0, -1.5, 0] }}
            transition={
              freeze
                ? undefined
                : { duration: 14, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ transformOrigin: "180px 300px" }}
          >
            <RadialGlow
              cx={180}
              cy={300}
              r={240}
              from={accent}
              to={card.bg}
            />
            <ConcentricGradientDisks
              cx={180}
              cy={300}
              count={5}
              startR={70}
              step={34}
              from={accent}
              to={accent2}
              animate={freeze ? "none" : "cascade-soft"}
            />
          </motion.g>
        )}

        {pattern === "list" && (
          <ListFrame
            accent={accent}
            accent2={accent2}
            animate={freeze ? "none" : "soft"}
          />
        )}

        {pattern === "reunion" && (
          <FunkyOrbRain a={accent} b={accent2} freeze={freeze} />
        )}

        {pattern === "close" && (
          <FunkyShareArt
            kind="double-stack"
            a={accent}
            b={accent2}
            freeze={freeze}
          />
        )}

        {/* share — blank; field only */}
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
        freeze ? undefined : { x: [0, 5, 0, -4, 0], y: [0, -3, 0, 3, 0] }
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
