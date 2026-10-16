"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContentCard } from "./carnival-palette";

/** Flat Bauhaus / constructivist palette from the art-lab reference. */
const P = {
  ink: "#141414",
  teal: "#12c4b0",
  coral: "#f05a3d",
  yellow: "#f5c518",
  blue: "#2f6bff",
  pink: "#e84a8a",
} as const;

const COLS = 6;
const ROWS = 11;
const S = 360 / COLS; // 60

type Motif =
  | "solid"
  | "diag-tl"
  | "diag-br"
  | "q-bl"
  | "q-tr"
  | "q-tl"
  | "q-br"
  | "wave"
  | "burst";

type Cell = { m: Motif; a: string; b?: string };

/**
 * Hand-authored grid so curves read as continuous flows
 * (closer to the reference than pure random tiles).
 */
const LAYOUT: Cell[][] = [
  [
    { m: "q-br", a: P.teal, b: P.coral },
    { m: "diag-tl", a: P.yellow, b: P.blue },
    { m: "q-bl", a: P.pink, b: P.ink },
    { m: "burst", a: P.yellow },
    { m: "q-tr", a: P.teal, b: P.coral },
    { m: "diag-br", a: P.blue, b: P.yellow },
  ],
  [
    { m: "diag-br", a: P.coral, b: P.ink },
    { m: "wave", a: P.teal, b: P.yellow },
    { m: "q-tr", a: P.blue, b: P.pink },
    { m: "q-bl", a: P.coral, b: P.teal },
    { m: "diag-tl", a: P.ink, b: P.yellow },
    { m: "q-tl", a: P.pink, b: P.blue },
  ],
  [
    { m: "q-tr", a: P.yellow, b: P.teal },
    { m: "burst", a: P.pink },
    { m: "diag-tl", a: P.coral, b: P.blue },
    { m: "wave", a: P.yellow, b: P.ink },
    { m: "q-br", a: P.pink, b: P.teal },
    { m: "solid", a: P.coral },
  ],
  [
    { m: "wave", a: P.blue, b: P.coral },
    { m: "q-bl", a: P.yellow, b: P.pink },
    { m: "diag-br", a: P.teal, b: P.ink },
    { m: "q-tl", a: P.coral, b: P.yellow },
    { m: "burst", a: P.teal },
    { m: "q-tr", a: P.blue, b: P.ink },
  ],
  [
    { m: "diag-tl", a: P.pink, b: P.teal },
    { m: "q-br", a: P.blue, b: P.yellow },
    { m: "solid", a: P.ink },
    { m: "q-tr", a: P.coral, b: P.pink },
    { m: "diag-br", a: P.yellow, b: P.blue },
    { m: "wave", a: P.pink, b: P.teal },
  ],
  [
    { m: "burst", a: P.coral },
    { m: "diag-br", a: P.teal, b: P.pink },
    { m: "q-bl", a: P.yellow, b: P.blue },
    { m: "wave", a: P.coral, b: P.ink },
    { m: "q-tl", a: P.teal, b: P.yellow },
    { m: "diag-tl", a: P.blue, b: P.coral },
  ],
  [
    { m: "q-tl", a: P.yellow, b: P.ink },
    { m: "wave", a: P.pink, b: P.blue },
    { m: "diag-tl", a: P.coral, b: P.teal },
    { m: "burst", a: P.yellow },
    { m: "q-br", a: P.blue, b: P.pink },
    { m: "solid", a: P.teal },
  ],
  [
    { m: "diag-br", a: P.blue, b: P.yellow },
    { m: "q-tr", a: P.coral, b: P.ink },
    { m: "burst", a: P.teal },
    { m: "q-bl", a: P.pink, b: P.yellow },
    { m: "diag-tl", a: P.ink, b: P.coral },
    { m: "wave", a: P.yellow, b: P.blue },
  ],
  [
    { m: "wave", a: P.teal, b: P.pink },
    { m: "diag-tl", a: P.yellow, b: P.coral },
    { m: "q-br", a: P.blue, b: P.ink },
    { m: "solid", a: P.pink },
    { m: "q-tr", a: P.yellow, b: P.teal },
    { m: "burst", a: P.coral },
  ],
  [
    { m: "q-bl", a: P.coral, b: P.blue },
    { m: "burst", a: P.yellow },
    { m: "wave", a: P.teal, b: P.ink },
    { m: "diag-br", a: P.pink, b: P.yellow },
    { m: "q-tl", a: P.blue, b: P.coral },
    { m: "diag-tl", a: P.teal, b: P.pink },
  ],
  [
    { m: "diag-tl", a: P.ink, b: P.yellow },
    { m: "q-tr", a: P.pink, b: P.teal },
    { m: "solid", a: P.coral },
    { m: "q-bl", a: P.blue, b: P.yellow },
    { m: "wave", a: P.coral, b: P.blue },
    { m: "q-br", a: P.yellow, b: P.ink },
  ],
];

