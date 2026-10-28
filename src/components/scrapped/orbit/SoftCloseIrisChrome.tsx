"use client";

import type { CSSProperties } from "react";
import { ONE_LIKE_HEART } from "@/lib/scrapped-card-palette";

type Props = {
  freeze?: boolean;
  replayKey?: number;
};

/** Same Ionicons heart path as OneLikeHeartChrome (512 viewBox). */
const HEART_PATH =
  "M256 448l-35.5-32.3C132 334 48 258.6 48 168.4 48 105.1 97.5 56 160.4 56c36.3 0 70.8 17.2 95.6 46.1C280.8 73.2 315.3 56 351.6 56 414.5 56 464 105.1 464 168.4c0 90.2-84 165.6-172.5 247.3L256 448z";

/**
 * Soft-close heart iris (D-047 explore lock): compact rings on ocean-deep
 * field + rose plug shrink (8B). Recipe from soft-close-heart-iris.html.
 * No void fill: ocean field reads around the cluster; light copy on rose plug.
 */
export function SoftCloseIrisChrome({
  freeze = false,
  replayKey = 0,
}: Props) {
  const heartId = `mm-soft-heart-${replayKey}`;
  /** Paint order back → front (ring 1…5). Scales live in middeck-metaphors.css. */
  const rings = [
    ONE_LIKE_HEART.oceanDeep,
    ONE_LIKE_HEART.oceanMid,
    ONE_LIKE_HEART.oceanDeep,
    ONE_LIKE_HEART.blooms[2],
    ONE_LIKE_HEART.blooms[0],
  ] as const;

  return (
    <div
      key={`iris-${replayKey}`}
      className="scrapped-middeck mm-iris mm-iris--heart"
      data-animate={freeze ? "0" : "1"}
      style={
        {
          "--c1": rings[0],
          "--c2": rings[1],
          "--c3": rings[2],
          "--c4": rings[3],
          "--c5": rings[4],
          "--mm-iris-plug": ONE_LIKE_HEART.hero,
        } as CSSProperties
      }
      aria-hidden
    >
      <svg
        className="mm-iris-svg"
        viewBox="0 0 512 512"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <path id={heartId} d={HEART_PATH} />
        </defs>
        {rings.map((fill, i) => (
          <g
            key={`${replayKey}-ring-${i}`}
            className={`mm-iris-heart-ring mm-iris-heart-ring--${i + 1}`}
          >
            <use href={`#${heartId}`} fill={fill} />
          </g>
        ))}
        <g className="mm-iris-hole">
          <use href={`#${heartId}`} fill={ONE_LIKE_HEART.hero} />
        </g>
      </svg>
    </div>
  );
}
