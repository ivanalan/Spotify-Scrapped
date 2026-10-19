"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, type ReactNode } from "react";

const VB = "0 0 360 640";

/**
 * Locked Orbit Cascade oval — wider than tall.
 * Every disk / orb / ring uses this aspect; never perfect circles.
 */
export const OVAL = { sx: 1.28, sy: 0.78 } as const;

export function ovalRx(r: number) {
  return r * OVAL.sx;
}

export function ovalRy(r: number) {
  return r * OVAL.sy;
}

/** Full-bleed SVG stage for motif chrome. */
export function MotifStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className ?? "absolute inset-0 h-full w-full"}
      viewBox={VB}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {children}
    </svg>
  );
}

type CascadeRingsProps = {
  cx: number;
  cy: number;
  count?: number;
  startR?: number;
  step?: number;
  stroke: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  animate?: "cascade" | "breathe" | "hue-idle" | "none";
  delayBase?: number;
};

/** Concentric stroke rings — cascade-in or idle breathe. */
export function CascadeRings({
  cx,
  cy,
  count = 5,
  startR = 40,
  step = 36,
  stroke,
  strokeWidth = 14,
  fill,
  fillOpacity = 0,
  animate = "cascade",
  delayBase = 0,
}: CascadeRingsProps) {
  const reduce = useReducedMotion();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = startR + i * step;
        const delay = delayBase + i * 0.12;
        const common = {
          cx,
          cy,
          rx: ovalRx(r),
          ry: ovalRy(r),
          fill: fill ?? "none",
          fillOpacity: fill ? fillOpacity : 0,
          stroke,
          strokeWidth,
          strokeOpacity: 0.95 - i * 0.12,
        };
        if (reduce || animate === "none") {
          return <ellipse key={i} {...common} />;
        }
        if (animate === "cascade") {
          return (
            <motion.ellipse
              key={i}
              {...common}
              initial={{ scale: 0.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        }
        if (animate === "breathe") {
          return (
            <motion.ellipse
              key={i}
              {...common}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{
                duration: 4.5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        }
        // hue-idle: opacity pulse as stand-in for gradient hue travel
        return (
          <motion.ellipse
            key={i}
            {...common}
            animate={{ strokeOpacity: [0.55, 0.95, 0.55] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
          />
        );
      })}
    </>
  );
}

type SemiDiskProps = {
  cx: number;
  cy: number;
  r: number;
  /** Opening direction of the flat edge. */
  face: "up" | "down" | "left" | "right";
  fill: string;
  /** Optional vertical gradient (from = near flat edge → to = rim). */
  gradientTo?: string;
  animate?: "breathe" | "wipe" | "enter-breathe" | "none";
};

export function SemiDisk({
  cx,
  cy,
  r,
  face,
  fill,
  gradientTo,
  animate = "none",
}: SemiDiskProps) {
  const reduce = useReducedMotion();
  const clipId = useId();
  const gradId = useId();
  const rx = ovalRx(r);
  const ry = ovalRy(r);
  let clipRect: { x: number; y: number; w: number; h: number };
  let grad: { x1: string; y1: string; x2: string; y2: string };
  switch (face) {
    case "up":
      clipRect = { x: cx - rx, y: cy - ry, w: rx * 2, h: ry };
      grad = { x1: "50%", y1: "100%", x2: "50%", y2: "0%" };
      break;
    case "down":
      clipRect = { x: cx - rx, y: cy, w: rx * 2, h: ry };
      grad = { x1: "50%", y1: "0%", x2: "50%", y2: "100%" };
      break;
    case "left":
      clipRect = { x: cx - rx, y: cy - ry, w: rx, h: ry * 2 };
      grad = { x1: "100%", y1: "50%", x2: "0%", y2: "50%" };
      break;
    case "right":
      clipRect = { x: cx, y: cy - ry, w: rx, h: ry * 2 };
      grad = { x1: "0%", y1: "50%", x2: "100%", y2: "50%" };
      break;
  }

  const paint = gradientTo ? `url(#${gradId})` : fill;
  const disk = (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={paint}
      clipPath={`url(#${clipId})`}
    />
  );

  const body = (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={clipRect.x}
            y={clipRect.y}
            width={clipRect.w}
            height={clipRect.h}
          />
        </clipPath>
        {gradientTo ? (
          <linearGradient id={gradId} {...grad}>
            <stop offset="0%" stopColor={fill} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        ) : null}
      </defs>
      {disk}
    </g>
  );

  if (reduce || animate === "none") {
    return body;
  }
  if (animate === "breathe") {
    return (
      <motion.g
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {body}
      </motion.g>
    );
  }
  if (animate === "enter-breathe") {
    // One-shot rise/fade, then soft breathe — volume “pile” intro
    return (
      <motion.g
        initial={{ scale: 0.7, y: 56, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <motion.g
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.3,
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {body}
        </motion.g>
      </motion.g>
    );
  }
  // wipe
  return (
    <motion.g
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {body}
    </motion.g>
  );
}

const OCEAN_FLOOR_Y = 720;
/** One tiled crest period — x scroll by this amount loops seamlessly. */
const OCEAN_WAVE_LEN = 180;
/** Extra width so continuous phase scroll never shows a hard edge. */
const OCEAN_PATH_W = 720;

/**
 * Wide rolling crest — trochoid-ish (sharper crest, broader trough).
 * Fills below the path down to a fixed floor (bottom pinned).
 * Calm steepness: keep amp modest (Σ steepness budget, Gerstner-style).
 */
function oceanWavePath(baseY: number, amp: number, width = OCEAN_PATH_W): string {
  const step = OCEAN_WAVE_LEN / 2; // 90 — two half-waves per tile
  let d = `M ${-OCEAN_WAVE_LEN} ${baseY}`;
  for (let x = -OCEAN_WAVE_LEN; x < width; x += step) {
    // Crest half (pinched up) then trough half (wider) — sine looks like jelly;
    // this approximates the Gerstner crest/trough asymmetry in 2D.
    d += ` c ${step * 0.28} ${-amp}, ${step * 0.42} ${-amp * 0.12}, ${step * 0.5} 0`;
    d += ` c ${step * 0.18} ${amp * 0.85}, ${step * 0.38} ${amp * 0.55}, ${step * 0.5} 0`;
  }
  d += ` L ${width} ${OCEAN_FLOOR_Y} L ${-OCEAN_WAVE_LEN} ${OCEAN_FLOOR_Y} Z`;
  return d;
}

/**
 * Crest Y per layer — lower Y = taller water. Floor stays at OCEAN_FLOOR_Y.
 * High tide crest sits above the centered copy band (~y 300–360).
 */
const OCEAN_TIDE = {
  low: { back: 498, mid: 528, front: 556 },
  high: { back: 168, mid: 208, front: 248 },
} as const;

/**
 * Layered swell trains (NVIDIA / Tessendorf practice, stylized SVG):
 * long low swell + shorter foreground chop, different phase speeds so the
 * surface separates instead of moving as one mechanical slab.
 * Durations are deliberately calm — slow graceful roll, not a storm.
 */
const OCEAN_LAYERS = [
  {
    id: "back" as const,
    amp: 26,
    opacity: 0.72,
    /** Long swell — slow continuous phase travel. */
    scrollSec: 32,
    bob: 4,
    bobSec: 13,
    phaseDelay: 0,
    grad: "back" as const,
  },
  {
    id: "mid" as const,
    amp: 20,
    opacity: 0.88,
    scrollSec: 22,
    bob: 3.2,
    bobSec: 9.5,
    phaseDelay: 0.55,
    grad: "back" as const,
  },
  {
    id: "front" as const,
    amp: 14,
    opacity: 1,
    scrollSec: 15,
    bob: 2.4,
    bobSec: 7.2,
    phaseDelay: 1.1,
    grad: "front" as const,
  },
] as const;

type OceanWaveProps = {
  /** Crest / shallow water. */
  from: string;
  /** Deep water. */
  to: string;
  /** Low sits under copy; high rises on the second narrative beat. */
  tide?: "low" | "high";
  freeze?: boolean;
};

/**
 * Bottom ocean band — aqua crest → navy deep, soft roll, rises on high tide.
 * Tide morphs crest Y upward (path `d`) so the waterline sits above copy;
 * floor stays pinned. Volume slide exception to the oval-only chrome rule.
 *
 * Motion follows CG water practice (Gerstner / GPU Gems): continuous phase
 * travel (not ping-pong), layered trains with dispersion, low steepness.
 */
export function OceanWave({
  from,
  to,
  tide = "low",
  freeze = false,
}: OceanWaveProps) {
  const reduce = useReducedMotion() || freeze;
  const gradBack = useId();
  const gradFront = useId();
  const crests = OCEAN_TIDE[tide];
  const tideEase = [0.4, 0, 0.2, 1] as const;
  const tideTransition = { duration: 4.2, ease: tideEase };
  const gradId = { back: gradBack, front: gradFront };

  const paths = {
    back: oceanWavePath(crests.back, OCEAN_LAYERS[0].amp),
    mid: oceanWavePath(crests.mid, OCEAN_LAYERS[1].amp),
    front: oceanWavePath(crests.front, OCEAN_LAYERS[2].amp),
  };

  // Ice crest → cyan → sky → deep teal (black ink reads on the bright crest)
  const defs = (
    <defs>
      <linearGradient id={gradBack} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={from} stopOpacity={0.5} />
        <stop offset="12%" stopColor={from} stopOpacity={0.9} />
        <stop offset="28%" stopColor="#67E8F9" />
        <stop offset="48%" stopColor="#22D3EE" />
        <stop offset="72%" stopColor="#0284C7" />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
      <linearGradient id={gradFront} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={from} stopOpacity={0.35} />
        <stop offset="14%" stopColor={from} stopOpacity={0.92} />
        <stop offset="32%" stopColor="#67E8F9" />
        <stop offset="52%" stopColor="#0EA5E9" />
        <stop offset="78%" stopColor="#0369A1" />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  );

  if (reduce) {
    return (
      <g>
        {defs}
        {OCEAN_LAYERS.map((layer) => (
          <path
            key={layer.id}
            d={paths[layer.id]}
            fill={`url(#${gradId[layer.grad]})`}
            opacity={layer.opacity}
          />
        ))}
      </g>
    );
  }

  return (
    <motion.g
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.85, ease: tideEase }}
    >
      {defs}
      {OCEAN_LAYERS.map((layer) => (
        <motion.g
          key={layer.id}
          animate={{
            // Continuous phase travel — linear loop, never easeInOut ping-pong
            // (ping-pong reads as a wave pool, not a sea).
            x: [0, -OCEAN_WAVE_LEN],
            // Soft vertical orbit (calm Gerstner parcel motion).
            y: [0, -layer.bob, 0, layer.bob * 0.55, 0],
          }}
          transition={{
            x: {
              duration: layer.scrollSec,
              repeat: Infinity,
              ease: "linear",
              delay: layer.phaseDelay,
            },
            y: {
              duration: layer.bobSec,
              repeat: Infinity,
              ease: "easeInOut",
              delay: layer.phaseDelay * 0.6,
            },
          }}
        >
          <motion.path
            d={paths[layer.id]}
            fill={`url(#${gradId[layer.grad]})`}
            opacity={layer.opacity}
            animate={{ d: paths[layer.id] }}
            transition={tideTransition}
          />
        </motion.g>
      ))}
    </motion.g>
  );
}

/** Filled concentric disks tinted along a two-stop gradient (outer → inner). */
export function ConcentricGradientDisks({
  cx,
  cy,
  count = 5,
  startR = 48,
  step = 38,
  from,
  to,
  animate = "cascade-soft",
  delayBase = 0,
}: {
  cx: number;
  cy: number;
  count?: number;
  startR?: number;
  step?: number;
  from: string;
  to: string;
  animate?: "cascade" | "cascade-soft" | "cascade-breathe" | "breathe" | "none";
  delayBase?: number;
}) {
  const colors = Array.from({ length: count }, (_, i) =>
    mixHex(from, to, count === 1 ? 0 : i / (count - 1)),
  );
  return (
    <ConcentricDisks
      cx={cx}
      cy={cy}
      count={count}
      startR={startR}
      step={step}
      colors={colors}
      animate={animate}
      delayBase={delayBase}
    />
  );
}

/** Naive hex mix for gradient ladder disks. */
function mixHex(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return a;
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(m(pa[0], pb[0]))}${to(m(pa[1], pb[1]))}${to(m(pa[2], pb[2]))}`;
}

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

type QuarterDiskProps = {
  cx: number;
  cy: number;
  r: number;
  /** Which quadrant relative to (cx, cy). */
  corner: "tl" | "tr" | "bl" | "br";
  fill: string;
  animate?: "wipe" | "rotate-in" | "none";
  delay?: number;
};

export function QuarterDisk({
  cx,
  cy,
  r,
  corner,
  fill,
  animate = "none",
  delay = 0,
}: QuarterDiskProps) {
  const reduce = useReducedMotion();
  // Path for quarter pie with origin at (cx, cy)
  const ends: Record<typeof corner, [number, number]> = {
    tl: [cx - r, cy],
    tr: [cx + r, cy],
    bl: [cx - r, cy],
    br: [cx + r, cy],
  };
  const mids: Record<typeof corner, [number, number]> = {
    tl: [cx, cy - r],
    tr: [cx, cy - r],
    bl: [cx, cy + r],
    br: [cx, cy + r],
  };
  const sweep: Record<typeof corner, 0 | 1> = {
    tl: 0,
    tr: 1,
    bl: 1,
    br: 0,
  };
  const [ex, ey] = ends[corner];
  const [mx, my] = mids[corner];
  const d = `M ${cx} ${cy} L ${ex} ${ey} A ${r} ${r} 0 0 ${sweep[corner]} ${mx} ${my} Z`;

  if (reduce || animate === "none") {
    return <path d={d} fill={fill} />;
  }
  if (animate === "wipe") {
    return (
      <motion.path
        d={d}
        fill={fill}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.55,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    );
  }
  return (
    <motion.path
      d={d}
      fill={fill}
      initial={{ rotate: -28, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}

type DotFieldProps = {
  dots: { x: number; y: number; r: number }[];
  fill: string;
  animate?: "drift" | "stagger" | "pulse" | "none";
  opacity?: number;
};

export function DotField({
  dots,
  fill,
  animate = "none",
  opacity = 0.85,
}: DotFieldProps) {
  const reduce = useReducedMotion();
  return (
    <>
      {dots.map((d, i) => {
        const rx = ovalRx(d.r);
        const ry = ovalRy(d.r);
        if (reduce || animate === "none") {
          return (
            <ellipse
              key={i}
              cx={d.x}
              cy={d.y}
              rx={rx}
              ry={ry}
              fill={fill}
              opacity={opacity}
            />
          );
        }
        if (animate === "stagger") {
          return (
            <motion.ellipse
              key={i}
              cx={d.x}
              cy={d.y}
              rx={rx}
              ry={ry}
              fill={fill}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: i * 0.04,
                ease: "easeOut",
              }}
              style={{ transformOrigin: `${d.x}px ${d.y}px` }}
            />
          );
        }
        if (animate === "pulse") {
          return (
            <motion.ellipse
              key={i}
              cx={d.x}
              cy={d.y}
              rx={rx}
              ry={ry}
              fill={fill}
              animate={{ opacity: [opacity * 0.4, opacity, opacity * 0.4] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            />
          );
        }
        // drift
        return (
          <motion.ellipse
            key={i}
            cx={d.x}
            cy={d.y}
            rx={rx}
            ry={ry}
            fill={fill}
            opacity={opacity}
            animate={{
              y: [0, i % 2 === 0 ? -6 : 5, 0],
              x: [0, i % 3 === 0 ? 4 : -3, 0],
            }}
            transition={{
              duration: 6 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05,
            }}
          />
        );
      })}
    </>
  );
}

type ArcStrokeProps = {
  cx: number;
  cy: number;
  r: number;
  startDeg: number;
  endDeg: number;
  stroke: string;
  strokeWidth?: number;
  animate?: "draw" | "none";
};

export function ArcStroke({
  cx,
  cy,
  r,
  startDeg,
  endDeg,
  stroke,
  strokeWidth = 10,
  animate = "none",
}: ArcStrokeProps) {
  const reduce = useReducedMotion();
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + Math.cos(toRad(startDeg)) * r;
  const y1 = cy + Math.sin(toRad(startDeg)) * r;
  const x2 = cx + Math.cos(toRad(endDeg)) * r;
  const y2 = cy + Math.sin(toRad(endDeg)) * r;
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`;

  if (reduce || animate === "none") {
    return (
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  }
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/** Radial gradient wash (soft mid direction). */
export function RadialWash({
  id,
  cx,
  cy,
  r,
  from,
  to,
  opacity = 0.55,
  animate = false,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  from: string;
  to: string;
  opacity?: number;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const disk = (
    <ellipse
      cx={cx}
      cy={cy}
      rx={ovalRx(r)}
      ry={ovalRy(r)}
      fill={`url(#${id})`}
      opacity={opacity}
    />
  );
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} stopOpacity={0} />
        </radialGradient>
      </defs>
      {reduce || !animate ? (
        disk
      ) : (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          {disk}
        </motion.g>
      )}
    </g>
  );
}

/** Deterministic pseudo-random dots for a field. */
export function makeDotGrid(
  cols: number,
  rows: number,
  padX: number,
  padY: number,
  gapX: number,
  gapY: number,
  r: number,
  jitter = 0,
): { x: number; y: number; r: number }[] {
  const out: { x: number; y: number; r: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const n = (row * 17 + col * 31) % 10;
      if (n < 3) continue; // sparse
      const jx = jitter ? ((n - 5) / 5) * jitter : 0;
      const jy = jitter ? (((n * 3) % 10) - 5) / 5 * jitter : 0;
      out.push({
        x: padX + col * gapX + jx,
        y: padY + row * gapY + jy,
        r: r * (0.7 + (n % 4) * 0.12),
      });
    }
  }
  return out;
}

type SharedGradientStop = { offset: string; color: string };

type SharedGradient = {
  /** Multi-stop sweep; falls back to from/to when omitted. */
  stops?: readonly SharedGradientStop[];
  from?: string;
  to?: string;
};

type ConcentricDisksProps = {
  cx: number;
  cy: number;
  count?: number;
  startR?: number;
  step?: number;
  /** Outer → inner colors (or single color with opacity falloff). */
  colors: string[];
  /**
   * One gradient every disk paints. Solid fills remap it per ellipse
   * (objectBoundingBox). Stroke rings (`asRings`) use userSpaceOnUse
   * so the sweep reads continuous across the ladder.
   */
  sharedGradient?: SharedGradient;
  /**
   * Stroke rings sharing `sharedGradient` (ink gaps between). Stroke
   * width defaults to ~86% of `step` for a tight packed ladder.
   */
  asRings?: boolean;
  /** Override stroke width when `asRings` (default `step * 0.86`). */
  ringWidth?: number;
  animate?: "cascade" | "cascade-soft" | "cascade-breathe" | "breathe" | "none";
  delayBase?: number;
  /** Degrees — rotate major axis around (cx, cy). 45 ≈ peak toward BR diagonal. */
  rotate?: number;
  /** Override OVAL aspect (default = locked OVAL). Closer to 1 = more circle-like. */
  oval?: { sx: number; sy: number };
};

/**
 * Filled concentric ovals (not stroke rings, never perfect circles) —
 * or stroke rings when `asRings` + `sharedGradient`.
 * Outer disks drawn first; cascade scales from center with soft overshoot.
 */
export function ConcentricDisks({
  cx,
  cy,
  count = 5,
  startR = 48,
  step = 40,
  colors,
  sharedGradient,
  asRings = false,
  ringWidth,
  animate = "cascade",
  delayBase = 0,
  rotate = 0,
  oval,
}: ConcentricDisksProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const sx = oval?.sx ?? OVAL.sx;
  const sy = oval?.sy ?? OVAL.sy;
  const strokeW = ringWidth ?? step * 0.86;
  const sharedId = `${uid}-shared`;
  const paint = sharedGradient ? `url(#${sharedId})` : null;

  // Bounds for userSpaceOnUse (stroke rings) — cover the outermost oval.
  const maxR = startR + (count - 1) * step;
  const maxRx = maxR * sx;
  const maxRy = maxR * sy;

  const stops: SharedGradientStop[] = sharedGradient
    ? sharedGradient.stops?.length
      ? [...sharedGradient.stops]
      : [
          { offset: "0%", color: sharedGradient.from ?? colors[0] },
          {
            offset: "100%",
            color: sharedGradient.to ?? colors[colors.length - 1] ?? colors[0],
          },
        ]
    : [];

  const disks = Array.from({ length: count }, (_, i) => {
    // draw outer first
    const fromOuter = count - 1 - i;
    const r = startR + fromOuter * step;
    const solid = colors[fromOuter % colors.length] ?? colors[0];
    return {
      rx: r * sx,
      ry: r * sy,
      fill: asRings ? "none" : (paint ?? solid),
      stroke: asRings && paint ? paint : undefined,
      strokeWidth: asRings ? strokeW : undefined,
      delay: delayBase + fromOuter * 0.14,
      key: fromOuter,
      enterDelay: delayBase + (count - 1 - fromOuter) * 0.1,
    };
  });

  const enterDuration = 1.35;
  // Idle starts after the last disk settles; stagger outer → inner like enter
  const breatheBase =
    delayBase + (count - 1) * 0.1 + enterDuration + 0.08;

  const paintProps = (d: (typeof disks)[number]) =>
    asRings
      ? {
          fill: "none" as const,
          stroke: d.stroke,
          strokeWidth: d.strokeWidth,
        }
      : { fill: d.fill };

  return (
    <g transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}>
      {sharedGradient ? (
        <defs>
          {asRings ? (
            <linearGradient
              id={sharedId}
              gradientUnits="userSpaceOnUse"
              x1={cx - maxRx * 0.15}
              y1={cy - maxRy * 0.2}
              x2={cx + maxRx * 0.95}
              y2={cy + maxRy * 0.85}
            >
              {stops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          ) : (
            <linearGradient
              id={sharedId}
              x1="8%"
              y1="4%"
              x2="92%"
              y2="96%"
            >
              {stops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          )}
        </defs>
      ) : null}
      {disks.map((d) => {
        const pp = paintProps(d);
        if (reduce || animate === "none") {
          return (
            <ellipse
              key={d.key}
              cx={cx}
              cy={cy}
              rx={d.rx}
              ry={d.ry}
              {...pp}
            />
          );
        }
        if (animate === "breathe") {
          return (
            <motion.ellipse
              key={d.key}
              cx={cx}
              cy={cy}
              rx={d.rx}
              ry={d.ry}
              {...pp}
              animate={{ scale: [1, 1.035, 1] }}
              transition={{
                duration: 5.2 + d.key * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: d.delay * 0.3,
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        }
        // cascade-breathe: enter to peak, then each disk shrinks/returns staggered
        if (animate === "cascade-breathe") {
          const breatheDelay =
            breatheBase + (count - 1 - d.key) * 0.18;
          return (
            <motion.g
              key={d.key}
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: enterDuration,
                delay: d.enterDelay,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <motion.ellipse
                cx={cx}
                cy={cy}
                rx={d.rx}
                ry={d.ry}
                {...pp}
                animate={{ scale: [1, 0.945, 1] }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: breatheDelay,
                }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            </motion.g>
          );
        }
        // cascade-soft: quieter one-shot scale/fade, then hold
        if (animate === "cascade-soft") {
          return (
            <motion.ellipse
              key={d.key}
              cx={cx}
              cy={cy}
              rx={d.rx}
              ry={d.ry}
              {...pp}
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: enterDuration,
                delay: d.enterDelay,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        }
        return (
          <motion.ellipse
            key={d.key}
            cx={cx}
            cy={cy}
            rx={d.rx}
            ry={d.ry}
            {...pp}
            initial={{ scale: 0.08, opacity: 0 }}
            animate={{
              scale: [0.08, 1.06, 1],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 0.95,
              delay: d.delay,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.72, 1],
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}
    </g>
  );
}

/** Stable SVG coord string — avoids SSR/client float / scientific-notation drift. */
function svgCoord(n: number): string {
  return n.toFixed(3);
}

/** n-pointed star polygon (default 7) — outer tip radius `r`, inner notch `r * innerRatio`. */
export function pointedStarPoints(
  cx: number,
  cy: number,
  r: number,
  points = 7,
  innerRatio = 0.4,
): string {
  const pts: string[] = [];
  const spikes = points * 2;
  for (let i = 0; i < spikes; i += 1) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * innerRatio;
    pts.push(
      `${svgCoord(cx + Math.cos(angle) * radius)},${svgCoord(cy + Math.sin(angle) * radius)}`,
    );
  }
  return pts.join(" ");
}

type PointedStarProps = {
  cx: number;
  cy: number;
  r: number;
  /** Tip count — intro uses 7. */
  points?: number;
  innerRatio?: number;
  from: string;
  to: string;
  /** Grow-in then continuous slow spin; `none` = settled static. */
  animate?: "grow-spin" | "none";
  delay?: number;
};

/**
 * Authored peripheral star (hand-sun-star motif). Corner subject only —
 * grow-in once, then rotate slowly. Settles static under reduced-motion.
 */
export function PointedStar({
  cx,
  cy,
  r,
  points = 7,
  innerRatio = 0.4,
  from,
  to,
  animate = "grow-spin",
  delay = 0.35,
}: PointedStarProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const poly = pointedStarPoints(cx, cy, r, points, innerRatio);
  const origin = `${cx}px ${cy}px`;

  const star = (
    <g>
      <defs>
        <linearGradient id={uid} x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <polygon points={poly} fill={`url(#${uid})`} />
    </g>
  );

  if (reduce || animate === "none") {
    return star;
  }

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 1.05,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ transformOrigin: origin }}
    >
      <motion.g
        animate={{ rotate: 360 }}
        transition={{
          duration: 42,
          repeat: Infinity,
          ease: "linear",
          delay: delay + 0.9,
        }}
        style={{ transformOrigin: origin }}
      >
        {star}
      </motion.g>
    </motion.g>
  );
}

