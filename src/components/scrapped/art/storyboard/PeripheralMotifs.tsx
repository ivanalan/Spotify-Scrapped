"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GHOSTED_LIST_CLOUDS } from "@/lib/scrapped-card-palette";
import { ovalRx, ovalRy } from "./ShapeKit";

type MotifProps = {
  accent: string;
  accent2: string;
  animate?: "soft" | "none";
};

/**
 * Classic list peripheral art (1-like / left-on-read lists):
 * - Top: seamless marquee clouds
 * - Bottom-left: gradient orb
 */
export function ListFrame({ accent, accent2, animate = "soft" }: MotifProps) {
  const reduce = useReducedMotion();
  const freeze = reduce || animate === "none";

  return (
    <g>
      <ListClouds from={accent} to={accent2} freeze={freeze} />
      <g transform="translate(-40, 480)">
        <ListCornerOrb from={accent} to={accent2} freeze={freeze} />
      </g>
    </g>
  );
}

/**
 * Ghosted songs list (slide 3) — TR moon · enter-then-float ghosts.
 * No grass/clouds/stars (stars live on the entity). Locked: D-018 (C8).
 * Ghost fade starts on the list beat (“Your ghosted songs”), not scene enter.
 */
export function GhostedListFrame({
  accent,
  accent2,
  animate = "soft",
  /** When false, edge ghosts stay hidden (setup beat). */
  ghostsEnter = true,
}: MotifProps & { ghostsEnter?: boolean }) {
  const reduce = useReducedMotion();
  const freeze = reduce || animate === "none";

  return (
    <g>
      <GhostedHardMoon
        accent={accent}
        accent2={accent2}
        freeze={freeze}
      />
      <RisingColumnGhosts freeze={freeze} enter={ghostsEnter} />
    </g>
  );
}

/** Top drift clouds — exported for wide MotifPin (D-009). */
export function ListClouds({
  from,
  to,
  freeze,
  durationSec = 32,
  /** `sky` = smaller / higher (above list headlines). */
  placement = "default",
}: {
  from: string;
  to: string;
  freeze: boolean;
  durationSec?: number;
  placement?: "default" | "sky";
}) {
  return (
    <MarqueeClouds
      from={from}
      to={to}
      freeze={freeze}
      durationSec={durationSec}
      placement={placement}
    />
  );
}

/** BL corner orb — exported for wide MotifPin (D-009). */
export function ListCornerOrb({
  from,
  to,
  freeze,
}: {
  from: string;
  to: string;
  freeze: boolean;
}) {
  return <SimpleOrb from={from} to={to} freeze={freeze} />;
}

/** Bottom spiky grass — wide MotifPin export. */
export function ListSpikyGrass({
  from,
  to,
  freeze,
}: {
  from: string;
  to: string;
  freeze: boolean;
}) {
  return <SpikyGrass from={from} to={to} freeze={freeze} />;
}

/** Edge ghosts — phone MotifStage / wide meet stage (D-018). */
export function ListPerimeterGhosts({
  freeze,
  enter = true,
}: {
  freeze: boolean;
  enter?: boolean;
}) {
  return <RisingColumnGhosts freeze={freeze} enter={enter} />;
}

/**
 * Most-ghosted-song entity (slide 2) — ground first (D-018).
 * Ink field: ridge grass · S9 4-point glow stars · one haunt on cover TL.
 * No moon (list owns the sky).
 */
export function GhostedNightEntity({
  accent,
  accent2,
  freeze,
}: {
  accent: string;
  accent2: string;
  freeze: boolean;
}) {
  return (
    <g>
      <PointGlowStars freeze={freeze} />
      {/* Haunt — same former TR inset, mirrored to cover TL */}
      <BlobGhost
        x={51}
        y={149}
        size={77}
        opacity={0.74}
        freeze={freeze}
        delay={HAUNT_ENTER_DELAY}
      />
      <g transform="translate(0 500)">
        <SpikyGrass from={accent} to={accent2} freeze={freeze} />
      </g>
    </g>
  );
}

