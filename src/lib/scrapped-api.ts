/**
 * Spotify Scrapped metrics from Web API tops and Liked Songs.
 * No Extended Streaming History.
 */

import type { ApiArtist, ApiTrack, SavedTrack } from "./spotify/listening";

export const SCRAPPED_API_YEAR = 2026;

export type ApiMetricItem = {
  id: string;
  /** Set for songs so the lab can start a Spotify preview. */
  trackId?: string;
  label: string;
  sublabel?: string;
  detail: string;
  value: number;
};

export type ApiMetricCard = {
  id: string;
  title: string;
  /** What the list is counting, in plain language. */
  calculated: string;
  /** What that count is trying to say about listening. */
  means: string;
  /** What the yellow bar length is, and how the five rows are ordered. */
  bar: string;
  source: string;
  headline?: string;
  items: ApiMetricItem[];
};

export type ApiHeadline = {
  id: string;
  /** 0–100. Missing when that top 50 came back empty. */
  percent: number | null;
  label: string;
  detail: string;
};

export type ScrappedApiReport = {
  year: number;
  fetchedAt: string;
  profileName: string | null;
  headlines: ApiHeadline[];
  summary: {
    likedCount: number;
    shortTrackCount: number;
    mediumTrackCount: number;
    longTrackCount: number;
    shortArtistCount: number;
    mediumArtistCount: number;
    longArtistCount: number;
  };
  cards: ApiMetricCard[];
};

export type ApiListeningSnapshot = {
  profileName: string | null;
  shortTracks: ApiTrack[];
  mediumTracks: ApiTrack[];
  longTracks: ApiTrack[];
  shortArtists: ApiArtist[];
  mediumArtists: ApiArtist[];
  longArtists: ApiArtist[];
  liked: SavedTrack[];
};

function artistLine(track: ApiTrack): string {
  return track.artists.map((a) => a.name).filter(Boolean).join(", ") || "—";
}

function inYear(iso: string, year: number): boolean {
  return iso.startsWith(String(year));
}

function idSet(tracks: ApiTrack[]): Set<string> {
  return new Set(tracks.map((t) => t.id));
}

function artistIdSet(artists: ApiArtist[]): Set<string> {
  return new Set(artists.map((a) => a.id));
}

function daysSince(iso: string, now: Date): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

const TOP_N = 5;

function normLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

type TrackIndex = {
  ids: Set<string>;
  isrcs: Set<string>;
  keys: Set<string>;
};

function songKeys(track: ApiTrack): string[] {
  const title = normLabel(track.name);
  if (!title) return [];
  const artists = track.artists
    .map((artist) => normLabel(artist.name))
    .filter(Boolean);
  const names = artists.length > 0 ? artists : [""];
  return names.map((artist) => `${title}::${artist}`);
}

function trackIndex(tracks: ApiTrack[]): TrackIndex {
  const ids = new Set<string>();
  const isrcs = new Set<string>();
  const keys = new Set<string>();
  for (const track of tracks) {
    ids.add(track.id);
    if (track.linkedFromId) ids.add(track.linkedFromId);
    if (track.isrc) isrcs.add(track.isrc);
    for (const key of songKeys(track)) keys.add(key);
  }
  return { ids, isrcs, keys };
}

/** Same Spotify id, same recording, or same title with a shared artist. */
function sameSong(track: ApiTrack, index: TrackIndex): boolean {
  if (index.ids.has(track.id)) return true;
  if (track.linkedFromId && index.ids.has(track.linkedFromId)) return true;
  if (track.isrc && index.isrcs.has(track.isrc)) return true;
  return songKeys(track).some((key) => index.keys.has(key));
}

function headline(
  id: string,
  part: number,
  whole: number,
  label: string,
): ApiHeadline {
  return {
    id,
    percent: whole > 0 ? Math.round((part / whole) * 100) : null,
    label,
    detail: whole > 0 ? `${part} of ${whole}` : "No list returned",
  };
}

function trackItem(
  track: ApiTrack,
  detail: string,
  value: number,
): ApiMetricItem {
  return {
    id: track.id,
    trackId: track.id,
    label: track.name,
    sublabel: artistLine(track),
    detail,
    value,
  };
}

/** First track in the pools that credits this artist (for soundtrack / preview). */
function trackByArtist(
  artistId: string,
  pools: ApiTrack[][],
): ApiTrack | undefined {
  for (const pool of pools) {
    const hit = pool.find((t) => t.artists.some((a) => a.id === artistId));
    if (hit) return hit;
  }
  return undefined;
}

