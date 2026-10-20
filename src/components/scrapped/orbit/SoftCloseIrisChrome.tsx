"use client";

type Props = {
  freeze?: boolean;
  replayKey?: number;
};

/**
 * 8B soft-close iris — mono teal stepped rings, shrink 72% → 10% then hold.
 * Replaces funky pill bookends (D-016).
 */
export function SoftCloseIrisChrome({
  freeze = false,
  replayKey = 0,
}: Props) {
  return (
    <div
      key={`iris-${replayKey}`}
      className="scrapped-middeck mm-iris"
      data-animate={freeze ? "0" : "1"}
      aria-hidden
    />
  );
}