/** List moon — silver→ember, TR corner + lilac underglow (D-018). */
export function GhostedHardMoon({
  accent: _accent,
  accent2,
  freeze,
}: {
  /** Kept for call-site parity with other motifs (halo removed). */
  accent: string;
  accent2: string;
  freeze: boolean;
}) {
  const moonGrad = useId();
  const glowGrad = useId();
  const glowBlur = useId();
  // Harder TR corner (lab) — deck still uses ink scrim + solid pills (C8).
  const cx = 336;
  const cy = 104;
  const r = 62;
  const op = 0.8;
  void _accent;

  return (
    <g>
      <defs>
        <radialGradient id={moonGrad} cx="34%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e8e4f0" />
          <stop offset="70%" stopColor="#C9A0F5" />
          <stop offset="100%" stopColor={accent2} />
        </radialGradient>
        <radialGradient id={glowGrad} cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#C9A0F5" stopOpacity={0.55} />
          <stop offset="40%" stopColor={accent2} stopOpacity={0.32} />
          <stop offset="100%" stopColor={accent2} stopOpacity={0} />
        </radialGradient>
        <filter
          id={glowBlur}
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <motion.g
        initial={freeze ? false : { scale: 0.28, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          freeze
            ? undefined
            : {
                duration: 1.25,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.06,
              }
        }
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* Soft underglow — heart-scene grammar (scene 4) */}
        <ellipse
          cx={cx}
          cy={cy + r * 0.22}
          rx={r * 1.55}
          ry={r * 0.72}
          fill={`url(#${glowGrad})`}
          filter={`url(#${glowBlur})`}
          opacity={0.7}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill={`url(#${moonGrad})`}
          opacity={op}
          animate={
            freeze
              ? undefined
              : { opacity: [op * 0.92, op, op * 0.92] }
          }
          transition={
            freeze
              ? undefined
              : {
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.1,
                }
          }
        />
      </motion.g>
    </g>
  );
}

/** S9 — 4-point stars on entity night only (D-018). */
export function PointGlowStars({
  freeze,
}: {
  freeze: boolean;
}) {
  return (
    <g>
      {STAR_SLOTS_ENTITY.map((s, i) => (
        <PointGlowStar
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r * STAR_SIZE_SCALE}
          freeze={freeze}
          delay={0.12 + i * 0.18}
          duration={3.8 + i * 0.2}
        />
      ))}
    </g>
  );
}

/**
 * Star slots must clear the haunt AABB — never spawn under a ghost body
 * (stars paint behind ghosts; a tip peeking through reads as a bug).
 * Pad ≈ ghost size/2 + 18 for bob amp. Haunt rest: 51,149 · size 77 (TL).
 */
/** Story 2 entity night — 5 stars. */
const STAR_SLOTS_ENTITY = [
  { cx: 200, cy: 120, r: 3.8 },
  { cx: 300, cy: 156, r: 5 },
  { cx: 248, cy: 220, r: 3.6 },
  { cx: 36, cy: 456, r: 4.1 },
  { cx: 312, cy: 428, r: 4.8 },
] as const;

const STAR_OP_MIN = 0.11;
const STAR_OP_MAX = 0.58;
const STAR_GLOW = 0.28;
const STAR_SIZE_SCALE = 1.05;
const STAR_GROW_DUR = 0.75;
/** Pulse starts mid grow-in so enter + idle blend (intro disk grammar). */
const STAR_PULSE_BLEND = 0.55;

/** 4-point star path centered at origin, tip radius r. */
function pointStarPath(r: number) {
  const tips: [number, number][] = [
    [0, -r],
    [r * 0.24, -r * 0.24],
    [r, 0],
    [r * 0.24, r * 0.24],
    [0, r],
    [-r * 0.24, r * 0.24],
    [-r, 0],
    [-r * 0.24, -r * 0.24],
  ];
  return `${tips.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ")} Z`;
}

