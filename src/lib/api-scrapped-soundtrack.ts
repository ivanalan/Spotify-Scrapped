/**
 * Pure soundtrack URI mapping for Scrapped (API) deck scenes.
 * Kept free of React so it can be unit-tested.
 *
 * Scene index (after pairing open/library/ghost beats):
 * 0 open (year+thesis) · 1 library · 2 ghost+#1 song · 3 list setup ·
 * 4 song list · 5 artist bridge · 6 #1 artist · 7 artist list ·
 * 8 reunion setup · 9 reunion · 10 share
 */

import type {
  ApiMetricCard,
  ApiMetricItem,
  ScrappedApiReport,
} from "@/lib/scrapped-api";

export const API_SCRAPPED_SLIDE_COUNT = 11;

/** 0-based indices: artist bridge → #1 → sabbatical list. */
export const ARTIST_ACT_SLIDES = [5, 6, 7] as const;

/** Beats per scene — first three are paired narrative phases on one canvas. */
export const API_SCRAPPED_BEAT_COUNTS = [
  2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1,
] as const;

/** Per-scene motion length (ms). Slide 0: 3s first line → 3s thesis. */
export const API_SCRAPPED_SCENE_MS = [
  6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000,
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

/** Song credited to the sabbatical artist — prefers their own trackId. */
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
 * True when the report cannot supply an artist-act URI that differs from the
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

export type SoundtrackOptions = {
  /** Client/server-resolved URI for the #1 sabbatical artist. */
  artistSoundtrackUri?: string | null;
};

export function getApiSlideSoundtrackUri(
  report: ScrappedApiReport,
  slideIndex: number,
  options?: SoundtrackOptions,
): string | null {
  const leftLong = cardById(report, "left-long-run");
  const leftLongArtists = cardById(report, "left-long-artists");
  const secondChance = cardById(report, "second-chance");
  const lead = songActLeadUri(report);
  const reunion = trackUri(secondChance?.items[0]) ?? lead;
  const fromReport = artistActTrackUri(report, leftLongArtists?.items[0]);
  const artistAct = options?.artistSoundtrackUri ?? fromReport;

  switch (slideIndex) {
    case 0:
    case 1:
      return lead;
    case 2:
    case 3:
    case 4:
      return trackUri(leftLong?.items[0]) ?? lead;
    case 5:
    case 6:
    case 7:
      return artistAct ?? lead;
    case 8:
    case 9:
    case 10:
      return reunion;
    default:
      return null;
  }
}
