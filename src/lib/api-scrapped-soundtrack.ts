/**
 * Pure soundtrack URI mapping for Scrapped (API) deck scenes.
 * Kept free of React so it can be unit-tested.
 *
 * Scene index (1-based user slides → 0-based):
 * 0 open (short-term #1) · 1 liked this year · 2 top ghosted song ·
 * 3 2nd ghosted song · 4 one-like · 5 top ghosted artist ·
 * 6 2nd ghosted artist · 7 reunion · 8 share (left-on-read / distinct)
 */

import type {
  ApiMetricCard,
  ApiMetricItem,
  ScrappedApiReport,
} from "@/lib/scrapped-api";

export const API_SCRAPPED_SLIDE_COUNT = 9;

/** 0-based indices: #1 ghosted artist → top ghosted artists list. */
export const ARTIST_ACT_SLIDES = [5, 6] as const;

/**
 * Fallback beats-per-scene (narrative blocks). Live deck expands each
 * title / subtitle / aside into its own line-beat via reading-time schedules
 * in `ApiScrappedDeck` — prefer those when wiring autoplay.
 */
export const API_SCRAPPED_BEAT_COUNTS = [
  2, 2, 3, 2, 3, 2, 2, 2, 1,
] as const;

/**
 * Fallback per-scene lengths (ms). Live deck overrides with summed
 * reading-time line-beat durations.
 */
export const API_SCRAPPED_SCENE_MS = [
  8000, 6000, 9000, 6000, 9000, 6000, 6000, 6000, 6000,
] as const;

export function isArtistActSlide(slideIndex: number): boolean {
  return (ARTIST_ACT_SLIDES as readonly number[]).includes(slideIndex);
}

function cardById(
  report: ScrappedApiReport,
  id: string,
): ApiMetricCard | undefined {
  return report.cards.find((c) => c.id === id);
}

export function trackUri(item: ApiMetricItem | undefined): string | null {
  return item?.trackId ? `spotify:track:${item.trackId}` : null;
}

function trackCreditsArtist(
  item: ApiMetricItem,
  artistName: string,
): boolean {
  const sub = item.sublabel?.trim().toLowerCase();
  if (!sub) return false;
  const name = artistName.trim().toLowerCase();
  if (!name) return false;
  if (sub === name) return true;
  return sub.split(",").some((part) => part.trim() === name);
}

/** Song credited to a sabbatical artist — prefers their own trackId. */
export function artistActTrackUri(
  report: ScrappedApiReport,
  artistItem: ApiMetricItem | undefined,
): string | null {
  const direct = trackUri(artistItem);
  if (direct) return direct;
  if (!artistItem?.label) return null;

  for (const card of report.cards) {
    const match = card.items.find(
      (item) =>
        Boolean(item.trackId) &&
        (item.id === artistItem.id ||
          trackCreditsArtist(item, artistItem.label)),
    );
    const uri = trackUri(match);
    if (uri) return uri;
  }
  return null;
}

export function songActLeadUri(report: ScrappedApiReport): string | null {
  const leftLong = cardById(report, "left-long-run");
  const fallen = cardById(report, "fallen-rotation");
  return trackUri(leftLong?.items[0]) ?? trackUri(fallen?.items[0]);
}

/**
 * True when #1 sabbatical artist lacks a playable track distinct from the
 * song lead (missing sample, or sample is the same track).
 */
export function needsArtistSoundtrackResolve(
  report: ScrappedApiReport,
): {
  artistId: string;
  artistName: string;
  avoidTrackId: string | null;
} | null {
  const artist = cardById(report, "left-long-artists")?.items[0];
  if (!artist?.id || !artist.label) return null;
  const lead = songActLeadUri(report);
  const artistUri = artistActTrackUri(report, artist);
  if (artistUri && artistUri !== lead) return null;
  return {
    artistId: artist.id,
    artistName: artist.label,
    avoidTrackId: lead?.replace(/^spotify:track:/, "") ?? null,
  };
}

/** Same for #2 ghosted artist when the report has no distinct sample. */
export function needsSecondArtistSoundtrackResolve(
  report: ScrappedApiReport,
): {
  artistId: string;
  artistName: string;
  avoidTrackId: string | null;
} | null {
  const artists = cardById(report, "left-long-artists")?.items ?? [];
  const artist = artists[1];
  if (!artist?.id || !artist.label) return null;
  const lead = songActLeadUri(report);
  const firstUri = artistActTrackUri(report, artists[0]);
  const artistUri = artistActTrackUri(report, artist);
  if (
    artistUri &&
    artistUri !== lead &&
    artistUri !== firstUri
  ) {
    return null;
  }
  const avoid =
    firstUri?.replace(/^spotify:track:/, "") ??
    lead?.replace(/^spotify:track:/, "") ??
    null;
  return {
    artistId: artist.id,
    artistName: artist.label,
    avoidTrackId: avoid,
  };
}

export type SoundtrackOptions = {
  /** Client/server-resolved URI for the #1 sabbatical artist. */
  artistSoundtrackUri?: string | null;
  /** Client/server-resolved URI for the #2 sabbatical artist. */
  artistSoundtrackUri2?: string | null;
};

function idFromUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  const m = /^spotify:track:(.+)$/.exec(uri);
  return m?.[1] ?? null;
}

/**
 * Nine soundtrack URIs.
 *
 * Content slides are pinned first to the track shown on that slide (what you
 * see is what you hear). Ambient slides (open / liked-year / share) fill from
 * whatever remains so they cannot steal a hero track.
 */
export function getApiSlideSoundtrackUris(
  report: ScrappedApiReport,
  options?: SoundtrackOptions,
): (string | null)[] {
  const leftLong = cardById(report, "left-long-run");
  const leftLongArtists = cardById(report, "left-long-artists");
  const oneSave = cardById(report, "one-save-artists");
  const secondChance = cardById(report, "second-chance");
  const likedThisYear = cardById(report, "liked-this-year");
  const fallen = cardById(report, "fallen-rotation");

  const shortTopId = report.summary.shortTopTrackId;
  const ghostedIds = (leftLong?.items ?? [])
    .map((i) => i.trackId)
    .filter((id): id is string => Boolean(id));
  const likedYearIds = (likedThisYear?.items ?? [])
    .map((i) => i.trackId)
    .filter((id): id is string => Boolean(id));
  const oneLikeIds = (oneSave?.items ?? [])
    .map((i) => i.trackId)
    .filter((id): id is string => Boolean(id));
  const reunionIds = (secondChance?.items ?? [])
    .map((i) => i.trackId)
    .filter((id): id is string => Boolean(id));
  const fallenIds = (fallen?.items ?? [])
    .map((i) => i.trackId)
    .filter((id): id is string => Boolean(id));

  const artist0FromReport = artistActTrackUri(
    report,
    leftLongArtists?.items[0],
  );
  const artist1FromReport = artistActTrackUri(
    report,
    leftLongArtists?.items[1],
  );
  const artist0Id =
    idFromUri(options?.artistSoundtrackUri) ??
    idFromUri(artist0FromReport);
  const artist1Id =
    idFromUri(options?.artistSoundtrackUri2) ??
    idFromUri(artist1FromReport);

  const used = new Set<string>();
  const out: (string | null)[] = Array.from(
    { length: API_SCRAPPED_SLIDE_COUNT },
    () => null,
  );

  function take(id: string | null | undefined): string | null {
    if (!id || used.has(id)) return null;
    used.add(id);
    return `spotify:track:${id}`;
  }

  function takeFirst(ids: (string | null | undefined)[]): string | null {
    for (const id of ids) {
      const uri = take(id);
      if (uri) return uri;
    }
    return null;
  }

  // --- Content pins (must match on-screen entities) ---------------------
  // 2 — top ghosted song (e.g. Dapper)
  out[2] = take(ghostedIds[0]);
  // 3 — second ghosted song
  out[3] = take(ghostedIds[1]);
  // 5 — top ghosted artist sample
  out[5] = take(artist0Id);
  // 6 — second ghosted artist sample
  out[6] = take(artist1Id);
  // 4 — top one-like sample
  out[4] = take(oneLikeIds[0]);
  // 7 — top reunion song
  out[7] = take(reunionIds[0]);

  // Soft fallbacks for content slots that had no primary sample.
  if (!out[2]) out[2] = takeFirst([...ghostedIds, ...fallenIds]);
  if (!out[3]) out[3] = takeFirst([...ghostedIds, ...fallenIds]);
  if (!out[5]) {
    out[5] = takeFirst([artist0Id, ...oneLikeIds, ...ghostedIds]);
  }
  if (!out[6]) {
    out[6] = takeFirst([artist1Id, artist0Id, ...oneLikeIds, ...fallenIds]);
  }
  if (!out[4]) out[4] = takeFirst([...oneLikeIds, ...likedYearIds]);
  if (!out[7]) out[7] = takeFirst([...reunionIds, ...likedYearIds]);

  // --- Ambient slides (never steal reserved hero tracks) ----------------
  // 0 — user's top song right now (4-week #1)
  out[0] = takeFirst([shortTopId, ...likedYearIds, ...fallenIds, ...ghostedIds]);
  // 1 — a different song liked this year
  out[1] = takeFirst([...likedYearIds, ...fallenIds, ...ghostedIds]);
  // 8 — share / leftover left-on-read
  out[8] = takeFirst([
    ...ghostedIds,
    ...fallenIds,
    ...likedYearIds,
    ...reunionIds,
    shortTopId,
  ]);

  // Last resort: keep audio on empty slots (may reuse).
  const filled = out.filter((u): u is string => Boolean(u));
  for (let i = 0; i < out.length; i++) {
    if (!out[i] && filled.length > 0) {
      out[i] = filled[i % filled.length] ?? filled[0]!;
    }
  }

  return out;
}

export function getApiSlideSoundtrackUri(
  report: ScrappedApiReport,
  slideIndex: number,
  options?: SoundtrackOptions,
): string | null {
  if (slideIndex < 0 || slideIndex >= API_SCRAPPED_SLIDE_COUNT) return null;
  return getApiSlideSoundtrackUris(report, options)[slideIndex] ?? null;
}
