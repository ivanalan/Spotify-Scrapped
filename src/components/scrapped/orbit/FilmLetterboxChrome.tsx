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
 * 7L film letterbox — bars present from scene start, inset sprockets,
 * smooth continuous scroll; long retract when list / reveal enters.
 * Geometry / scroll: D-016 (smooth travel 20%, ~6s / 7.2s linear).
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

  // Key on replay only — including `mode` remounted the tree when retract
  // started and snapped sprocket scroll back to translateX(0).
  return (
    <div
      key={`film-${replayKey}`}
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
