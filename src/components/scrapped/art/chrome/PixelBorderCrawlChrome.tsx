"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARNIVAL, ContentCard, PIXEL_COLORS } from "./carnival-palette";

type Cell = { x: number; y: number; color: string; delay: number };

const SIZE = 18;
const COLS = Math.floor(360 / SIZE);
const ROWS = Math.floor(640 / SIZE);

function buildBorder(): Cell[] {
  const cells: Cell[] = [];
  let n = 0;
  const push = (x: number, y: number) => {
    cells.push({
      x: x * SIZE,
      y: y * SIZE,
      color: PIXEL_COLORS[n % PIXEL_COLORS.length]!,
      delay: (n % 24) * 0.08,
    });
    n += 1;
  };
  for (let x = 0; x < COLS; x += 1) push(x, 0);
  for (let y = 1; y < ROWS; y += 1) push(COLS - 1, y);
  for (let x = COLS - 2; x >= 0; x -= 1) push(x, ROWS - 1);
  for (let y = ROWS - 2; y >= 1; y -= 1) push(0, y);
  return cells;
}

const BORDER = buildBorder();

/** Continuous pixel border that crawls / pulses around the frame. */
export function PixelBorderCrawlChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0" style={{ background: CARNIVAL.deep }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 42%, ${CARNIVAL.cyan}33, transparent 60%), ${CARNIVAL.purple}`,
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {BORDER.map((cell, i) => (
          <motion.rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={SIZE}
            height={SIZE}
            fill={cell.color}
            animate={
              reduce
                ? undefined
                : {
                    opacity: [0.35, 1, 0.35],
                    scale: [0.85, 1, 0.85],
                  }
            }
            style={{ originX: `${cell.x + SIZE / 2}px`, originY: `${cell.y + SIZE / 2}px` }}
            transition={
              reduce
                ? undefined
                : {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: cell.delay,
                  }
            }
          />
        ))}
      </svg>
      <ContentCard inset="12%" />
    </div>
  );
}