function Starburst({
  cx,
  cy,
  r,
  color,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
}) {
  const spikes = 14;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.34;
    pts.push(
      `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`,
    );
  }
  return <polygon points={pts.join(" ")} fill={color} />;
}

function renderCell(x: number, y: number, cell: Cell) {
  const mid = S / 2;
  const bg = cell.b ?? P.ink;
  const fg = cell.a;

  switch (cell.m) {
    case "solid":
      return <rect x={x} y={y} width={S} height={S} fill={fg} />;
    case "diag-tl":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={bg} />
          <polygon
            points={`${x},${y} ${x + S},${y} ${x},${y + S}`}
            fill={fg}
          />
        </>
      );
    case "diag-br":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={bg} />
          <polygon
            points={`${x + S},${y} ${x + S},${y + S} ${x},${y + S}`}
            fill={fg}
          />
        </>
      );
    case "q-bl":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={bg} />
          <path
            d={`M ${x} ${y + S} A ${S} ${S} 0 0 1 ${x + S} ${y} L ${x + S} ${y + S} Z`}
            fill={fg}
          />
        </>
      );
    case "q-tr":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={bg} />
          <path
            d={`M ${x + S} ${y} A ${S} ${S} 0 0 1 ${x} ${y + S} L ${x} ${y} Z`}
            fill={fg}
          />
        </>
      );
    case "q-tl":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={bg} />
          <path
            d={`M ${x} ${y} A ${S} ${S} 0 0 1 ${x + S} ${y + S} L ${x} ${y + S} Z`}
            fill={fg}
          />
        </>
      );
    case "q-br":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={bg} />
          <path
            d={`M ${x + S} ${y + S} A ${S} ${S} 0 0 1 ${x} ${y} L ${x + S} ${y} Z`}
            fill={fg}
          />
        </>
      );
    case "wave":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={bg} />
          <path
            d={`M ${x} ${y + mid} A ${mid} ${mid} 0 0 1 ${x + mid} ${y} L ${x + mid} ${y + mid} Z`}
            fill={fg}
          />
          <path
            d={`M ${x + mid} ${y + S} A ${mid} ${mid} 0 0 1 ${x + S} ${y + mid} L ${x + mid} ${y + mid} Z`}
            fill={fg}
          />
        </>
      );
    case "burst":
      return (
        <>
          <rect x={x} y={y} width={S} height={S} fill={P.ink} />
          <Starburst cx={x + mid} cy={y + mid} r={S * 0.38} color={fg} />
        </>
      );
  }
}

/** Full-bleed Bauhaus tile grid — curves, diagonals, starbursts. */
export function BauhausTilesChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0" style={{ background: P.ink }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 360 ${ROWS * S}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {LAYOUT.map((row, r) =>
          row.map((cell, c) => {
            const index = r * COLS + c;
            return (
              <motion.g
                key={`${r}-${c}`}
                animate={
                  reduce
                    ? undefined
                    : { opacity: [0.9, 1, 0.9] }
                }
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: 3.4 + (index % 6) * 0.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: (index % 10) * 0.15,
                      }
                }
              >
                {renderCell(c * S, r * S, cell)}
              </motion.g>
            );
          }),
        )}
      </svg>
      <ContentCard inset="14%" />
    </div>
  );
}
