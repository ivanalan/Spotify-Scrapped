"use client";

import { heart } from "ionicons/icons";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/Icon";

type Props = {
  /** Hero (setup beats) vs edge-rising list frame (D-015). */
  mode: "hero" | "frame";
  freeze?: boolean;
  /** Remount key so grow-in replays on revisit. */
  replayKey?: number;
};

/** Ionicons heart path (512 viewBox): outline + fill layers share it. */
const HEART_PATH =
  "M256 448l-35.5-32.3C132 334 48 258.6 48 168.4 48 105.1 97.5 56 160.4 56c36.3 0 70.8 17.2 95.6 46.1C280.8 73.2 315.3 56 351.6 56 414.5 56 464 105.1 464 168.4c0 90.2-84 165.6-172.5 247.3L256 448z";

/**
 * Keep in sync with `--mm-heart-spark-at` in middeck-metaphors.css
 * (after draw + hold + fill start).
 */
const HEART_SPARK_AT_SEC = 3.1;

/**
 * Polar burst: Motion (x/y/opacity only). CSS keyframes + delay + `both`
 * were hitching at the start/end; Motion runs on the compositor without
 * fill-mode/delay fights.
 */
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const mag = 118 + (i % 3) * 36;
  const sizePx = i % 3 === 0 ? 7 : i % 2 === 0 ? 10 : 12;
  return {
    px: Math.round(Math.cos(angle) * mag),
    py: Math.round(Math.sin(angle) * mag),
    sizePx,
    delaySec: (i % 5) * 0.055,
    durSec: 1.7 + (i % 4) * 0.22,
    tone: i % 3 === 1 ? "gold" : i % 4 === 0 ? "rose" : "pink",
  };
});

/**
 * 4A one-like heart: stroke-draw outline → fill → pop → polar sparks.
 *
 * - Outline drawn via pathLength + stroke-dashoffset (no scale-in grow)
 * - Dual SVG paths; spring pop on HTML wrapper when fill lands
 * - Sparks: Motion x/y/opacity burst behind the heart (no CSS keyframe sparks)
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
  const animate = freeze ? "0" : "1";
  const playSparks = mode === "hero" && !freeze && !reduceMotion;

  return (
    <div
      key={`heart-scene-${replayKey}`}
      className="scrapped-middeck mm-heart-scene"
      data-mode={mode}
      data-animate={animate}
      aria-hidden
    >
      <div className="mm-heart-hero">
        <div className="mm-heart-sparks">
          {SPARKS.map((s, i) => (
            <motion.span
              key={`${replayKey}-spark-${i}`}
              className={`mm-heart-spark mm-heart-spark--${s.tone}`}
              style={{
                width: s.sizePx,
                height: s.sizePx,
                marginLeft: -s.sizePx / 2,
                marginTop: -s.sizePx / 2,
              }}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={
                playSparks
                  ? {
                      opacity: [0, 1, 0],
                      x: [0, s.px * 0.22, s.px],
                      y: [0, s.py * 0.22, s.py],
                    }
                  : { opacity: 0, x: 0, y: 0 }
              }
              transition={
                playSparks
                  ? {
                      duration: s.durSec,
                      delay: HEART_SPARK_AT_SEC + s.delaySec,
                      ease: "easeOut",
                      times: [0, 0.2, 1],
                    }
                  : { duration: 0 }
              }
            />
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
