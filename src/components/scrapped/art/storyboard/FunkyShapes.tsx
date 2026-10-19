"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ovalRx, ovalRy } from "./ShapeKit";

/**
 * Wrapped-inspired funky shapes: same atom (oval orb / pill), distorted via
 * skew · rotate · non-uniform scale. Two-stop gradients. No arc soup.
 * Ref: docs/mocks/art-refs/hand-skew-orbs.png
 */

export function GradOrb({
  cx,
  cy,
  r,
  from,
  to,
  opacity = 1,
  transform,
}: {
  cx: number;
  cy: number;
  r: number;
  from: string;
  to: string;
  opacity?: number;
  /** SVG transform string applied around (cx,cy) via nested g */
  transform?: string;
}) {
  const id = useId();
  const disk = (
    <g>
      <defs>
        <radialGradient id={id} cx="32%" cy="30%" r="72%">
          <stop offset="0%" stopColor={to} />
          <stop offset="100%" stopColor={from} />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={ovalRx(r)}
        ry={ovalRy(r)}
        fill={`url(#${id})`}
        opacity={opacity}
      />
    </g>
  );
  if (!transform) return disk;
  return (
    <g transform={`translate(${cx} ${cy}) ${transform} translate(${-cx} ${-cy})`}>
      {disk}
    </g>
  );
}

/** Elongated ellipse — the “funky pill” from the hand ref. */
export function SkewPill({
  cx,
  cy,
  rx,
  ry,
  from,
  to,
  skewX = -28,
  rotate = -18,
  scaleX = 1.15,
  scaleY = 0.72,
  opacity = 1,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  from: string;
  to: string;
  skewX?: number;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
}) {
  const id = useId();
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${rotate}) skewX(${skewX}) scale(${scaleX} ${scaleY})`}
      opacity={opacity}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={`url(#${id})`} />
    </g>
  );
}

type FunkyProps = { a: string; b: string; freeze?: boolean };

/** Stacked skewed pills — matches the hand ref top. */
export function FunkyPillStack({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  const body = (
    <g>
      <SkewPill cx={150} cy={90} rx={110} ry={48} from={a} to={b} skewX={-32} rotate={-22} />
      <SkewPill
        cx={175}
        cy={145}
        rx={100}
        ry={44}
        from={a}
        to={b}
        skewX={-24}
        rotate={-14}
        scaleX={1.2}
        scaleY={0.68}
        opacity={0.92}
      />
    </g>
  );
  if (reduce) return body;
  return (
    <motion.g
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {body}
    </motion.g>
  );
}

/** Three orbs in a row — hand ref bottom. */
export function FunkyOrbRow({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  const orbs = [
    { cx: 90, cy: 560, r: 42 },
    { cx: 180, cy: 560, r: 42 },
    { cx: 270, cy: 560, r: 42 },
  ];
  return (
    <g>
      {orbs.map((o, i) =>
        reduce ? (
          <GradOrb key={i} {...o} from={a} to={b} />
        ) : (
          <motion.g
            key={i}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.1,
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ transformOrigin: `${o.cx}px ${o.cy}px` }}
          >
            <GradOrb {...o} from={a} to={b} />
          </motion.g>
        ),
      )}
    </g>
  );
}

