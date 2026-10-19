/**
 * Spotify Scrapped metrics from Web API tops and Liked Songs.
 * No Extended Streaming History.
 */

import type { ApiArtist, ApiTrack, SavedTrack } from "./spotify/listening";
import { SCRAPPED_API_YEAR } from "./scrapped-api-year";

export { SCRAPPED_API_YEAR };

export type ApiMetricItem = {
  id: string;
  /** Set for songs so the lab can start a Spotify preview. */
  trackId?: string;
  label: string;
  sublabel?: string;
  detail: string;
  value: number;
  /** Album or artist image from Spotify. */
  imageUrl?: string | null;
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
    /** Fetched likes with `added_at` in the Scrapped year. */
    likedThisYearCount: number;
    /** Fetched likes absent from all three top-track windows. */
    likedNeverToppedCount: number;
    /** 4-week top tracks that are also in Liked Songs. */
    shortLikedCount: number;
    /** 4-week tops missing from both 6-month and multi-year lists. */
    monthOnlyTrackCount: number;
    /** 4-week top artists missing from both longer artist windows. */
    monthOnlyArtistCount: number;
    shortTrackCount: number;
    mediumTrackCount: number;
    longTrackCount: number;
    shortArtistCount: number;
    mediumArtistCount: number;
    longArtistCount: number;
    /** #1 four-week top track — open-slide soundtrack. */
    shortTopTrackId: string | null;
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
  /** Full Liked Songs library size from Spotify `total` (not the capped page fetch). */
  likedTotal?: number;
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
    imageUrl: track.imageUrl,
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

/** Parse leading count from headline detail (`"12 of 50"`). */
function countFromDetail(detail: string | undefined): number | null {
  if (!detail) return null;
  const match = /^(\d+)/.exec(detail);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Multi-year tops that left both recent windows (`left-long` / left-long-run).
 *
 * Cookie-safe: older seals wiped headline `detail` but kept `percent` and
 * card items. Prefer exact detail, then percent×long, then visible rows —
 * never claim zero when the top-ghosted list still has songs.
 */
export function leftLongGhostedCount(report: ScrappedApiReport): number | null {
  const headline = report.headlines.find((h) => h.id === "left-long");
  const fromDetail = countFromDetail(headline?.detail);
  if (fromDetail != null) return fromDetail;

  const long = report.summary?.longTrackCount ?? 0;
  const itemCount =
    report.cards.find((c) => c.id === "left-long-run")?.items.length ?? 0;

  let fromPercent: number | null = null;
  if (headline?.percent != null && long > 0) {
    fromPercent = Math.round((headline.percent / 100) * long);
  }

  if (fromPercent != null) return Math.max(fromPercent, itemCount);
  if (itemCount > 0) return itemCount;
  if (headline?.percent === 0) return 0;
  if (long <= 0) return null;
  return 0;
}

/** Fill like-shelf summary fields missing from older sealed Lab snapshots. */
export function ensureApiReportSummary(
  report: ScrappedApiReport,
): ScrappedApiReport {
  if (!report) return report;
  const s = report.summary ?? ({} as ScrappedApiReport["summary"]);
  report.summary = {
    likedCount: s.likedCount ?? 0,
    likedThisYearCount: s.likedThisYearCount ?? 0,
    likedNeverToppedCount: s.likedNeverToppedCount ?? 0,
    shortLikedCount: s.shortLikedCount ?? 0,
    shortTopTrackId: s.shortTopTrackId ?? null,
    monthOnlyTrackCount: s.monthOnlyTrackCount ?? 0,
    monthOnlyArtistCount: s.monthOnlyArtistCount ?? 0,
    shortTrackCount: s.shortTrackCount ?? 0,
    mediumTrackCount: s.mediumTrackCount ?? 0,
    longTrackCount: s.longTrackCount ?? 0,
    shortArtistCount: s.shortArtistCount ?? 0,
    mediumArtistCount: s.mediumArtistCount ?? 0,
    longArtistCount: s.longArtistCount ?? 0,
  };
  return report;
}

function genreTallies(artists: ApiArtist[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      const key = genre.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
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
  const longIndex = trackIndex(snap.longTracks);
  const anyTopIndex = trackIndex([
    ...snap.shortTracks,
    ...snap.mediumTracks,
    ...snap.longTracks,
  ]);
  const likedIndex = trackIndex(snap.liked.map((s) => s.track));
  const toppedArtistIds = new Set([
    ...shortArtistIds,
    ...mediumArtistIds,
    ...longArtistIds,
  ]);

  const likedThisYear = snap.liked
    .filter((saved) => inYear(saved.added_at, year))
    .sort(
      (a, b) =>
        Date.parse(b.added_at) - Date.parse(a.added_at) ||
        a.track.name.localeCompare(b.track.name),
    );

  const neverTopped = snap.liked
    .filter((saved) => !sameSong(saved.track, anyTopIndex))
    .map((saved) => ({
      saved,
      ageDays: daysSince(saved.added_at, now),
    }))
    .sort(
      (a, b) =>
        b.ageDays - a.ageDays ||
        a.saved.track.name.localeCompare(b.saved.track.name),
    );

  const shortLikedTracks = snap.shortTracks.filter((track) =>
    sameSong(track, likedIndex),
  );
  const shortNotLiked = snap.shortTracks
    .map((track, i) => ({ track, rank: i + 1 }))
    .filter(({ track }) => !sameSong(track, likedIndex));

  const likedByArtist = new Map<
    string,
    {
      name: string;
      count: number;
      inTops: boolean;
      /** Oldest like for this artist (the unfinished yes for one/two-saves). */
      oldestSaved: SavedTrack;
    }
  >();
  for (const saved of snap.liked) {
    for (const artist of saved.track.artists) {
      if (!artist.id) continue;
      const row = likedByArtist.get(artist.id);
      if (!row) {
        likedByArtist.set(artist.id, {
          name: artist.name,
          count: 1,
          inTops:
            shortArtistIds.has(artist.id) || mediumArtistIds.has(artist.id),
          oldestSaved: saved,
        });
        continue;
      }
      row.count += 1;
      if (shortArtistIds.has(artist.id) || mediumArtistIds.has(artist.id)) {
        row.inTops = true;
      }
      if (Date.parse(saved.added_at) < Date.parse(row.oldestSaved.added_at)) {
        row.oldestSaved = saved;
      }
    }
  }
  const abandonedArtists = [...likedByArtist.entries()]
    .filter(([, row]) => row.count >= 3 && !row.inTops)
    .map(([id, row]) => ({ id, ...row }))
    .sort((a, b) => b.count - a.count);

  const oneSaveArtists = [...likedByArtist.entries()]
    .filter(([, row]) => row.count === 1 && !row.inTops)
    .map(([id, row]) => ({
      id,
      ...row,
      ageDays: daysSince(row.oldestSaved.added_at, now),
    }))
    .sort(
      (a, b) =>
        b.ageDays - a.ageDays || a.name.localeCompare(b.name),
    );

  const twoSaveArtists = [...likedByArtist.entries()]
    .filter(([, row]) => row.count === 2 && !row.inTops)
    .map(([id, row]) => ({
      id,
      ...row,
      ageDays: daysSince(row.oldestSaved.added_at, now),
    }))
    .sort(
      (a, b) =>
        b.ageDays - a.ageDays || a.name.localeCompare(b.name),
    );

  /** Impulse likes in the last 90 days that never entered any top window. */
  const recentNeverTopped = neverTopped
    .filter(({ ageDays }) => ageDays <= 90)
    .sort(
      (a, b) =>
        a.ageDays - b.ageDays ||
        a.saved.track.name.localeCompare(b.saved.track.name),
    );

  /**
   * Old like back in the 4-week list, but never a multi-year staple —
   * a quiet rematch, not a years-long reunion.
   */
  const quietRematch = snap.liked
    .filter((saved) => {
      if (daysSince(saved.added_at, now) <= 365) return false;
      if (!sameSong(saved.track, shortIndex)) return false;
      if (sameSong(saved.track, longIndex)) return false;
      return true;
    })
    .map((saved) => {
      let rank = shortRank.get(saved.track.id);
      if (rank == null) {
        const i = snap.shortTracks.findIndex((t) =>
          sameSong(saved.track, trackIndex([t])),
        );
        rank = i >= 0 ? i + 1 : 99;
      }
      return {
        saved,
        rank,
        ageDays: daysSince(saved.added_at, now),
      };
    })
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        b.ageDays - a.ageDays ||
        a.saved.track.name.localeCompare(b.saved.track.name),
    );

  /** Liked track never topped, but the artist is on a current top list. */
  const deepCutSaves = neverTopped
    .filter(({ saved }) =>
      saved.track.artists.some((a) => a.id && toppedArtistIds.has(a.id)),
    )
    .sort(
      (a, b) =>
        b.ageDays - a.ageDays ||
        a.saved.track.name.localeCompare(b.saved.track.name),
    );

  const monthOnlyTracks = snap.shortTracks
    .map((track, i) => ({ track, rank: i + 1 }))
    .filter(
      ({ track }) => !mediumIds.has(track.id) && !longIds.has(track.id),
    );

  const monthOnlyArtists = snap.shortArtists
    .map((artist, i) => ({ artist, rank: i + 1 }))
    .filter(
      ({ artist }) =>
        !mediumArtistIds.has(artist.id) && !longArtistIds.has(artist.id),
    );

  const mediumGenres = genreTallies(snap.mediumArtists);
  const shortGenres = genreTallies(snap.shortArtists);
  const cooledGenres = [...mediumGenres.entries()]
    .filter(([genre]) => !shortGenres.has(genre))
    .map(([genre, count]) => ({ genre, count }))
    .sort(
      (a, b) =>
        b.count - a.count || a.genre.localeCompare(b.genre),
    );

  const fallenTracks = snap.mediumTracks
    .map((track, i) => ({ track, rank: i + 1 }))
    .filter(({ track }) => !shortIds.has(track.id));

  /** Brutal drops: were in the top 10 of the half-year, gone from this month. */
  const rankFreefall = fallenTracks
    .filter(({ rank }) => rank <= 10)
    .sort((a, b) => a.rank - b.rank);

  const fallenArtists = snap.mediumArtists
    .map((artist, i) => ({ artist, rank: i + 1 }))
    .filter(({ artist }) => !shortArtistIds.has(artist.id));

  const leftLongTracks = snap.longTracks
    .map((track, i) => ({ track, rank: i + 1 }))
    .filter(
      ({ track }) => !mediumIds.has(track.id) && !shortIds.has(track.id),
    );

  const mainstreamGhosts = [...leftLongTracks].sort(
    (a, b) =>
      b.track.popularity - a.track.popularity || a.rank - b.rank,
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

  const shortLikedCount = shortLikedTracks.length;
  const shortWhole = snap.shortTracks.length;

  const cards: ApiMetricCard[] = [
    {
      id: "liked-this-year",
      title: "Liked this year",
      calculated: `Liked Songs with an added date in ${year} (full library fetch). Most recently liked first.`,
      means: "Saves you made this year — still on the shelf, whether or not they became rotation.",
      bar: "Recency among this year’s likes. Newest like is the longest bar.",
      source: "Liked Songs",
      headline:
        likedThisYear.length > 0
          ? `${likedThisYear.length.toLocaleString()} liked in ${year}`
          : `No likes from ${year} in your library`,
      items: likedThisYear.slice(0, TOP_N).map((saved, i) =>
        trackItem(
          saved.track,
          `liked ${saved.added_at.slice(0, 10)}`,
          TOP_N - i,
        ),
      ),
    },
    {
      id: "saved-never-topped",
      title: "Saved, never topped",
      calculated:
        "Fetched Liked Songs that do not appear in any of your 4-week, 6-month, or multi-year top 50s (same song / recording counts). Oldest like first.",
      means: "You hearted them, and Spotify never ranked them as a top play. The shelf that never became rotation.",
      bar: "Days since you liked the song. Older likes get the longer bar.",
      source: "Liked Songs + top tracks (all three windows)",
      headline:
        neverTopped.length > 0
          ? `${neverTopped.length.toLocaleString()} saved likes never made a top 50`
          : "Every fetched like shows up in at least one top window",
      items: neverTopped.slice(0, TOP_N).map(({ saved, ageDays }) =>
        trackItem(
          saved.track,
          ageDays === 0
            ? "liked today · never topped"
            : `liked ${ageDays.toLocaleString()}d ago · never topped`,
          ageDays,
        ),
      ),
    },
    {
      id: "month-already-liked",
      title: "This month already liked",
      calculated:
        "Of your 4-week top 50, how many are already in Liked Songs (same song counts). The list is the ones that are not liked yet — highest 4-week rank first.",
      means: "How much of right now was already on the shelf — and which current favorites you still haven’t saved.",
      bar: "4-week rank among unsaved songs. Higher rank, longer bar.",
      source: "Top tracks (4 weeks) + Liked Songs",
      headline:
        shortWhole > 0
          ? `${shortLikedCount} of ${shortWhole} four-week tops are already liked`
          : "No 4-week top list returned",
      items: shortNotLiked.slice(0, TOP_N).map(({ track, rank }) =>
        trackItem(track, `4-week #${rank} · not liked yet`, 51 - rank),
      ),
    },
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
      items: abandonedArtists.slice(0, TOP_N).map((artist) => {
        const sample = trackByArtist(artist.id, [
          snap.liked.map((s) => s.track),
          snap.longTracks,
          snap.mediumTracks,
          snap.shortTracks,
        ]);
        const profile = [
          ...snap.longArtists,
          ...snap.mediumArtists,
          ...snap.shortArtists,
        ].find((a) => a.id === artist.id);
        return {
          id: artist.id,
          trackId: sample?.id,
          label: artist.name,
          detail: `${artist.count} liked tracks`,
          value: artist.count,
          imageUrl: profile?.imageUrl ?? sample?.imageUrl ?? null,
        };
      }),
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
        imageUrl: artist.imageUrl,
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
        // Prefer a song that isn't the #1 left-long track so the artist-act
        // soundtrack can actually switch when the deck reaches that beat.
        const leadSongId = leftLongTracks[0]?.track.id;
        const pools = [
          snap.liked.map((s) => s.track),
          snap.longTracks,
          snap.mediumTracks,
          snap.shortTracks,
          leftLongTracks.map(({ track }) => track),
        ];
        let sample = trackByArtist(artist.id, pools);
        if (sample && leadSongId && sample.id === leadSongId) {
          const alt = pools
            .flat()
            .find(
              (t) =>
                t.id !== leadSongId &&
                t.artists.some((a) => a.id === artist.id),
            );
          if (alt) sample = alt;
        }
        return {
          id: artist.id,
          trackId: sample?.id,
          label: artist.name,
          detail: `multi-year #${rank}`,
          value: 51 - rank,
          imageUrl: artist.imageUrl ?? sample?.imageUrl ?? null,
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
        imageUrl: artist.imageUrl,
      })),
    },
    {
      id: "month-only-tracks",
      title: "This month only",
      calculated:
        "Songs in your 4-week top 50 that are absent from both the 6-month and multi-year top 50s. Highest 4-week rank first.",
      means: "Temporary flings — loud this month, nowhere in the longer windows.",
      bar: "Current 4-week rank. Higher rank, longer bar.",
      source: "Top tracks (all three windows)",
      headline:
        monthOnlyTracks.length > 0
          ? `${monthOnlyTracks.length} of ${snap.shortTracks.length || 0} four-week tops are brand new`
          : "No brand-new four-week tops",
      items: monthOnlyTracks.slice(0, TOP_N).map(({ track, rank }) =>
        trackItem(track, `4-week #${rank} · not in longer windows`, 51 - rank),
      ),
    },
    {
      id: "month-only-artists",
      title: "Artists new this month",
      calculated:
        "Artists in your 4-week top 50 who are absent from both the 6-month and multi-year top artists. Highest 4-week rank first.",
      means: "People you just started (or restarted hard) — not on the half-year or years-long lists.",
      bar: "Current 4-week rank. Higher rank, longer bar.",
      source: "Top artists (all three windows)",
      headline:
        monthOnlyArtists.length > 0
          ? `${monthOnlyArtists.length} artists are new to your four-week list`
          : "No brand-new four-week artists",
      items: monthOnlyArtists.slice(0, TOP_N).map(({ artist, rank }) => {
        const sample = trackByArtist(artist.id, [
          snap.shortTracks,
          snap.liked.map((s) => s.track),
          snap.mediumTracks,
          snap.longTracks,
        ]);
        return {
          id: artist.id,
          trackId: sample?.id,
          label: artist.name,
          detail: `4-week #${rank} · not in longer windows`,
          value: 51 - rank,
          imageUrl: artist.imageUrl ?? sample?.imageUrl ?? null,
        };
      }),
    },
    {
      id: "one-save-artists",
      title: "One-save shelf",
      calculated:
        "Artists with exactly one track in the fetched Liked Songs who are missing from both your 4-week and 6-month top artists. Oldest like first.",
      means: "A single heart, no rotation — the almosts you never followed up. Longest-sitting yeses lead.",
      bar: "Days since that one like. Older = longer bar.",
      source: "Liked Songs + top artists (4 weeks and 6 months)",
      headline:
        oneSaveArtists.length > 0
          ? `${oneSaveArtists.length.toLocaleString()} artists with a single like and no current top slot`
          : "No one-save shelf artists in this sample",
      items: oneSaveArtists.slice(0, TOP_N).map((artist) => {
        const sample = artist.oldestSaved.track;
        return {
          id: artist.id,
          trackId: sample.id,
          label: artist.name,
          detail:
            artist.ageDays === 0
              ? `${sample.name} · liked today`
              : `${sample.name} · ${artist.ageDays.toLocaleString()}d on the shelf`,
          value: artist.ageDays,
          imageUrl: sample.imageUrl ?? null,
        };
      }),
    },
    {
      id: "two-save-artists",
      title: "Two-save almosts",
      calculated:
        "Artists with exactly two tracks in the fetched Liked Songs who are missing from both your 4-week and 6-month top artists. Oldest of the two likes first.",
      means: "One more heart than a one-save — still no rotation. The almost-almosts.",
      bar: "Days since the older of the two likes. Older = longer bar.",
      source: "Liked Songs + top artists (4 weeks and 6 months)",
      headline:
        twoSaveArtists.length > 0
          ? `${twoSaveArtists.length.toLocaleString()} artists with exactly two likes and no current top slot`
          : "No two-save almosts in this sample",
      items: twoSaveArtists.slice(0, TOP_N).map((artist) => {
        const sample = artist.oldestSaved.track;
        return {
          id: artist.id,
          trackId: sample.id,
          label: artist.name,
          detail:
            artist.ageDays === 0
              ? `2 likes · e.g. ${sample.name} · liked today`
              : `2 likes · e.g. ${sample.name} · oldest ${artist.ageDays.toLocaleString()}d ago`,
          value: artist.ageDays,
          imageUrl: sample.imageUrl ?? null,
        };
      }),
    },
    {
      id: "recent-never-topped",
      title: "Liked recently, never topped",
      calculated:
        "Fetched likes from the last 90 days that do not appear in any of your 4-week, 6-month, or multi-year top 50s. Newest like first.",
      means: "Impulse shelf — you hearted it this season and it never became rotation.",
      bar: "Recency (newer = longer). Days since like inverted among this set.",
      source: "Liked Songs + top tracks (all three windows)",
      headline:
        recentNeverTopped.length > 0
          ? `${recentNeverTopped.length.toLocaleString()} recent likes never made a top 50`
          : "No recent never-topped likes in this sample",
      items: recentNeverTopped.slice(0, TOP_N).map(({ saved, ageDays }, i) =>
        trackItem(
          saved.track,
          ageDays === 0
            ? "liked today · never topped"
            : `liked ${ageDays}d ago · never topped`,
          TOP_N - i,
        ),
      ),
    },
    {
      id: "rank-freefall",
      title: "Rank freefall",
      calculated:
        "Songs that were in the top 10 of your 6-month list and are absent from your 4-week top 50. Highest former rank first.",
      means: "Not a soft fade — a hard drop from the half-year podium.",
      bar: "Former 6-month rank. #1 fall is the longest bar.",
      source: "Top tracks (6 months and 4 weeks)",
      headline:
        rankFreefall.length > 0
          ? `${rankFreefall.length} of your half-year top 10 fell out this month`
          : "Your half-year top 10 all still show up in the four-week list",
      items: rankFreefall.slice(0, TOP_N).map(({ track, rank }) =>
        trackItem(
          track,
          longIds.has(track.id)
            ? `was 6-month #${rank} · also multi-year`
            : `was 6-month #${rank}`,
          11 - rank,
        ),
      ),
    },
    {
      id: "quiet-rematch",
      title: "Quiet rematch",
      calculated:
        "Liked Songs older than a year that are back in your 4-week top 50, but are not in the multi-year top 50. Sorted by current 4-week rank.",
      means: "A random old save woke up — not a years-long staple returning, just a quiet rematch.",
      bar: "Current 4-week rank. Higher rank, longer bar.",
      source: "Liked Songs + top tracks (4 weeks and several years)",
      headline:
        quietRematch.length > 0
          ? `${quietRematch.length} old likes rematched without being multi-year staples`
          : "No quiet rematches in this sample",
      items: quietRematch.slice(0, TOP_N).map(({ saved, rank, ageDays }) =>
        trackItem(
          saved.track,
          `4-week #${rank} · liked ${Math.round(ageDays / 365)}y ago`,
          51 - rank,
        ),
      ),
    },
    {
      id: "deep-cut-saves",
      title: "Deep-cut saves",
      calculated:
        "Fetched likes that never appear in any top-track window, from artists who do appear in at least one of your top-artist windows. Oldest like first.",
      means: "You play them — you just hearted the B-side and left it on the shelf.",
      bar: "Days since you liked the deep cut. Older = longer bar.",
      source: "Liked Songs + top tracks + top artists (all windows)",
      headline:
        deepCutSaves.length > 0
          ? `${deepCutSaves.length.toLocaleString()} deep cuts saved from artists you still rank`
          : "No deep-cut saves in this sample",
      items: deepCutSaves.slice(0, TOP_N).map(({ saved, ageDays }) => {
        const topped = saved.track.artists.find(
          (a) => a.id && toppedArtistIds.has(a.id),
        );
        return trackItem(
          saved.track,
          topped
            ? `liked ${ageDays.toLocaleString()}d ago · ${topped.name} still tops`
            : `liked ${ageDays.toLocaleString()}d ago · artist still tops`,
          ageDays,
        );
      }),
    },
    {
      id: "mainstream-ghosts",
      title: "Mainstream ghosts",
      calculated:
        "Songs from “Left the long run” re-sorted by Spotify popularity (0–100), highest first. Same membership: multi-year top, out of both shorter windows.",
      means: "Hits you used to live with that the rest of the world still knows — and you stopped ranking.",
      bar: "Spotify popularity score. More popular = longer bar.",
      source: "Top tracks (several years, 6 months, and 4 weeks) + popularity",
      headline:
        mainstreamGhosts.length > 0
          ? `Highest-popularity ghost: ${mainstreamGhosts[0]?.track.popularity ?? 0}/100`
          : "No multi-year ghosts to rank by popularity",
      items: mainstreamGhosts.slice(0, TOP_N).map(({ track, rank }) =>
        trackItem(
          track,
          `popularity ${track.popularity} · was multi-year #${rank}`,
          track.popularity,
        ),
      ),
    },
    {
      id: "genres-cooled",
      title: "Genres that cooled",
      calculated:
        "Genres tagged on your 6-month top artists that do not appear on any 4-week top artist. Most medium-window artist tags first.",
      means: "Sounds that were in the half-year mix and dropped out of this month’s artist list.",
      bar: "How many 6-month top artists carried that genre. More artists = longer bar.",
      source: "Top artists (6 months and 4 weeks) · Spotify genre tags",
      headline:
        cooledGenres.length > 0
          ? `${cooledGenres.length} genres cooled off this month`
          : "No genres dropped between the half-year and four-week artist lists",
      items: cooledGenres.slice(0, TOP_N).map(({ genre, count }) => ({
        id: genre,
        label: genre,
        detail: `${count} six-month artist${count === 1 ? "" : "s"}`,
        value: count,
        imageUrl: null,
      })),
    },
  ];

  return {
    year,
    fetchedAt: now.toISOString(),
    profileName: snap.profileName,
    headlines,
    summary: {
      likedCount: snap.likedTotal ?? snap.liked.length,
      likedThisYearCount: likedThisYear.length,
      likedNeverToppedCount: neverTopped.length,
      shortLikedCount,
      monthOnlyTrackCount: monthOnlyTracks.length,
      monthOnlyArtistCount: monthOnlyArtists.length,
      shortTrackCount: snap.shortTracks.length,
      mediumTrackCount: snap.mediumTracks.length,
      longTrackCount: snap.longTracks.length,
      shortArtistCount: snap.shortArtists.length,
      mediumArtistCount: snap.mediumArtists.length,
      longArtistCount: snap.longArtists.length,
      shortTopTrackId: snap.shortTracks[0]?.id ?? null,
    },
    cards,
  };
}
