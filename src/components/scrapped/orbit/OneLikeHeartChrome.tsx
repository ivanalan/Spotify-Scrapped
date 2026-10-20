"use client";

import { useEffect, useState } from "react";
import { heart } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import { STORY_MOTION } from "@/lib/scrapped-story-motion";

type Props = {
  /** Hero (setup beats) vs edge-rising list frame (D-015). */
  mode: "hero" | "frame";
  freeze?: boolean;
  /** Remount key so grow-in replays on revisit. */
  replayKey?: number;
};

/**
 * Hold hero through setup copy exit + list title enter, then crossfade.
 * `beatIndex` flips to the list immediately; art should not.
 */
const LIST_HANDOFF_HOLD_MS = Math.round(
  (STORY_MOTION.exitTravelSec + STORY_MOTION.titleTravelSec) * 1000,
);

/**
 * 4A one-like heart — lab fav.
 * Setup: grow-in then lub-dub + underglow. List: perimeter rising hearts.
 * Both layers stay mounted so hero can ease out while floaters ease in.
 */
export function OneLikeHeartChrome({
  mode,
  freeze = false,
  replayKey = 0,
}: Props) {
  const animate = freeze ? "0" : "1";
  const [visualMode, setVisualMode] = useState(mode);

  useEffect(() => {
    if (freeze || mode === "hero") {
      setVisualMode(mode);
      return;
    }
    const id = window.setTimeout(
      () => setVisualMode("frame"),
      LIST_HANDOFF_HOLD_MS,
    );
    return () => window.clearTimeout(id);
  }, [mode, freeze, replayKey]);

  return (
    <div
      key={`heart-scene-${replayKey}`}
      className="scrapped-middeck mm-heart-scene"
      data-mode={visualMode}
      data-animate={animate}
      aria-hidden
    >
      <div className="mm-heart-hero">
        <Icon icon={heart} className="mm-heart-icon" />
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