/** Corner peek — one skewed pill cropped TL + one orb BL. */
export function FunkyCorners({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  return (
    <g>
      <motion.g
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SkewPill cx={40} cy={40} rx={120} ry={55} from={a} to={b} skewX={-40} rotate={-30} />
      </motion.g>
      <motion.g
        initial={reduce ? false : { scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "60px 580px" }}
      >
        <GradOrb cx={60} cy={580} r={100} from={a} to={b} />
      </motion.g>
    </g>
  );
}

/** Slow tumbling skewed pill (idle funk). */
export function FunkyTumblePill({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  return (
    <motion.g
      style={{ transformOrigin: "280px 520px" }}
      animate={
        reduce
          ? undefined
          : { rotate: [-8, 6, -8], y: [0, -6, 0] }
      }
      transition={
        reduce
          ? undefined
          : { duration: 10, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <SkewPill
        cx={280}
        cy={520}
        rx={90}
        ry={40}
        from={a}
        to={b}
        skewX={-36}
        rotate={12}
        scaleX={1.25}
        scaleY={0.65}
      />
    </motion.g>
  );
}

/** Two halves as skewed pills approaching (reunion). */
export function FunkyMeetPills({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  return (
    <g>
      <motion.g
        initial={reduce ? false : { x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <SkewPill cx={100} cy={540} rx={95} ry={42} from={a} to={b} skewX={20} rotate={8} />
      </motion.g>
      <motion.g
        initial={reduce ? false : { x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <SkewPill cx={260} cy={550} rx={95} ry={42} from={b} to={a} skewX={-20} rotate={-8} />
      </motion.g>
    </g>
  );
}

/** Single big skewed pill exiting (soft close). */
export function FunkyExitPill({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  return (
    <motion.g
      initial={false}
      animate={
        reduce
          ? { x: 200, y: 40, opacity: 0.55 }
          : { x: [160, 380], y: [50, 30], opacity: [0.7, 0.35] }
      }
      transition={
        reduce
          ? undefined
          : { duration: 18, repeat: Infinity, ease: "linear" }
      }
    >
      <SkewPill cx={0} cy={0} rx={100} ry={44} from={a} to={b} skewX={-30} rotate={-16} />
    </motion.g>
  );
}

/** Share stamp — skewed pill + orb pair behind card. */
export function FunkyShareStamp({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  return (
    <g>
      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "200px 200px" }}
      >
        <SkewPill cx={200} cy={180} rx={130} ry={50} from={a} to={b} skewX={-34} rotate={-20} />
        <SkewPill
          cx={220}
          cy={230}
          rx={110}
          ry={45}
          from={a}
          to={b}
          skewX={-26}
          rotate={-12}
          opacity={0.85}
        />
      </motion.g>
      <GradOrb cx={300} cy={560} r={80} from={a} to={b} />
    </g>
  );
}

/** Orb rain — few orbs with different skews/scales, cascade then drift. */
export function FunkyOrbRain({ a, b, freeze }: FunkyProps) {
  const reduce = useReducedMotion() || freeze;
  const items = [
    { cx: 50, cy: 120, r: 28, t: "skewX(-20) scale(1.2 0.75)", d: 0 },
    { cx: 310, cy: 90, r: 36, t: "skewX(18) scale(0.9 1.15)", d: 0.12 },
    { cx: 40, cy: 500, r: 48, t: "skewX(-12) scale(1.1 0.85)", d: 0.2 },
    { cx: 300, cy: 540, r: 32, t: "rotate(15) scale(1.15 0.8)", d: 0.28 },
  ];
  return (
    <g>
      {items.map((it, i) => (
        <motion.g
          key={i}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={
            reduce
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
      ))}
    </g>
  );
}

/** Double pill stack — top + mirrored bottom bookend. */
export function FunkyDoubleStack({ a, b, freeze }: FunkyProps) {
  return (
    <g>
      <FunkyPillStack a={a} b={b} freeze={freeze} />
      <g transform="translate(0 420) scale(1 -1) translate(0 -200)">
        <FunkyPillStack a={a} b={b} freeze={freeze} />
      </g>
    </g>
  );
}

/** One loud corner orb BR. */
export function FunkyBigCornerOrb({ a, b }: FunkyProps) {
  return (
    <GradOrb
      cx={310}
      cy={560}
      r={110}
      from={a}
      to={b}
      transform="skewX(-14) scale(1.08 0.9)"
    />
  );
}

export type FunkyShareKind =
  | "orb-rain"
  | "double-stack"
  | "big-corner-orb"
  | "orb-row"
  | "corner-rain";

export function FunkyShareArt({
  kind,
  a,
  b,
  freeze,
}: FunkyProps & { kind: FunkyShareKind }) {
  const p = { a, b, freeze };
  switch (kind) {
    case "orb-rain":
    case "corner-rain":
      return <FunkyOrbRain {...p} />;
    case "double-stack":
      return <FunkyDoubleStack {...p} />;
    case "big-corner-orb":
      return <FunkyBigCornerOrb {...p} />;
    case "orb-row":
      return <FunkyOrbRow {...p} />;
  }
}
