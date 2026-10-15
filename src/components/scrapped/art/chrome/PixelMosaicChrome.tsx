"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard, PIXEL_COLORS } from "./carnival-palette";

type Block = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  dur: number;
};

function mosaicCorner(
  ox: number,
  oy: number,
  dirX: 1 | -1,
  dirY: 1 | -1,
  seed: number,
): Block[] {
  const blocks: Block[] = [];
  const sizes = [14, 20, 28, 16, 24, 18, 32, 12];
  let x = ox;
  let y = oy;
  for (let i = 0; i < 14; i += 1) {
    const s = sizes[i % sizes.length]!;
    blocks.push({
      x: dirX === 1 ? x : x - s,
      y: dirY === 1 ? y : y - s,
      w: s,
      h: s,
      color: PIXEL_COLORS[(seed + i) % PIXEL_COLORS.length]!,
      dur: 2 + (i % 5) * 0.4,
    });
    if (i % 3 === 0) x += dirX * (s * 0.7);
    else if (i % 3 === 1) y += dirY * (s * 0.7);
    else {
      x += dirX * (s * 0.45);
      y += dirY * (s * 0.45);
    }
  }
  return blocks;
}

const BLOCKS = [
  ...mosaicCorner(8, 8, 1, 1, 0),
  ...mosaicCorner(352, 8, -1, 1, 2),
  ...mosaicCorner(8, 632, 1, -1, 4),
  ...mosaicCorner(352, 632, -1, -1, 1),
];

/** Dense irregular pixel clusters in the corners. */
export function PixelMosaicChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0" style={{ background: CARNIVAL.void }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(150deg, ${CARNIVAL.purple} 0%, ${CARNIVAL.void} 50%, #080314 100%)`,
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {BLOCKS.map((b, i) => (
          <motion.rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={b.color}
            rx={2}
            animate={
              reduce
                ? undefined
                : {
                    opacity: [0.7, 1, 0.7],
                    y: [b.y, b.y + (i % 2 === 0 ? 5 : -5), b.y],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: b.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (i % 10) * 0.1,
                  }
            }
          />
        ))}
      </svg>
      <ContentCard inset="15%" />
    </div>
  );
}
