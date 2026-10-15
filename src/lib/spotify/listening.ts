import "server-only";

import { spotifyFetch } from "./client";

export type SpotifyTimeRange = "short_term" | "medium_term" | "long_term";

export type ApiArtistRef = {
  id: string;
  name: string;
};

export type ApiTrack = {
  id: string;
  uri: string;
  name: string;
  popularity: number;
  duration_ms: number;
  artists: ApiArtistRef[];
  album: { name: string } | null;
  /** Album cover URL (medium when available). */
  imageUrl: string | null;
  /** Original id when Spotify substituted another release. */
  linkedFromId: string | null;
  /** Recording id shared across album and single releases. */
  isrc: string | null;
};

type SpotifyImage = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
};

type SpotifyTrackPayload = {
  id?: string | null;
  uri?: string | null;
  name?: string;
  popularity?: number;
  duration_ms?: number;
  artists?: { id?: string | null; name?: string }[] | null;
  album?: { name?: string; images?: SpotifyImage[] | null } | null;
  linked_from?: { id?: string | null } | null;
  external_ids?: { isrc?: string | null } | null;
};

export type ApiArtist = {
  id: string;
  uri: string;
  name: string;
  popularity: number;
  genres: string[];
  imageUrl: string | null;
};

export type SavedTrack = {
  added_at: string;
  track: ApiTrack;
};

export type RecentPlay = {
  played_at: string;
  track: ApiTrack;
};

export type PlaylistTrackSample = {
  id: string;
  name: string;
  artists: string;
};

export type PlaylistSnapshot = {
  id: string;
  name: string;
  trackCount: number;
  trackIds: string[];
  /** First ~200 tracks, with names, so lab metrics can list songs. */
  samples: PlaylistTrackSample[];
};

type TopTracksPage = { items: SpotifyTrackPayload[] };
type TopArtistsPage = {
  items: {
    id: string;
    uri: string;
    name: string;
    popularity?: number;
    genres?: string[];
    images?: SpotifyImage[];
  }[];
};
type RecentPage = {
  items: { played_at: string; track: SpotifyTrackPayload | null }[];
};
type SavedPage = {
  items: { added_at: string; track: SpotifyTrackPayload | null }[];
  next: string | null;
  total?: number;
};
type PlaylistPage = {
  items: {
    id: string;
    name: string;
    tracks: { total: number } | null;
  }[];
  next: string | null;
};
type PlaylistTracksPage = {
  items: {
    track: {
      id: string | null;
      name?: string;
      type?: string;
      artists?: { name: string }[];
    } | null;
  }[];
  next: string | null;
};

/** 50 tracks/page → up to 10k likes (covers typical libraries; stops early on `next`). */
const MAX_LIKED_PAGES = 200;
const MAX_PLAYLISTS = 30;
const MAX_TRACK_PAGES_PER_PLAYLIST = 2;

/** Prefer ~300px Spotify art; fall back to the largest returned. */
function pickImageUrl(images: SpotifyImage[] | null | undefined): string | null {
  if (!images?.length) return null;
  const ranked = [...images]
    .filter((img): img is SpotifyImage & { url: string } => Boolean(img.url))
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  if (ranked.length === 0) return null;
  const mid = ranked.find((img) => (img.width ?? 0) >= 200 && (img.width ?? 0) <= 400);
  return (mid ?? ranked[0]).url;
}

function normalizeTrack(
  raw: SpotifyTrackPayload | null | undefined,
): ApiTrack | null {
  if (!raw?.id || !raw.uri || !raw.name) return null;
  return {
    id: raw.id,
    uri: raw.uri,
    name: raw.name,
    popularity: raw.popularity ?? 0,
    duration_ms: raw.duration_ms ?? 0,
    artists: (raw.artists ?? []).map((a) => ({
      id: a.id ?? "",
      name: a.name ?? "",
    })),
    album: raw.album?.name ? { name: raw.album.name } : null,
    imageUrl: pickImageUrl(raw.album?.images),
    linkedFromId: raw.linked_from?.id || null,
    isrc: raw.external_ids?.isrc || null,
  };
}

export async function getTopTracks(
  timeRange: SpotifyTimeRange,
  limit = 50,
): Promise<ApiTrack[]> {
  const res = await spotifyFetch<TopTracksPage>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
  );
  return res.items.map(normalizeTrack).filter((t): t is ApiTrack => t != null);
}

export async function getTopArtists(
  timeRange: SpotifyTimeRange,
  limit = 50,
): Promise<ApiArtist[]> {
  const res = await spotifyFetch<TopArtistsPage>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
  );
  return res.items.map((a) => ({
    id: a.id,
    uri: a.uri,
    name: a.name,
    popularity: a.popularity ?? 0,
    genres: a.genres ?? [],
    imageUrl: pickImageUrl(a.images),
  }));
}

/**
 * Playable tracks for an artist when tops/likes don't credit them.
 * Uses Search — `/artists/{id}/top-tracks` returns 403 for many apps.
 */
