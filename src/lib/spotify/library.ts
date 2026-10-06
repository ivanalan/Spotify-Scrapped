import {
  getSpotifyConnection,
  getSpotifyCooldownRemainingSec,
  spotifyFetch,
} from "./client";

const LIKED_URI_TTL_MS = 5 * 60_000;

type LikedUriCache = {
  userId: string;
  uris: string[];
  expiresAt: number;
};

let likedUriCache: LikedUriCache | null = null;

type SavedTracksPage = {
  items: { track: { uri: string | null; id: string | null } | null }[];
  next: string | null;
};

/** Liked Songs track URIs (paginated, capped for Scrapped join loads). */
export async function getLikedTrackUris(maxPages = 40): Promise<string[]> {
  const { userId } = await getSpotifyConnection();
  if (
    maxPages >= 40 &&
    userId &&
    likedUriCache &&
    likedUriCache.userId === userId &&
    Date.now() < likedUriCache.expiresAt
  ) {
    return likedUriCache.uris;
  }

  if (getSpotifyCooldownRemainingSec() > 0) {
    return likedUriCache?.userId === userId ? likedUriCache.uris : [];
  }

  const uris: string[] = [];
  let path: string | null = "/me/tracks?limit=50";
  let pages = 0;

  while (path && pages < maxPages) {
    const page: SavedTracksPage = await spotifyFetch<SavedTracksPage>(path);
    pages += 1;
    for (const item of page.items) {
      if (item.track?.uri) uris.push(item.track.uri);
    }
    path = page.next;
  }

  if (maxPages >= 40 && userId) {
    likedUriCache = {
      userId,
      uris,
      expiresAt: Date.now() + LIKED_URI_TTL_MS,
    };
  }

  return uris;
}
