"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  accentsForSlide,
  INTRO_DISK_COLORS,
  INTRO_SHARED_GRADIENT,
  INTRO_STAR,
  type SlideArtPattern,
} from "@/lib/scrapped-card-palette";
import {
  ConcentricDisks,
  MotifStage,
  OceanWave,
  PointedStar,
} from "@/components/scrapped/art/storyboard/ShapeKit";
import {
  FunkyOrbRain,
  FunkyPillStack,
  FunkyShareArt,
  GradOrb,
} from "@/components/scrapped/art/storyboard/FunkyShapes";
import {
  GhostedListFrame,
  ListClouds,
  ListCornerOrb,
  ListFrame,
  ListPerimeterGhosts,
  ListSpikyGrass,
} from "@/components/scrapped/art/storyboard/PeripheralMotifs";
import { ArtistOrbitOvals } from "@/components/scrapped/orbit/ArtistOrbitOvals";
import {
  MotifCornerOrigin,
  MotifMeetStage,
  MotifPin,
  usePhoneOrbitArt,
} from "@/components/scrapped/orbit/MotifPin";

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

type ChromeProps = {
  pattern: SlideArtPattern;
  slideIndex: number;
  accent: string;
  accent2: string;
  freeze: boolean;
  play: boolean;
  replayKey: number;
  tide: "low" | "high";
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

/** Intro disks @ viewport TL center; star @ viewport BR center. */
function IntroCornerChrome({ freeze }: { freeze: boolean }) {
  return (
    <>
      <MotifCornerOrigin corner="tl" cx={0} cy={0} radius={230} size={0.85}>
        <ConcentricDisks
          cx={0}
          cy={0}
          count={6}
          startR={72}
          step={26}
          rotate={45}
          oval={{ sx: 1.08, sy: 0.94 }}
          colors={[...INTRO_DISK_COLORS]}
          sharedGradient={INTRO_SHARED_GRADIENT}
          animate={freeze ? "none" : "cascade-breathe"}
        />
      </MotifCornerOrigin>
      <MotifCornerOrigin corner="br" cx={0} cy={0} radius={110} size={1}>
        <PointedStar
          cx={0}
          cy={0}
          r={92}
          points={7}
          from={INTRO_STAR.from}
          to={INTRO_STAR.to}
          animate={freeze ? "none" : "grow-spin"}
        />
      </MotifCornerOrigin>
    </>
  );
}

function PhoneOrbitChrome({
  pattern,
  slideIndex,
  accent,
  accent2,
  freeze,
  play,
  replayKey,
  tide,
}: ChromeProps) {
  // Intro uses viewport corner pins — MotifStage slice does not pin centers.
  if (pattern === "intro") {
    return <IntroCornerChrome freeze={freeze} />;
  }

  return (
    <MotifStage>
      {pattern === "volume" && (
        <OceanWave from={accent} to={accent2} tide={tide} freeze={freeze} />
      )}

      {pattern === "entity-song" && (
        <SpiralCascadeDots
          key={play ? `spiral-${replayKey}` : "spiral-settled"}
          cx={180}
          cy={290}
          fill={accent}
          accent={accent2}
          freeze={freeze}
        />
      )}

      {pattern === "entity-artist" && <ArtistOrbitOvals freeze={freeze} />}

      {pattern === "list" && slideIndex === 3 && (
        <GhostedListFrame
          accent={accent}
          accent2={accent2}
          animate={freeze ? "none" : "soft"}
        />
      )}

      {pattern === "list" && slideIndex !== 3 && (
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
  );
}

/** Wide viewport: edge-pinned motifs (D-009). Phone path stays MotifStage. */
function WideOrbitChrome({
  pattern,
  slideIndex,
  accent,
  accent2,
  freeze,
  play,
  replayKey,
  tide,
}: ChromeProps) {
  if (pattern === "share") return null;

  if (pattern === "intro") {
    return <IntroCornerChrome freeze={freeze} />;
  }

  if (pattern === "volume") {
    return (
      <MotifPin
        anchor="bottom"
        width="100%"
        height={1}
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMax slice"
      >
        <OceanWave from={accent} to={accent2} tide={tide} freeze={freeze} />
      </MotifPin>
    );
  }

  if (pattern === "entity-song") {
    // meet (not slice) so spiral arms aren’t cover-cropped on wide screens.
    return (
      <MotifMeetStage viewBox="-40 0 440 640">
        <SpiralCascadeDots
          key={play ? `spiral-wide-${replayKey}` : "spiral-wide-settled"}
          cx={180}
          cy={290}
          fill={accent}
          accent={accent2}
          freeze={freeze}
        />
      </MotifMeetStage>
    );
  }

  if (pattern === "entity-artist") {
    // Expanded viewBox so outer orbit rx isn’t clipped mid-oval.
    return (
      <MotifMeetStage viewBox="-60 0 480 640">
        <ArtistOrbitOvals freeze={freeze} />
      </MotifMeetStage>
    );
  }

  if (pattern === "list" && slideIndex === 3) {
    return (
      <>
        <MotifPin
          anchor="top"
          width="100%"
          height={0.14}
          viewBox="0 -12 360 80"
          preserveAspectRatio="xMidYMin slice"
        >
          <ListClouds
            from={accent}
            to={accent2}
            freeze={freeze}
            durationSec={32}
            placement="sky"
          />
        </MotifPin>
        <MotifPin
          anchor="bottom"
          width="100%"
          height={0.2}
          viewBox="0 0 360 140"
          preserveAspectRatio="xMidYMax slice"
        >
          <ListSpikyGrass from={accent} to={accent2} freeze={freeze} />
        </MotifPin>
        <MotifMeetStage viewBox="0 0 360 640">
          <ListPerimeterGhosts freeze={freeze} />
        </MotifMeetStage>
      </>
    );
  }

  if (pattern === "list") {
    return (
      <>
        <MotifPin
          anchor="top"
          width="100%"
          height={0.22}
          viewBox="0 0 360 100"
          preserveAspectRatio="xMidYMin slice"
        >
          <ListClouds from={accent} to={accent2} freeze={freeze} />
        </MotifPin>
        <MotifPin
          anchor="bl"
          viewBox="0 0 240 260"
          size={0.5}
          preserveAspectRatio="xMinYMax meet"
        >
          <ListCornerOrb from={accent} to={accent2} freeze={freeze} />
        </MotifPin>
      </>
    );
  }

  if (pattern === "reunion") {
    return <WideOrbRain a={accent} b={accent2} freeze={freeze} />;
  }

  if (pattern === "close") {
    return (
      <>
        <MotifPin
          anchor="top-center"
          width={0.7}
          height={0.32}
          viewBox="0 0 360 220"
          preserveAspectRatio="xMidYMin meet"
        >
          <FunkyPillStack a={accent} b={accent2} freeze={freeze} />
        </MotifPin>
        <MotifPin
          anchor="bottom-center"
          width={0.7}
          height={0.32}
          viewBox="0 0 360 220"
          preserveAspectRatio="xMidYMax meet"
        >
          <g transform="translate(0 220) scale(1 -1)">
            <FunkyPillStack a={accent} b={accent2} freeze={freeze} />
          </g>
        </MotifPin>
      </>
    );
  }

  return null;
}

const WIDE_RAIN = [
  {
    anchor: "tl" as const,
    viewBox: "0 40 120 160",
    size: 0.28,
    cx: 50,
    cy: 120,
    r: 28,
    t: "skewX(-20) scale(1.2 0.75)",
    d: 0,
  },
  {
    anchor: "tr" as const,
    viewBox: "250 20 120 160",
    size: 0.3,
    cx: 310,
    cy: 90,
    r: 36,
    t: "skewX(18) scale(0.9 1.15)",
    d: 0.12,
  },
  {
    anchor: "bl" as const,
    viewBox: "-20 420 140 160",
    size: 0.36,
    cx: 40,
    cy: 500,
    r: 48,
    t: "skewX(-12) scale(1.1 0.85)",
    d: 0.2,
  },
  {
    anchor: "br" as const,
    viewBox: "240 470 120 140",
    size: 0.3,
    cx: 300,
    cy: 540,
    r: 32,
    t: "rotate(15) scale(1.15 0.8)",
    d: 0.28,
  },
];

function WideOrbRain({
  a,
  b,
  freeze,
}: {
  a: string;
  b: string;
  freeze: boolean;
}) {
  return (
    <>
      {WIDE_RAIN.map((it, i) => (
        <MotifPin
          key={i}
          anchor={it.anchor}
          viewBox={it.viewBox}
          size={it.size}
          preserveAspectRatio={
            it.anchor.includes("l") ? "xMinYMid meet" : "xMaxYMid meet"
          }
        >
          <motion.g
            initial={freeze ? false : { opacity: 0, scale: 0.6 }}
            animate={
              freeze
                ? undefined
                : {
                    opacity: 1,
                    scale: 1,
                    y: [0, i % 2 === 0 ? -5 : 4, 0],
                  }
            }
            transition={{
              opacity: { duration: 0.55, delay: it.d },
              scale: { duration: 0.55, delay: it.d },
              y: {
                duration: 9 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1 + it.d,
              },
            }}
            style={{ transformOrigin: `${it.cx}px ${it.cy}px` }}
          >
            <GradOrb
              cx={it.cx}
              cy={it.cy}
              r={it.r}
              from={a}
              to={b}
              transform={it.t}
            />
          </motion.g>
        </MotifPin>
      ))}
    </>
  );
}

/**
 * Production Orbit Cascade chrome for the API deck (D-007 / D-009).
 * Canvas color comes from `data-wrapped-tone` on the slide — this layer is motifs only.
 * Phone: legacy MotifStage slice. Wide: corner-pinned layers.
 */
export function ScrappedOrbitArt({
  slideIndex,
  pattern,
  active = true,
  replayKey = 0,
  tide = "low",
}: Props) {
  const { accent, accent2 } = accentsForSlide(slideIndex);
  const reduceMotion = useReducedMotion();
  const play = Boolean(active && !reduceMotion);
  const freeze = !play;
  const phone = usePhoneOrbitArt();

  const chrome: ChromeProps = {
    pattern,
    slideIndex,
    accent,
    accent2,
    freeze,
    play,
    replayKey,
    tide,
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
    >
      {phone ? (
        <PhoneOrbitChrome {...chrome} />
      ) : (
        <WideOrbitChrome {...chrome} />
      )}
    </div>
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