function PointGlowStar({
  cx,
  cy,
  r,
  freeze,
  delay,
  duration,
}: {
  cx: number;
  cy: number;
  r: number;
  freeze: boolean;
  delay: number;
  duration: number;
}) {
  const d = pointStarPath(r);
  const settledOp = (STAR_OP_MIN + STAR_OP_MAX) / 2;
  // Keep SVG translate on a static parent — motion scale must not fight it.
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <motion.g
        initial={freeze ? false : { scale: 0, opacity: 0 }}
        animate={
          freeze
            ? { scale: 1, opacity: settledOp }
            : { scale: 1, opacity: STAR_OP_MAX }
        }
        transition={
          freeze
            ? undefined
            : {
                duration: STAR_GROW_DUR,
                ease: [0.22, 1, 0.36, 1],
                delay,
              }
        }
        style={{
          transformOrigin: "0px 0px",
          filter: freeze
            ? undefined
            : `drop-shadow(0 0 3px rgba(201, 160, 245, ${STAR_GLOW}))`,
        }}
      >
        <motion.path
          d={d}
          fill="#f5f0ff"
          initial={false}
          animate={
            freeze
              ? { scale: 1, opacity: 1 }
              : {
                  scale: [0.88, 1.12, 0.88],
                  opacity: [
                    STAR_OP_MIN / STAR_OP_MAX,
                    1,
                    STAR_OP_MIN / STAR_OP_MAX,
                  ],
                }
          }
          transition={
            freeze
              ? undefined
              : {
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: delay + STAR_GROW_DUR * STAR_PULSE_BLEND,
                }
          }
          style={{ transformOrigin: "0px 0px" }}
        />
      </motion.g>
    </g>
  );
}

/** Minimal cloud — three bumps, flat bottom. */
function cloudPath() {
  return "M 20 56 C 8 56 4 40 18 34 C 14 18 36 8 52 20 C 62 8 88 12 92 30 C 110 28 118 48 102 56 Z";
}

/**
 * Seamless marquee: two copies spaced by loopPx; travel exactly loopPx.
 * Avoids the jump from `x: [a, b]` + Infinity restart.
 */
