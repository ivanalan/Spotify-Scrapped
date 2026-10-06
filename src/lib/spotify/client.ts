import "server-only";
import { cache } from "react";
import { refreshAccessToken } from "./oauth";
import {
  readSpotifySession,
  setSpotifySessionCookie,
  type SpotifySession,
} from "./session";

const SPOTIFY_API = "https://api.spotify.com/v1";

export class SpotifyApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.body = body;
  }
}

/** Per-request dedupe for layout AuthControls + page loaders. */
const getFreshSession = cache(async (): Promise<SpotifySession | null> => {
  const session = await readSpotifySession();
  if (!session) return null;

  // Refresh one minute before expiry
  if (Date.now() < session.expiresAt * 1000 - 60_000) {
    return session;
  }

  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    const next: SpotifySession = {
      ...session,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: refreshed.expiresAt,
    };
    await setSpotifySessionCookie(next);
    return next;
  } catch {
    return null;
  }
});

/** Valid access token for the connected Spotify user (server-only). */
export const getSpotifyAccessToken = cache(async (): Promise<string | null> => {
  const session = await getFreshSession();
  return session?.accessToken ?? null;
});

export const getSpotifyConnection = cache(async (): Promise<{
  connected: boolean;
  displayName?: string | null;
  userId?: string;
}> => {
  const session = await getFreshSession();
  if (!session) return { connected: false };
  return {
    connected: true,
    displayName: session.displayName,
    userId: session.userId,
  };
});

type SpotifyFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Low-level Spotify Web API helper. Path is relative to `/v1`, e.g. `/me`.
 * Server-only — do not import from client components.
 */
export async function spotifyFetch<T>(
  path: string,
  options: SpotifyFetchOptions = {},
): Promise<T> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    throw new SpotifyApiError("Not connected to Spotify", 401, null);
  }

  const url = path.startsWith("http")
    ? path
    : `${SPOTIFY_API}${path.startsWith("/") ? path : `/${path}`}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      cache: "no-store",
    });

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      await sleep(Math.min(1_000, Math.max(200, retryAfter * 1000)));
      continue;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const body = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      throw new SpotifyApiError(
        `Spotify API ${response.status} for ${path}`,
        response.status,
        body,
      );
    }

    return body as T;
  }

  throw new SpotifyApiError(`Spotify API rate limited for ${path}`, 429, null);
}

export async function getSpotifyProfile() {
  return spotifyFetch<{
    id: string;
    display_name: string | null;
    email?: string;
    images: { url: string }[];
    product?: string;
  }>("/me");
}

export type TrackEnrichment = {
  id: string;
  name: string;
  duration_ms: number;
  uri: string;
  artists: { id: string; name: string }[];
  album?: {
    name: string;
    images: { url: string; width: number | null; height: number | null }[];
  } | null;
};

export async function getTrack(id: string): Promise<TrackEnrichment> {
  return spotifyFetch<TrackEnrichment>(`/tracks/${encodeURIComponent(id)}`);
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

/** Batch track lookup (up to 50 ids). Falls back to concurrent per-id fetches if batch is blocked. */
export async function getTracks(
  ids: string[],
): Promise<(TrackEnrichment | null)[]> {
  const out: (TrackEnrichment | null)[] = ids.map(() => null);
  if (ids.length === 0) return out;

  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const q = chunk.map(encodeURIComponent).join(",");
    try {
      const res = await spotifyFetch<{ tracks: (TrackEnrichment | null)[] }>(
        `/tracks?ids=${q}`,
      );
      for (let j = 0; j < chunk.length; j++) {
        out[i + j] = res.tracks[j] ?? null;
      }
    } catch {
      // Batch endpoint is restricted on some apps — fall back concurrently.
      const fetched = await mapPool(chunk, 6, async (id) => {
        if (!id) return null;
        try {
          return await getTrack(id);
        } catch {
          return null;
        }
      });
      for (let j = 0; j < chunk.length; j++) {
        out[i + j] = fetched[j] ?? null;
      }
    }
  }

  return out;
}

export { trackIdFromUri } from "./uri";
