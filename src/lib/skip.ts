import type { RawStreamEvent, SkipHeuristicOptions } from "./types";

/** Default end reasons treated as user-driven skips (see docs/DATA.md). */
export const DEFAULT_SKIP_END_REASONS = [
  "fwdbtn",
  "endplay",
  "backbtn",
] as const;

export const DEFAULT_SHORT_PLAY_MS = 30_000;

/**
 * Era-aware skip classification.
 * `skipped` alone is unreliable before ~2022: combine with reason_end + duration.
 */
export function isSkip(
  event: Pick<RawStreamEvent, "skipped" | "reason_end" | "ms_played">,
  options: SkipHeuristicOptions = {},
): boolean {
  const shortPlayMs = options.shortPlayMs ?? DEFAULT_SHORT_PLAY_MS;
  const skipEndReasons = options.skipEndReasons ?? DEFAULT_SKIP_END_REASONS;

  if (event.skipped) return true;
  if (skipEndReasons.includes(event.reason_end)) return true;
  if (event.ms_played < shortPlayMs) return true;
  return false;
}
