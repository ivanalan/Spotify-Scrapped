"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import rough from "roughjs";
import { animate, createScope, svg, stagger } from "animejs";
import { ContentCard } from "@/components/scrapped/art/chrome/carnival-palette";
import {
  contentInset,
  isOverview,
  type DirectionArtProps,
} from "./types";

const BG = "#f4f0e6";
const INK = "#1c1c1c";
const ACCENT = "#e85d3a";
const SECONDARY = "#2a6f6a";

/**
 * Hand-drawn anti-Wrapped notebook — Rough.js strokes drawn start→finish
 * via Anime.js createDrawable, then erase/redraw loop on overview.
 */
export function RoughSketchArt({ surface }: DirectionArtProps) {
  const reduce = useReducedMotion();
  const overview = isOverview(surface);
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    const root = rootRef.current;
    if (!el || !root) return;

    while (el.firstChild) el.removeChild(el.firstChild);

    const rc = rough.svg(el, {
      options: {
        roughness: 1.6,
        bowing: 1.2,
        stroke: INK,
        strokeWidth: 2.2,
        seed: 42,
      },
    });

    const shapes: SVGGElement[] = [];

    const frame = rc.rectangle(28, 48, 304, 544, {
      stroke: INK,
      strokeWidth: 2.5,
      fill: "none",
    }) as SVGGElement;
    shapes.push(frame);

    const circle = rc.circle(180, 160, 96, {
      stroke: ACCENT,
      strokeWidth: 2.4,
      fill: "none",
    }) as SVGGElement;
    shapes.push(circle);

    const box = rc.rectangle(70, 280, 220, 90, {
      stroke: SECONDARY,
      strokeWidth: 2.2,
      fill: "none",
    }) as SVGGElement;
    shapes.push(box);

    const zig = rc.path("M60 420 L120 460 L180 410 L240 470 L300 430", {
      stroke: ACCENT,
      strokeWidth: 2.6,
      fill: "none",
    }) as SVGGElement;
    shapes.push(zig);

    const arc = rc.arc(180, 520, 160, 60, Math.PI, Math.PI * 2, false, {
      stroke: SECONDARY,
      strokeWidth: 2.2,
      fill: "none",
    }) as SVGGElement;
    shapes.push(arc);

    for (const g of shapes) {
      // Ensure strokes are drawable (no fills competing with dashoffset)
      g.querySelectorAll("path").forEach((p) => {
        p.setAttribute("fill", "none");
        p.classList.add("rough-stroke");
      });
      el.appendChild(g);
    }

    const clear = () => {
      while (el.firstChild) el.removeChild(el.firstChild);
    };

    if (reduce || !overview) {
      return clear;
    }

    const scope = createScope({ root });
    scope.add(() => {
      animate(svg.createDrawable(".rough-stroke"), {
        draw: ["0 0", "0 1", "0 1", "1 1"],
        ease: "inOutQuad",
        duration: 2800,
        delay: stagger(180),
        loop: true,
        loopDelay: 900,
      });
    });

    return () => {
      scope.revert();
      clear();
    };
  }, [overview, reduce]);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: BG }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ opacity: overview ? 1 : 0.55 }}
      />
      <ContentCard inset={contentInset(surface)} />
    </div>
  );
}
