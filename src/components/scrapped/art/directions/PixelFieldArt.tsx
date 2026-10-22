"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { ContentCard, PIXEL_COLORS } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

const CELL = 18;
const COLORS = [...PIXEL_COLORS];

/** Chunked digital assembly: cells rain in, then idle pulse. */
export function PixelFieldArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overview = isOverview(surface);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 360;
    const h = 640;
    canvas.width = w;
    canvas.height = h;

    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    type Cell = {
      x: number;
      y: number;
      color: string;
      appear: number;
      phase: number;
    };
    const cells: Cell[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        // Keep center band clearer for content
        const nx = c / cols - 0.5;
        const ny = r / rows - 0.5;
        const edge = Math.max(Math.abs(nx), Math.abs(ny));
        if (edge < 0.28) continue;
        if (Math.random() > 0.55 + edge * 0.35) continue;
        cells.push({
          x: c * CELL,
          y: r * CELL,
          color: COLORS[(c + r) % COLORS.length]!,
          appear: (c + r * 0.35) * 0.045 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let raf = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.fillStyle = "#12081f";
      ctx.fillRect(0, 0, w, h);

      for (const cell of cells) {
        let alpha = 1;
        if (overview && !reduce) {
          const cycle = t % 5.5;
          if (cycle < cell.appear) alpha = 0;
          else if (cycle < cell.appear + 0.35) {
            alpha = (cycle - cell.appear) / 0.35;
          } else if (cycle > 4.6) {
            alpha = Math.max(0, 1 - (cycle - 4.6) / 0.9);
          } else {
            alpha = 0.75 + 0.25 * Math.sin(t * 2.2 + cell.phase);
          }
        } else if (!overview) {
          alpha = 0.55;
        }
        if (alpha <= 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = cell.color;
        const s = overview && !reduce ? CELL - 2 : CELL - 3;
        ctx.fillRect(cell.x + 1, cell.y + 1, s, s);
      }
      ctx.globalAlpha = 1;

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    if (reduce) {
      draw(t0);
    } else {
      raf = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(raf);
  }, [overview, reduce]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#12081f]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      />
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
