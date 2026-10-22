"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Phone orbit path (D-009): legacy MotifStage when narrow or portrait.
 * SSR + first paint default to phone so mobile never flashes pins.
 */
export const PHONE_ORBIT_MQ =
  "(max-width: 480px), (max-aspect-ratio: 3/4)";

function subscribePhoneOrbit(onChange: () => void) {
  const mq = window.matchMedia(PHONE_ORBIT_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getPhoneOrbitSnapshot() {
  return window.matchMedia(PHONE_ORBIT_MQ).matches;
}

/** True → use legacy MotifStage; false → wide MotifPin composition. */
export function usePhoneOrbitArt(): boolean {
  return useSyncExternalStore(
    subscribePhoneOrbit,
    getPhoneOrbitSnapshot,
    () => true,
  );
}

/** Short viewport side: pin sizing basis (full-bleed slides). */
const SHORT = "min(100vw, 100dvh)";

export type MotifPinAnchor =
  | "tl"
  | "tr"
  | "bl"
  | "br"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-center"
  | "bottom-center"
  | "center";

const ANCHOR_CLASS: Record<MotifPinAnchor, string> = {
  tl: "left-0 top-0",
  tr: "right-0 top-0",
  bl: "left-0 bottom-0",
  br: "right-0 bottom-0",
  top: "inset-x-0 top-0",
  bottom: "inset-x-0 bottom-0",
  left: "left-0 inset-y-0",
  right: "right-0 inset-y-0",
  "top-center": "left-1/2 top-0 -translate-x-1/2",
  "bottom-center": "left-1/2 bottom-0 -translate-x-1/2",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

type MotifPinProps = {
  anchor: MotifPinAnchor;
  viewBox: string;
  children: ReactNode;
  /**
   * Box size as a fraction of the short viewport side.
   * Ignored when `width` / `height` are set explicitly.
   */
  size?: number;
  /** CSS length, or a number as a fraction of the short side. */
  width?: string | number;
  /** CSS length, or a number as a fraction of the short side. */
  height?: string | number;
  preserveAspectRatio?: string;
  className?: string;
};

function shortFrac(n: number): string {
  return `calc(${n} * ${SHORT})`;
}

function dim(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? shortFrac(value) : value;
}

/**
 * Edge-anchored SVG motif for wide viewports (D-009).
 */
export function MotifPin({
  anchor,
  viewBox,
  children,
  size = 0.48,
  width,
  height,
  preserveAspectRatio = "xMidYMid meet",
  className,
}: MotifPinProps) {
  const style: CSSProperties =
    width !== undefined || height !== undefined
      ? { width: dim(width), height: dim(height) }
      : { width: shortFrac(size), height: shortFrac(size) };

  return (
    <div
      className={cn("pointer-events-none absolute", ANCHOR_CLASS[anchor], className)}
      style={style}
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden
      >
        {children}
      </svg>
    </div>
  );
}

type MotifCornerOriginProps = {
  /** Corner that owns this motif (phone: disks TL, star BR). */
  corner: "tl" | "br" | "tr" | "bl";
  /** Motif center in design units (matches phone MotifStage coords). */
  cx: number;
  cy: number;
  /** Half-extent from center: viewBox includes the full motif. */
  radius: number;
  /** Pin diameter as a fraction of the short side. */
  size?: number;
  children: ReactNode;
  className?: string;
};

/**
 * Pin box centered on the viewport corner: motif design-space center
 * lands exactly on TL / TR / BL / BR of the slide.
 */
const CORNER_ORIGIN_CLASS: Record<MotifCornerOriginProps["corner"], string> = {
  tl: "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  tr: "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  bl: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  br: "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
};

/**
 * Motif center → viewport corner (disks TL, star BR).
 * Full motif in the viewBox; slide `overflow-hidden` clips the outer half.
 */
export function MotifCornerOrigin({
  corner,
  cx,
  cy,
  radius,
  size = 0.9,
  children,
  className,
}: MotifCornerOriginProps) {
  const viewBox = `${cx - radius} ${cy - radius} ${radius * 2} ${radius * 2}`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute overflow-visible",
        CORNER_ORIGIN_CLASS[corner],
        className,
      )}
      style={{ width: shortFrac(size), height: shortFrac(size) }}
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {children}
      </svg>
    </div>
  );
}

/**
 * Full-slide SVG stage for centered systems on wide viewports.
 * Default `meet` shows the whole portrait design (may letterbox: banned for
 * production ghosted/orbit fields). Pass `slice` so the field covers the
 * slide with no phone-frame gutters (SOUL / D-009).
 */
export function MotifMeetStage({
  children,
  className,
  viewBox = "0 0 360 640",
  preserveAspectRatio = "xMidYMid meet",
}: {
  children: ReactNode;
  className?: string;
  viewBox?: string;
  preserveAspectRatio?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <svg
        className="h-full w-full"
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden
      >
        {children}
      </svg>
    </div>
  );
}