export function buildScrappedApiReport(
  snap: ApiListeningSnapshot,
  year: number = SCRAPPED_API_YEAR,
): ScrappedApiReport {
  const now = new Date();
  const shortRank = new Map(snap.shortTracks.map((t, i) => [t.id, i + 1]));
  const shortIds = idSet(snap.shortTracks);
  const mediumIds = idSet(snap.mediumTracks);
  const longIds = idSet(snap.longTracks);
  const shortArtistIds = artistIdSet(snap.shortArtists);
  const mediumArtistIds = artistIdSet(snap.mediumArtists);
  const longArtistIds = artistIdSet(snap.longArtists);
  const shortIndex = trackIndex(snap.shortTracks);

  const likedByArtist = new Map<
    string,
    { name: string; count: number; inTops: boolean }
  >();
  for (const saved of snap.liked) {
    for (const artist of saved.track.artists) {
      if (!artist.id) continue;
      const row = likedByArtist.get(artist.id) ?? {
        name: artist.name,
        count: 0,
        inTops: false,
      };
      row.count += 1;
      if (shortArtistIds.has(artist.id) || mediumArtistIds.has(artist.id)) {
        row.inTops = true;
      }
      likedByArtist.set(artist.id, row);
    }
  }
  const abandonedArtists = [...likedByArtist.entries()]
    .filter(([, row]) => row.count >= 3 && !row.inTops)
    .map(([id, row]) => ({ id, ...row }))
    .sort((a, b) => b.count - a.count);

  const fallenTracks = snap.mediumTracks
    .map((track, i) => ({ track, rank: i + 1 }))
    .filter(({ track }) => !shortIds.has(track.id));

  const fallenArtists = snap.mediumArtists
    .map((artist, i) => ({ artist, rank: i + 1 }))
    .filter(({ artist }) => !shortArtistIds.has(artist.id));

  const leftLongTracks = snap.longTracks
    .map((track, i) => ({ track, rank: i + 1 }))
    .filter(
      ({ track }) => !mediumIds.has(track.id) && !shortIds.has(track.id),
    );

  const leftLongArtists = snap.longArtists
    .map((artist, i) => ({ artist, rank: i + 1 }))
    .filter(
      ({ artist }) =>
        !mediumArtistIds.has(artist.id) && !shortArtistIds.has(artist.id),
    );

  const artistsBack = snap.shortArtists
    .map((artist, i) => ({ artist, rank: i + 1 }))
    .filter(
      ({ artist }) =>
        longArtistIds.has(artist.id) && !mediumArtistIds.has(artist.id),
    );

  const secondChance = new Map<
    string,
    { track: ApiTrack; via: "gap" | "like" }
  >();
  for (const track of snap.shortTracks) {
    if (longIds.has(track.id) && !mediumIds.has(track.id)) {
      secondChance.set(track.id, { track, via: "gap" });
    }
  }
  for (const saved of snap.liked) {
    if (
      inYear(saved.added_at, year) ||
      !sameSong(saved.track, shortIndex) ||
      daysSince(saved.added_at, now) <= 180
    ) {
      continue;
    }
    const existing = secondChance.get(saved.track.id);
    if (!existing) {
      secondChance.set(saved.track.id, { track: saved.track, via: "like" });
    }
  }
  const headlines = [
    headline(
      "fell-month",
      fallenTracks.length,
      snap.mediumTracks.length,
      "of your 6-month top songs dropped out of the last 4 weeks",
    ),
    headline(
      "left-long",
      leftLongTracks.length,
      snap.longTracks.length,
      "of your multi-year top songs are out of the last 6 months and the last 4 weeks",
    ),
    headline(
      "artists-cooled",
      fallenArtists.length,
      snap.mediumArtists.length,
      "of your 6-month top artists cooled off in the last 4 weeks",
    ),
  ];

  const returns = [...secondChance.values()].sort(
    (a, b) =>
      (shortRank.get(a.track.id) ?? 99) - (shortRank.get(b.track.id) ?? 99),
  );

  const cards: ApiMetricCard[] = [
    {
      id: "fallen-rotation",
      title: "Fallen from rotation",
      calculated:
        "Songs in your 6-month top 50 that are absent from your 4-week top 50. Order is the 6-month rank, highest first.",
      means: "They were part of the last half-year and have dropped out of the last month. “Also multi-year” means the song is still in the several-years top 50 too.",
      bar: "How high they ranked over ~6 months. #1 is the longest bar.",
      source: "Top tracks (6 months and 4 weeks)",
      items: fallenTracks.slice(0, TOP_N).map(({ track, rank }) =>
        trackItem(
          track,
          longIds.has(track.id)
            ? `6-month #${rank} · also multi-year`
            : `6-month #${rank}`,
          51 - rank,
        ),
      ),
    },
    {
      id: "second-chance",
      title: "Second-chance returns",
      calculated:
        "Two groups, merged, then sorted by current 4-week rank. First: in both the multi-year and 4-week top 50, missing from the 6-month list. Second: a like older than 180 days and from before this year, that is back in the 4-week top 50. Another release of the same song counts.",
      means: "Something you used to play, or saved a long time ago, is in this month again after a gap.",
      bar: "Current 4-week rank. Higher rank, longer bar.",
      source: "Top tracks (all three windows) + Liked Songs",
      items: returns.slice(0, TOP_N).map(({ track, via }) =>
        trackItem(
          track,
          via === "gap"
            ? `4-week #${shortRank.get(track.id)} · long, skipped 6 months`
            : `4-week #${shortRank.get(track.id)} · old like, back`,
          51 - (shortRank.get(track.id) ?? 50),
        ),
      ),
    },
    {
      id: "abandoned-artists",
      title: "Artists on the shelf",
      calculated:
        "Group fetched likes by artist. Keep artists with at least 3 liked tracks who are missing from both your 4-week and 6-month top artists. Most liked tracks first.",
      means: "You keep saving them, and Spotify does not currently rank them as artists you play.",
      bar: "Number of liked tracks from that artist. Longer means more saves.",
      source: "Liked Songs + top artists (4 weeks and 6 months)",
      items: abandonedArtists.slice(0, TOP_N).map((artist) => ({
        id: artist.id,
        label: artist.name,
        detail: `${artist.count} liked tracks`,
        value: artist.count,
      })),
    },
    {
      id: "fallen-artists",
      title: "Artists who cooled off",
      calculated:
        "Artists in your 6-month top 50 who are absent from your 4-week top artists. Highest 6-month rank first.",
      means: "You were in them for the half-year, and they have fallen out of the last month.",
      bar: "How high they ranked over ~6 months. #1 is the longest bar.",
      source: "Top artists (6 months and 4 weeks)",
      items: fallenArtists.slice(0, TOP_N).map(({ artist, rank }) => ({
        id: artist.id,
        label: artist.name,
        detail: `6-month #${rank}`,
        value: 51 - rank,
      })),
    },
    {
      id: "left-long-run",
      title: "Left the long run",
      calculated:
        "Songs in your multi-year top 50 that are absent from both the 6-month and the 4-week top 50. Highest multi-year rank first.",
      means: "A years-long favorite that has been out of both the last six months and the last month.",
      bar: "How high they ranked across several years. #1 is the longest bar.",
      source: "Top tracks (several years, 6 months, and 4 weeks)",
      items: leftLongTracks.slice(0, TOP_N).map(({ track, rank }) =>
        trackItem(track, `multi-year #${rank}`, 51 - rank),
      ),
    },
    {
      id: "left-long-artists",
      title: "Artists who left the long run",
      calculated:
        "Artists in your multi-year top 50 who are absent from both the 6-month and the 4-week top artists. Highest multi-year rank first.",
      means: "Years-long favorites who are not in the last half-year or the last month.",
      bar: "How high they ranked across several years. #1 is the longest bar.",
      source: "Top artists (several years, 6 months, and 4 weeks)",
      items: leftLongArtists.slice(0, TOP_N).map(({ artist, rank }) => {
        const sample = trackByArtist(artist.id, [
          leftLongTracks.map(({ track }) => track),
          snap.longTracks,
          snap.mediumTracks,
          snap.shortTracks,
          snap.liked.map((s) => s.track),
        ]);
        return {
          id: artist.id,
          trackId: sample?.id,
          label: artist.name,
          detail: `multi-year #${rank}`,
          value: 51 - rank,
        };
      }),
    },
    {
      id: "artists-back",
      title: "Artists back this month",
      calculated:
        "Artists in both your multi-year and 4-week top 50, missing from the 6-month list. Highest current 4-week rank first.",
      means: "An artist you used to play for years is in this month again, after a gap in the half-year list.",
      bar: "Current 4-week rank. Higher rank, longer bar.",
      source: "Top artists (all three windows)",
      items: artistsBack.slice(0, TOP_N).map(({ artist, rank }) => ({
        id: artist.id,
        label: artist.name,
        detail: `4-week #${rank} · long, skipped 6 months`,
        value: 51 - rank,
      })),
    },
  ];

  return {
    year,
    fetchedAt: now.toISOString(),
    profileName: snap.profileName,
    headlines,
    summary: {
      likedCount: snap.liked.length,
      shortTrackCount: snap.shortTracks.length,
      mediumTrackCount: snap.mediumTracks.length,
      longTrackCount: snap.longTracks.length,
      shortArtistCount: snap.shortArtists.length,
      mediumArtistCount: snap.mediumArtists.length,
      longArtistCount: snap.longArtists.length,
    },
    cards,
  };
}
