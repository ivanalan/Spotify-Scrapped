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
 * Ghosted songs list (slide 3) — ink field + sky/grass/ghosts (D-010).
 * Locked from docs/mocks/explorations/ghosted-list-sky-grass.html.
 */
export function GhostedListFrame({
  accent,
  accent2,
  animate = "soft",
}: MotifProps) {
  const reduce = useReducedMotion();
  const freeze = reduce || animate === "none";

  return (
    <g>
      <ListClouds
        from={accent}
        to={accent2}
        freeze={freeze}
        durationSec={32}
        placement="sky"
      />
      {/* Short grass band — sits low under the list */}
      <g transform="translate(0 500)">
        <SpikyGrass from={accent} to={accent2} freeze={freeze} />
      </g>
      <PerimeterGhosts freeze={freeze} />
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

/** Perimeter blob ghosts — phone MotifStage / wide meet stage. */
export function ListPerimeterGhosts({ freeze }: { freeze: boolean }) {
  return <PerimeterGhosts freeze={freeze} />;
}

/**
 * Most-ghosted-song entity (slide 2) — night rhyme with D-010 list.
 * Ink field (palette): TR moon + sparse edge stars + one BL ghost.
 * No clouds / grass — those arrive on the list beat.
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
  const moonGrad = useId();
  const stars = [
    { cx: 48, cy: 168, r: 1.6 },
    { cx: 92, cy: 128, r: 2.1 },
    { cx: 248, cy: 196, r: 1.5 },
    { cx: 36, cy: 456, r: 1.7 },
    { cx: 312, cy: 428, r: 2 },
  ] as const;

  return (
    <g>
      <defs>
        <radialGradient id={moonGrad} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f5f0ff" />
          <stop offset="55%" stopColor={accent} />
          <stop offset="100%" stopColor={accent2} />
        </radialGradient>
      </defs>

      {/* Top-right moon — pinned clear of mid-band copy */}
      <motion.circle
        cx={308}
        cy={78}
        r={42}
        fill={`url(#${moonGrad})`}
        opacity={0.9}
        initial={freeze ? false : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.9 }}
        transition={
          freeze
            ? undefined
            : { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.08 }
        }
        style={{ transformOrigin: "308px 78px" }}
      />
      <motion.circle
        cx={308}
        cy={78}
        r={58}
        fill={accent}
        opacity={0.12}
        initial={false}
        animate={
          freeze
            ? { opacity: 0.12 }
            : { opacity: [0.1, 0.18, 0.1] }
        }
        transition={
          freeze
            ? undefined
            : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#f5f0ff"
          initial={freeze ? false : { opacity: 0 }}
          animate={
            freeze
              ? { opacity: 0.5 }
              : { opacity: [0.35, 0.7, 0.35] }
          }
          transition={
            freeze
              ? undefined
              : {
                  duration: 3.2 + i * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }
          }
        />
      ))}

      {/* One haunt — same blob as list perimeter ghosts */}
      <g opacity={0.8}>
        <BlobGhost
          x={26}
          y={468}
          size={72}
          freeze={freeze}
          delay={0}
        />
      </g>
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
 * Grow-in: scaleY from the ground line.
 */
const FLOW_DUR = 9;
const FLOW_AMP = 2.2; // degrees skew peak

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
  // Local band height — short tufts (was 280-tall meadow).
  const H = 140;
  const origin = `180px ${H}px`;

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

  return (
    <motion.g
      opacity={0.95}
      initial={freeze ? false : { scaleY: 0, opacity: 0.4 }}
      animate={{ scaleY: 1, opacity: 0.95 }}
      transition={
        freeze
          ? undefined
          : { duration: 1.35, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
      }
      style={{ transformOrigin: origin }}
    >
      <defs>
        <linearGradient id={gFar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} stopOpacity={0.55} />
          <stop offset="100%" stopColor={to} stopOpacity={0.9} />
        </linearGradient>
        <linearGradient id={gNear} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      {/* Far ridge — short, soft tips */}
      <motion.g
        style={{ transformOrigin: `180px ${H}px` }}
        animate={flow(0.65, 0)}
        transition={flowTransition(FLOW_DUR * 1.2, 0)}
      >
        <path
          fill={`url(#${gFar})`}
          d={`M0 ${H} L0 88 L22 72 L40 90 L58 68 L78 88 L98 70 L118 86 L140 66 L160 84 L182 68 L204 86 L226 64 L248 84 L270 70 L292 88 L314 72 L336 90 L360 78 L360 ${H} Z`}
        />
      </motion.g>
      {/* Mid */}
      <motion.g
        style={{ transformOrigin: `120px ${H}px` }}
        animate={flow(1, 1.1)}
        transition={flowTransition(FLOW_DUR, 0.4)}
      >
        <path
          fill={`url(#${gNear})`}
          d={`M0 ${H} L0 102 L16 88 L32 104 L48 84 L66 102 L84 86 L102 104 L120 82 L138 100 L156 88 L174 104 L192 84 L210 102 L228 86 L246 104 L264 88 L282 102 L300 84 L318 100 L338 90 L360 98 L360 ${H} Z`}
        />
      </motion.g>
      {/* Near blades */}
      <motion.g
        style={{ transformOrigin: `240px ${H}px` }}
        animate={flow(1.15, 2.2)}
        transition={flowTransition(FLOW_DUR * 0.92, 0.9)}
      >
        <path
          fill={from}
          opacity={0.85}
          d={`M-8 ${H} L-8 112 L10 100 L24 114 L40 98 L56 112 L72 96 L88 112 L104 100 L120 114 L138 98 L154 112 L170 100 L186 114 L204 96 L220 110 L238 100 L254 114 L272 98 L288 112 L306 102 L322 114 L340 100 L356 110 L372 104 L372 ${H} Z`}
        />
      </motion.g>
    </motion.g>
  );
}

const GHOST_SLOTS = [
  { x: 22, y: 125, size: 48 },
  { x: 281, y: 151, size: 40 },
  { x: 14, y: 381, size: 36 },
  { x: 295, y: 407, size: 44 },
] as const;

/** Blob ghost body — wash fill, no hem wave (locked explore). */
function blobPath() {
  return "M12 48 Q20 54 32 48 Q44 54 52 48 C56 32 50 10 32 8 C14 6 8 30 12 48 Z";
}

function BlobGhost({
  x,
  y,
  size,
  freeze,
  delay = 0,
}: {
  x: number;
  y: number;
  size: number;
  freeze: boolean;
  delay?: number;
}) {
  const scale = size / 64;
  return (
    <motion.g
      initial={false}
      animate={
        freeze
          ? { x, y }
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
              delay,
            }
      }
      style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
    >
      <g transform={`scale(${scale})`}>
        <path d={blobPath()} fill="#f5f0ff" />
        <circle cx={24} cy={26} r={3.2} fill="#2a2433" />
        <circle cx={40} cy={26} r={3.2} fill="#2a2433" />
      </g>
    </motion.g>
  );
}

function PerimeterGhosts({ freeze }: { freeze: boolean }) {
  return (
    <g opacity={0.74}>
      {GHOST_SLOTS.map((s, i) => (
        <BlobGhost
          key={i}
          x={s.x}
          y={s.y}
          size={s.size}
          freeze={freeze}
          delay={-i * 0.85}
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