export async function getArtistSampleTracks(
  artistId: string,
  artistName: string,
  limit = 5,
): Promise<ApiTrack[]> {
  const name = artistName.trim();
  if (!artistId || !name) return [];

  const q = encodeURIComponent(`artist:"${name}"`);
  const res = await spotifyFetch<{
    tracks?: { items?: SpotifyTrackPayload[] };
  }>(`/search?q=${q}&type=track&market=US&limit=10`);

  const credited = (res.tracks?.items ?? [])
    .map(normalizeTrack)
    .filter(
      (t): t is ApiTrack =>
        t != null && t.artists.some((a) => a.id === artistId),
    );

  if (credited.length > 0) return credited.slice(0, limit);

  // Looser fallback when the quoted artist query is empty.
  const looseQ = encodeURIComponent(name);
  const loose = await spotifyFetch<{
    tracks?: { items?: SpotifyTrackPayload[] };
  }>(`/search?q=${looseQ}&type=track&market=US&limit=10`);
  return (loose.tracks?.items ?? [])
    .map(normalizeTrack)
    .filter(
      (t): t is ApiTrack =>
        t != null && t.artists.some((a) => a.id === artistId),
    )
    .slice(0, limit);
}

/** @deprecated Use getArtistSampleTracks — top-tracks is 403 for many apps. */
export async function getArtistTopTracks(
  artistId: string,
  _market = "US",
  limit = 5,
): Promise<ApiTrack[]> {
  const artist = await spotifyFetch<{ name?: string }>(
    `/artists/${encodeURIComponent(artistId)}`,
  );
  return getArtistSampleTracks(artistId, artist.name ?? "", limit);
}

export async function getRecentlyPlayed(limit = 50): Promise<RecentPlay[]> {
  const res = await spotifyFetch<RecentPage>(
    `/me/player/recently-played?limit=${limit}`,
  );
  const out: RecentPlay[] = [];
  for (const item of res.items ?? []) {
    const track = normalizeTrack(item.track);
    if (!track) continue;
    out.push({ played_at: item.played_at, track });
  }
  return out;
}

/** Liked Songs with `added_at` (capped page count). `total` is the full library size. */
export async function getSavedTracksDetailed(
  maxPages = MAX_LIKED_PAGES,
): Promise<{ tracks: SavedTrack[]; total: number }> {
  const out: SavedTrack[] = [];
  let path: string | null = "/me/tracks?limit=50";
  let pages = 0;
  let total = 0;

  while (path && pages < maxPages) {
    const page: SavedPage = await spotifyFetch<SavedPage>(path);
    pages += 1;
    if (pages === 1) total = page.total ?? 0;
    for (const item of page.items ?? []) {
      const track = normalizeTrack(item.track);
      if (!track) continue;
      out.push({ added_at: item.added_at, track });
    }
    path = page.next;
  }

  return { tracks: out, total: total || out.length };
}

async function tracksInPlaylist(playlistId: string): Promise<{
  ids: string[];
  samples: PlaylistTrackSample[];
}> {
  const ids: string[] = [];
  const samples: PlaylistTrackSample[] = [];
  let path: string | null =
    `/playlists/${encodeURIComponent(playlistId)}/tracks?limit=100&fields=items(track(id,name,type,artists(name))),next`;
  let pages = 0;

  while (path && pages < MAX_TRACK_PAGES_PER_PLAYLIST) {
    const page: PlaylistTracksPage = await spotifyFetch<PlaylistTracksPage>(path);
    pages += 1;
    for (const item of page.items ?? []) {
      const track = item.track;
      if (!track?.id || (track.type != null && track.type !== "track")) continue;
      ids.push(track.id);
      if (!track.name) continue;
      const artists = (track.artists ?? [])
        .map((a) => a.name)
        .filter(Boolean)
        .join(", ");
      samples.push({ id: track.id, name: track.name, artists });
    }
    path = page.next;
  }

  return { ids, samples };
}

/** User playlists with a capped sample of track ids (for shelf vs stream). */
export async function getPlaylistSnapshots(
  maxPlaylists = MAX_PLAYLISTS,
): Promise<PlaylistSnapshot[]> {
  const playlists: { id: string; name: string; trackCount: number }[] = [];
  let path: string | null = "/me/playlists?limit=50";

  while (path && playlists.length < maxPlaylists) {
    const page: PlaylistPage = await spotifyFetch<PlaylistPage>(path);
    for (const item of page.items ?? []) {
      if (!item?.id) continue;
      playlists.push({
        id: item.id,
        name: item.name,
        trackCount: item.tracks?.total ?? 0,
      });
      if (playlists.length >= maxPlaylists) break;
    }
    path = page.next;
  }

  const snapshots: PlaylistSnapshot[] = [];
  for (const pl of playlists) {
    try {
      const { ids, samples } = await tracksInPlaylist(pl.id);
      snapshots.push({
        id: pl.id,
        name: pl.name,
        trackCount: pl.trackCount,
        trackIds: ids,
        samples,
      });
    } catch {
      snapshots.push({
        id: pl.id,
        name: pl.name,
        trackCount: pl.trackCount,
        trackIds: [],
        samples: [],
      });
    }
  }

  return snapshots;
}
