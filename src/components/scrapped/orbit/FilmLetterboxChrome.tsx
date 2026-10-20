"use client";

type Props = {
  /** Setup = present (no enter); reunion list / reveal = slow retract. */
  mode: "in" | "out";
  freeze?: boolean;
  replayKey?: number;
};

const PERF_COUNT = 16;

function PerfRow() {
  return (
    <div className="mm-film-perfs">
      {Array.from({ length: PERF_COUNT * 2 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

/**
 * 7L film letterbox — 14.5% bars present from scene start, inset sprockets,
 * 1.7s / 5-step stutter; long smooth retract when the list / reveal beat enters.
 * Locked: D-016.
 */
export function FilmLetterboxChrome({
  mode,
  freeze = false,
  replayKey = 0,
}: Props) {
  const animate = freeze ? "0" : "1";
  const dataMode = freeze
    ? mode === "in"
      ? "settled-in"
      : "settled-out"
    : mode;

  return (
    <div
      key={`film-${mode}-${replayKey}`}
      className="scrapped-middeck mm-film"
      data-mode={dataMode}
      data-animate={animate}
      aria-hidden
    >
      <div className="mm-film-strip top">
        <PerfRow />
      </div>
      <div className="mm-film-strip bot">
        <PerfRow />
      </div>
    </div>
  );
}
