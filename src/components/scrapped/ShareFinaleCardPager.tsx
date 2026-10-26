"use client";

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { SHARE_FINALE_DENSITY as D } from "@/lib/scrapped-card-palette";

/** Shareable posters on scene 9 (Wrapped-form multi-card finale). */
export const SHARE_FINALE_CARD_COUNT = 2;

/** Commit when the finger passes this fraction of the shell width. */
const SNAP_RATIO = 0.22;
/** Recent travel (px/ms) that commits even on a short flick. */
const FLICK_VELOCITY = 0.55;

type PagerProps = {
  index: number;
  onIndexChange: (index: number) => void;
  /** One child per share card (same shell size each). */
  children: ReactNode;
  shellClassName?: string;
  shellStyle?: CSSProperties;
};

type DragSession = {
  pointerId: number;
  startX: number;
  lastX: number;
  lastAt: number;
  /** Recent samples for flick velocity (not whole-gesture average). */
  samples: { x: number; t: number }[];
};

/**
 * Horizontal share-card pager (D-042). Pointer swipe + transform only: nested
 * overflow scroll would fight the deck’s snap-x scroller. Always snaps to a
 * whole card; blocks text selection on web so drag does not highlight copy.
 */
export function ShareFinaleCardPager({
  index,
  onIndexChange,
  children,
  shellClassName,
  shellStyle,
}: PagerProps) {
  const pages = Children.toArray(children);
  const count = pages.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const indexRef = useRef(index);
  const widthRef = useRef(0);
  const [width, setWidth] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    indexRef.current = index;
  }, [index]);

  useLayoutEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const measure = () => {
      const w = node.clientWidth;
      widthRef.current = w;
      setWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const clampIndex = useCallback(
    (next: number) => Math.max(0, Math.min(count - 1, next)),
    [count],
  );

  const settle = useCallback(
    (offsetX: number, velocityX: number) => {
      const w = widthRef.current;
      const from = indexRef.current;
      if (w <= 0 || count <= 1) {
        setDragX(0);
        setDragging(false);
        return;
      }

      let next = from;
      const threshold = w * SNAP_RATIO;
      if (offsetX < -threshold || velocityX < -FLICK_VELOCITY) {
        next = from + 1;
      } else if (offsetX > threshold || velocityX > FLICK_VELOCITY) {
        next = from - 1;
      }
      next = clampIndex(next);

      // Drop the rubber-band offset before animating so we never park mid-card.
      setDragX(0);
      setDragging(false);
      if (next !== from) onIndexChange(next);
    },
    [clampIndex, count, onIndexChange],
  );

  const endSession = useCallback(
    (pointerId: number) => {
      const session = dragRef.current;
      if (!session || session.pointerId !== pointerId) return;
      dragRef.current = null;

      const samples = session.samples;
      let velocityX = 0;
      if (samples.length >= 2) {
        const newest = samples[samples.length - 1]!;
        const oldest = samples[0]!;
        const dt = Math.max(1, newest.t - oldest.t);
        velocityX = (newest.x - oldest.x) / dt;
      }
      const offsetX = session.lastX - session.startX;
      settle(offsetX, velocityX);

      document.body.style.removeProperty("user-select");
      document.body.style.removeProperty("-webkit-user-select");

      const node = viewportRef.current;
      if (node?.hasPointerCapture(pointerId)) {
        node.releasePointerCapture(pointerId);
      }
    },
    [settle],
  );

  // Window listeners: pointerup outside the shell must still snap (no mid park).
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      const session = dragRef.current;
      if (!session || session.pointerId !== e.pointerId) return;
      const raw = e.clientX - session.startX;
      const from = indexRef.current;
      const atStart = from <= 0 && raw > 0;
      const atEnd = from >= count - 1 && raw < 0;
      setDragX(atStart || atEnd ? raw * 0.35 : raw);

      const now = performance.now();
      session.lastX = e.clientX;
      session.lastAt = now;
      session.samples.push({ x: e.clientX, t: now });
      while (
        session.samples.length > 1 &&
        now - session.samples[0]!.t > 80
      ) {
        session.samples.shift();
      }
    };

    const onUp = (e: PointerEvent) => endSession(e.pointerId);
    const onCancel = (e: PointerEvent) => endSession(e.pointerId);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [count, dragging, endSession]);

  // Safety: if drag flag is somehow left on, snap home on unmount / index jump.
  useEffect(() => {
    if (dragging) return;
    setDragX(0);
  }, [index, dragging]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (count <= 1 || e.button !== 0) return;
      const measured = e.currentTarget.clientWidth;
      if (measured <= 0) return;
      widthRef.current = measured;
      if (measured !== width) setWidth(measured);

      // Kill text-selection gesture on web before the browser starts one.
      e.preventDefault();
      e.stopPropagation();
      window.getSelection()?.removeAllRanges();
      document.body.style.userSelect = "none";
      document.body.style.setProperty("-webkit-user-select", "none");

      const now = performance.now();
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        lastX: e.clientX,
        lastAt: now,
        samples: [{ x: e.clientX, t: now }],
      };
      setDragging(true);
      setDragX(0);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [count, width],
  );

  const onLostCapture = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      endSession(e.pointerId);
    },
    [endSession],
  );

  const baseX = width > 0 ? -index * width : 0;
  const x = baseX + dragX;

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative touch-none select-none overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)]",
        shellClassName,
      )}
      style={{
        ...shellStyle,
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      aria-roledescription="carousel"
      aria-label="Share cards"
      onPointerDown={onPointerDown}
      onLostPointerCapture={onLostCapture}
    >
      <div
        className="flex h-full min-h-full select-none"
        style={{
          width: width > 0 ? width * count : `${count * 100}%`,
          height: "100%",
          transform: `translate3d(${x}px, 0, 0)`,
          transition:
            dragging || reduceMotion
              ? "none"
              : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {pages.map((page, i) => (
          <div
            key={i}
            className="relative h-full min-h-full shrink-0 select-none"
            style={{
              width: width > 0 ? width : `${100 / count}%`,
              height: "100%",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
            aria-hidden={i !== index}
          >
            {page}
          </div>
        ))}
      </div>
    </div>
  );
}

type DotsProps = {
  index: number;
  count?: number;
  onIndexChange: (index: number) => void;
  className?: string;
};

/** Wrapped-form pagination under the share island (D-042). */
export function ShareFinaleCardDots({
  index,
  count = SHARE_FINALE_CARD_COUNT,
  onIndexChange,
  className,
}: DotsProps) {
  if (count <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="Share card"
      className={cn("flex shrink-0 items-center justify-center", className)}
      style={{ gap: D.dotsGapPx }}
    >
      {Array.from({ length: count }, (_, i) => {
        const selected = i === index;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`Share card ${i + 1} of ${count}`}
            tabIndex={selected ? 0 : -1}
            className="flex size-10 items-center justify-center touch-manipulation"
            onClick={() => onIndexChange(i)}
          >
            <span
              className={cn(
                "block rounded-full bg-[#f5f5f5] transition-opacity",
                selected ? "opacity-100" : "opacity-35",
              )}
              style={{
                width: D.dotSizePx,
                height: D.dotSizePx,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