function MarqueeClouds({
  from,
  to,
  freeze,
  durationSec,
  placement,
}: {
  from: string;
  to: string;
  freeze: boolean;
  durationSec: number;
  placement: "default" | "sky";
}) {
  const g1 = useId();
  const g2 = useId();

  const sky = placement === "sky";
  // Classic list baselines; sky multiplies scale + adds yOffset (GHOSTED_LIST_CLOUDS).
  const s = sky ? GHOSTED_LIST_CLOUDS.scale : 1;
  const dy = sky ? GHOSTED_LIST_CLOUDS.yOffset : 0;
  const laneA = sky
    ? { y: -4 + dy, scale: 1.15 * s, gap: 200, opacity: 0.9 }
    : { y: 16, scale: 1.15, gap: 240, opacity: 0.92 };
  const laneB = sky
    ? { y: 18 + dy, scale: 0.78 * s, gap: 220, opacity: 0.75 }
    : { y: 52, scale: 0.78, gap: 280, opacity: 0.8 };
  // Clip tall enough for scaled clouds + offset (cloud path ~60 tall × scale).
  const clipH = sky ? Math.ceil(60 * 1.15 * s + dy + 24) : 120;
  const clipY = sky ? -12 : 0;
  const cloudBase = 120;
  const loopA = cloudBase * laneA.scale + laneA.gap;
  const loopB = cloudBase * laneB.scale + laneB.gap;

  return (
    <g>
      <defs>
        <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={g2} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={to} />
          <stop offset="100%" stopColor={from} />
        </linearGradient>
        <clipPath id={`${g1}-clip`}>
          <rect x={-20} y={clipY} width={400} height={clipH} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${g1}-clip)`}>
        {/* Lane A — L→R */}
        <motion.g
          initial={false}
          animate={freeze ? { x: -40 } : { x: [0, -loopA] }}
          transition={
            freeze
              ? undefined
              : {
                  duration: durationSec,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
        >
          <g
            transform={`translate(0 ${laneA.y}) scale(${laneA.scale})`}
            opacity={laneA.opacity}
          >
            <path d={cloudPath()} fill={`url(#${g1})`} />
          </g>
          <g
            transform={`translate(${loopA} ${laneA.y}) scale(${laneA.scale})`}
            opacity={laneA.opacity}
          >
            <path d={cloudPath()} fill={`url(#${g1})`} />
          </g>
        </motion.g>

        {/* Lane B — opposite direction / slower */}
        <motion.g
          initial={false}
          animate={freeze ? { x: loopB * 0.35 } : { x: [0, loopB] }}
          transition={
            freeze
              ? undefined
              : {
                  duration: durationSec * 1.35,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
        >
          <g
            transform={`translate(${-loopB} ${laneB.y}) scale(${laneB.scale})`}
            opacity={laneB.opacity}
          >
            <path d={cloudPath()} fill={`url(#${g2})`} />
          </g>
          <g
            transform={`translate(0 ${laneB.y}) scale(${laneB.scale})`}
            opacity={laneB.opacity}
          >
            <path d={cloudPath()} fill={`url(#${g2})`} />
          </g>
        </motion.g>
      </g>
    </g>
  );
}

/**
 * Soft sine-like sway — long period, small amp, no jagged gust peaks.
 * Grow-in: no scaleY (motion’s SVG scale always pivots mid-box). Instead each
 * ridge starts buried below the ground line and rises into a ground clip —
 * tips emerge from soil, cascade near → mid → far.
 */
const FLOW_DUR = 9;
const FLOW_AMP = 2.2; // degrees skew peak
const GRASS_GROW_EASE = [0.22, 1, 0.36, 1] as const;
const GRASS_GROW_DUR = 0.85;
/** Near → mid → far (front grows first; deeper ridges fill in behind). */
const GRASS_GROW_DELAY = { near: 0.08, mid: 0.34, far: 0.6 } as const;
/** Rise distance = ground (H) − tallest tip y — fully hidden under the clip. */
const GRASS_RISE = { far: 98, mid: 70, near: 46 } as const;

function SpikyGrass({
  from,
  to,
  freeze,
}: {
  from: string;
  to: string;
  freeze: boolean;
}) {
  const gFar = useId();
  const gNear = useId();
  const clipId = useId();
  // Local band height — short tufts (was 280-tall meadow).
  const H = 140;

  const flow = (amp: number, phase: number) =>
    freeze
      ? { skewX: 0, x: 0 }
      : {
          skewX: [
            FLOW_AMP * amp * Math.sin(phase),
            FLOW_AMP * amp,
            FLOW_AMP * amp * Math.sin(phase + Math.PI),
            -FLOW_AMP * amp * 0.85,
            FLOW_AMP * amp * Math.sin(phase),
          ],
          x: [
            1.5 * amp * Math.sin(phase),
            2.5 * amp,
            1.5 * amp * Math.sin(phase + Math.PI),
            -2 * amp,
            1.5 * amp * Math.sin(phase),
          ],
        };

  // Smooth continuous ease — no hard gust corners.
  const flowEase = [0.37, 0, 0.63, 1] as const;

  const flowTransition = (dur: number, delay: number) =>
    freeze
      ? undefined
      : {
          duration: dur,
          repeat: Infinity,
          ease: flowEase,
          delay,
        };

  const growTransition = (delay: number) =>
    freeze
      ? undefined
      : {
          duration: GRASS_GROW_DUR,
          ease: GRASS_GROW_EASE,
          delay,
        };

  return (
    <g opacity={0.95}>
      <defs>
        <linearGradient id={gFar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} stopOpacity={0.55} />
          <stop offset="100%" stopColor={to} stopOpacity={0.9} />
        </linearGradient>
        <linearGradient id={gNear} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        {/* Soil line — anything below y=H is underground and hidden. */}
        <clipPath id={clipId}>
          <rect x={-28} y={0} width={416} height={H} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Far ridge — grows last (behind) */}
        <motion.g
          initial={freeze ? false : { y: GRASS_RISE.far }}
          animate={{ y: 0 }}
          transition={growTransition(GRASS_GROW_DELAY.far)}
        >
          <motion.g
            style={{ transformOrigin: `180px ${H}px` }}
            animate={flow(0.65, 0)}
            transition={flowTransition(
              FLOW_DUR * 1.2,
              GRASS_GROW_DELAY.far + GRASS_GROW_DUR,
            )}
          >
            <path
              fill={`url(#${gFar})`}
              d={`M0 ${H} L0 70 L28 50 L54 72 L82 46 L110 68 L138 44 L166 66 L196 42 L224 64 L254 42 L282 66 L312 48 L340 68 L360 56 L360 ${H} Z`}
            />
          </motion.g>
        </motion.g>
        {/* Mid — second */}
        <motion.g
          initial={freeze ? false : { y: GRASS_RISE.mid }}
          animate={{ y: 0 }}
          transition={growTransition(GRASS_GROW_DELAY.mid)}
        >
          <motion.g
            style={{ transformOrigin: `120px ${H}px` }}
            animate={flow(1, 1.1)}
            transition={flowTransition(
              FLOW_DUR,
              GRASS_GROW_DELAY.mid + GRASS_GROW_DUR,
            )}
          >
            <path
              fill={`url(#${gNear})`}
              d={`M0 ${H} L0 96 L24 78 L50 98 L76 70 L102 94 L128 74 L154 96 L182 70 L208 92 L236 74 L262 96 L290 76 L318 92 L348 80 L360 90 L360 ${H} Z`}
            />
          </motion.g>
        </motion.g>
        {/* Near blades — first (front) */}
        <motion.g
          initial={freeze ? false : { y: GRASS_RISE.near }}
          animate={{ y: 0 }}
          transition={growTransition(GRASS_GROW_DELAY.near)}
        >
          <motion.g
            style={{ transformOrigin: `240px ${H}px` }}
            animate={flow(1.15, 2.2)}
            transition={flowTransition(
              FLOW_DUR * 0.92,
              GRASS_GROW_DELAY.near + GRASS_GROW_DUR,
            )}
          >
            <path
              fill={from}
              opacity={0.85}
              d={`M-8 ${H} L-8 114 L16 100 L38 116 L62 94 L86 112 L110 94 L134 116 L160 94 L184 112 L208 98 L232 116 L258 94 L282 112 L308 98 L332 114 L356 100 L372 108 L372 ${H} Z`}
            />
          </motion.g>
        </motion.g>
      </g>
    </g>
  );
}

/**
 * Five edge ghosts — inset so slice/meet crops don’t clip them.
 * Outer fade + inner float overlap (intro cascade-breathe grammar · D-018).
 */
const FLOAT_GHOST_SLOTS = [
  { x: 32, y: 148, size: 24, amp: 11, dur: 4.6, rot: 3.2, dx: 3 },
  { x: 48, y: 292, size: 20, amp: 14, dur: 5.4, rot: 2.4, dx: -2 },
  { x: 38, y: 430, size: 22, amp: 9, dur: 3.9, rot: 3.8, dx: 4 },
  { x: 292, y: 168, size: 24, amp: 13, dur: 5.1, rot: 2.8, dx: -3 },
  { x: 278, y: 360, size: 20, amp: 10, dur: 4.3, rot: 3.5, dx: 2 },
] as const;

/**
 * Stagger after list-beat gate (“Your ghosted songs”).
 * Extra pad so copy lands before the chorus fades in.
 */
const LIST_GHOST_ENTER_PAD = 1.45;
const GHOST_ENTER_STAGGER = [0.85, 1.3, 1.75, 2.2, 2.65].map(
  (t) => t + LIST_GHOST_ENTER_PAD,
) as readonly number[];
/** Fade at rest — haunt + list floats. */
const GHOST_ENTER_DUR = 1.7;
/**
 * Float / bob starts this far into the fade (0–1) so enter + idle blend
 * instead of a hard handoff (same idea as intro cascade-breathe).
 */
const GHOST_FLOAT_BLEND = 0.45;
const HAUNT_ENTER_DELAY = 0.4;

function ghostFloatDelay(enterDelay: number) {
  return enterDelay + GHOST_ENTER_DUR * GHOST_FLOAT_BLEND;
}

/** Blob ghost body — wash fill, no hem wave (D-018). */
function blobPath() {
  return "M12 48 Q20 54 32 48 Q44 54 52 48 C56 32 50 10 32 8 C14 6 8 30 12 48 Z";
}

function GhostBody({ size }: { size: number }) {
  const scale = size / 64;
  return (
    <g transform={`scale(${scale})`}>
      <path d={blobPath()} fill="#f5f0ff" />
      <circle cx={24} cy={26} r={3.2} fill="#2a2433" />
      <circle cx={40} cy={26} r={3.2} fill="#2a2433" />
    </g>
  );
}

function BlobGhost({
  x,
  y,
  size,
  freeze,
  delay = 0,
  opacity = 0.74,
}: {
  x: number;
  y: number;
  size: number;
  freeze: boolean;
  delay?: number;
  opacity?: number;
}) {
  const floatDelay = ghostFloatDelay(delay);
  return (
    <motion.g
      initial={freeze ? false : { opacity: 0 }}
      animate={{ opacity }}
      transition={
        freeze
          ? undefined
          : {
              duration: GHOST_ENTER_DUR,
              ease: "easeInOut",
              delay,
            }
      }
    >
      <motion.g
        initial={{ x, y, rotate: -2 }}
        animate={
          freeze
            ? { x, y, rotate: -2 }
            : {
                x,
                y: [y, y - 10, y - 4, y],
                rotate: [-2, 3, -1, -2],
              }
        }
        transition={
          freeze
            ? undefined
            : {
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: floatDelay,
              }
        }
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        <GhostBody size={size} />
      </motion.g>
    </motion.g>
  );
}

function FloatingBlobGhost({
  x,
  y,
  size,
  freeze,
  enter,
  delay = 0,
  amp = 10,
  dur = 4.5,
  rot = 3,
  dx = 0,
}: {
  x: number;
  y: number;
  size: number;
  freeze: boolean;
  /** List-beat gate — stay at 0 until “Your ghosted songs”. */
  enter: boolean;
  delay?: number;
  amp?: number;
  dur?: number;
  rot?: number;
  dx?: number;
}) {
  const op = 0.42;
  const show = enter;
  const play = show && !freeze;
  const floatDelay = ghostFloatDelay(delay);
  return (
    <motion.g
      initial={play ? { opacity: 0 } : false}
      animate={{ opacity: show ? op : 0 }}
      transition={
        play
          ? {
              duration: GHOST_ENTER_DUR,
              ease: "easeInOut",
              delay,
            }
          : { duration: 0 }
      }
    >
      <motion.g
        initial={{ x, y, rotate: 0 }}
        animate={
          play
            ? {
                x: [x, x + dx, x - dx * 0.6, x],
                y: [y, y - amp, y - amp * 0.35, y],
                rotate: [-rot * 0.6, rot, -rot * 0.3, -rot * 0.6],
              }
            : { x, y, rotate: 0 }
        }
        transition={
          play
            ? {
                duration: dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: floatDelay,
              }
            : undefined
        }
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        <GhostBody size={size} />
      </motion.g>
    </motion.g>
  );
}

export function RisingColumnGhosts({
  freeze,
  enter = true,
}: {
  freeze: boolean;
  enter?: boolean;
}) {
  return (
    <g key={enter ? "ghosts-enter" : "ghosts-wait"}>
      {FLOAT_GHOST_SLOTS.map((s, i) => (
        <FloatingBlobGhost
          key={i}
          x={s.x}
          y={s.y}
          size={s.size}
          freeze={freeze}
          enter={enter}
          delay={GHOST_ENTER_STAGGER[i] ?? i * 0.4}
          amp={s.amp}
          dur={s.dur}
          rot={s.rot}
          dx={s.dx}
        />
      ))}
    </g>
  );
}

/** Simple corner orb — locked oval, two-stop radial gradient. */
function SimpleOrb({
  from,
  to,
  freeze,
}: {
  from: string;
  to: string;
  freeze: boolean;
}) {
  const gradId = useId();
  const r = 120;

  return (
    <g>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor={to} />
          <stop offset="100%" stopColor={from} />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx={110}
        cy={130}
        rx={ovalRx(r)}
        ry={ovalRy(r)}
        fill={`url(#${gradId})`}
        initial={freeze ? false : { scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "110px 130px" }}
      />
    </g>
  );
}
