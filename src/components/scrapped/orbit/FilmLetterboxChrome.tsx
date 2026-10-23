"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  /** Setup = present (no enter); reunion list / reveal = slow retract. */
  mode: "in" | "out";
  freeze?: boolean;
  replayKey?: number;
};

/** Match `.mm-film` CSS tokens (D-016). */
const SPROCKET_W = 12;
const SPROCKET_GAP = 25;
const SPROCKET_PAD_X = 10;
const PITCH = SPROCKET_W + SPROCKET_GAP;
/** Row is `min-width: 200%`; fill that so scroll travel never reveals empty strip. */
const COVERAGE = 2;
const MIN_PERFS = 32;

function perfsForWidth(width: number): number {
  if (width <= 0) return MIN_PERFS;
  const target = width * COVERAGE;
  const needed = Math.ceil(
    (target - 2 * SPROCKET_PAD_X + SPROCKET_GAP) / PITCH,
  );
  return Math.max(MIN_PERFS, needed);
}

function PerfRow({ count }: { count: number }) {
  return (
    <div className="mm-film-perfs">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

/**
 * 7L film letterbox: bars present from scene start, inset sprockets,
 * smooth continuous scroll; long retract when list / reveal enters.
 * Geometry / scroll: D-016 (smooth travel 20%, ~6s / 7.2s linear).
 * Perf count tracks strip width so wide viewports stay fully punched.
 */
export function FilmLetterboxChrome({
  mode,
  freeze = false,
  replayKey = 0,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [perfCount, setPerfCount] = useState(MIN_PERFS);
  const animate = freeze ? "0" : "1";
  const dataMode = freeze
    ? mode === "in"
      ? "settled-in"
      : "settled-out"
    : mode;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setPerfCount(perfsForWidth(el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [replayKey]);

  // Key on replay only: including `mode` remounted the tree when retract
  // started and snapped sprocket scroll back to translateX(0).
  return (
    <div
      key={`film-${replayKey}`}
      ref={rootRef}
      className="scrapped-middeck mm-film"
      data-mode={dataMode}
      data-animate={animate}
      aria-hidden
    >
      <div className="mm-film-strip top">
        <PerfRow count={perfCount} />
      </div>
      <div className="mm-film-strip bot">
        <PerfRow count={perfCount} />
      </div>
    </div>
  );
}
