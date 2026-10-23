"use client";

import type { CSSProperties } from "react";
import { heart } from "ionicons/icons";
import { useReducedMotion } from "motion/react";
import { Icon } from "@/components/Icon";

type Props = {
  /** Hero (setup beats) vs edge-rising list frame (D-015). */
  mode: "hero" | "frame";
  freeze?: boolean;
  /** Remount key so grow-in replays on revisit. */
  replayKey?: number;
};

/** Ionicons heart path (512 viewBox): outline + fill + cascade layers share it. */
const HEART_PATH =
  "M256 448l-35.5-32.3C132 334 48 258.6 48 168.4 48 105.1 97.5 56 160.4 56c36.3 0 70.8 17.2 95.6 46.1C280.8 73.2 315.3 56 351.6 56 414.5 56 464 105.1 464 168.4c0 90.2-84 165.6-172.5 247.3L256 448z";

/**
 * s03 cascade: 3 filled hearts behind the hero.
 * Grow to max → hold scale → opacity fade (inner→outer die).
 * Peaks / stagger / fade ladder from docs/mocks/heart-animation-ideas.html.
 */
const CASCADE = [
  { peak: 1.25, tone: "pink" as const },
  { peak: 1.55, tone: "rose" as const },
  { peak: 1.9, tone: "gold" as const },
];

/**
 * 4A one-like heart: stroke-draw outline → stamp fill → s03 cascade bloom.
 *
 * - Outline drawn via pathLength + stroke-dashoffset (linear)
 * - Soft stamp pop on HTML wrapper when fill lands
 * - Cascade: 3 filled hearts grow to max, then fade at max scale (no dwindle)
 *
 * List: perimeter rising hearts. `mode` → frame at list narrative
 * (scene 4: beatPhase ≥ 3) so exit matches Meet-copy outro.
 */
export function OneLikeHeartChrome({
  mode,
  freeze = false,
  replayKey = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const animate = freeze || reduceMotion ? "0" : "1";

  return (
    <div
      key={`heart-scene-${replayKey}`}
      className="scrapped-middeck mm-heart-scene"
      data-mode={mode}
      data-animate={animate}
      aria-hidden
    >
      <div className="mm-heart-hero">
        <div className="mm-heart-cascade">
          {CASCADE.map((layer, i) => (
            <div
              key={`${replayKey}-bloom-${i}`}
              className={`mm-heart-bloom mm-heart-bloom--${layer.tone} mm-heart-bloom--${i + 1}`}
              style={
                {
                  "--mm-bloom-peak": String(layer.peak),
                } as CSSProperties
              }
            >
              <svg viewBox="0 0 512 512" width="128" height="128">
                <path d={HEART_PATH} />
              </svg>
            </div>
          ))}
        </div>
        {/* Scale lives here: not on <svg> (Chromium rasterizes transformed SVG). */}
        <div className="mm-heart-pop">
          <svg
            className="mm-heart-glyph"
            viewBox="0 0 512 512"
            width="128"
            height="128"
          >
            <path
              className="mm-heart-outline"
              d={HEART_PATH}
              pathLength={1}
            />
            <path className="mm-heart-fill" d={HEART_PATH} />
          </svg>
        </div>
      </div>
      <div className="mm-heart-frame">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="mm-heart-floater">
            <Icon icon={heart} className="mm-floater-ico" />
          </div>
        ))}
      </div>
    </div>
  );
}
