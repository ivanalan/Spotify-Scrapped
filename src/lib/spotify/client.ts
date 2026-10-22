import "server-only";
import { cache } from "react";
import fs from "node:fs";
import path from "node:path";
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
  retryAfterSeconds?: number;
  quotaExceeded?: boolean;

  constructor(
    message: string,
    status: number,
    body: unknown,
    retryAfterSeconds?: number,
    quotaExceeded?: boolean,
  ) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.body = body;
    this.retryAfterSeconds = retryAfterSeconds;
    this.quotaExceeded = quotaExceeded;
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

const GET_TTL_MS = 2 * 60_000;
const RATE_WINDOW_MS = 30_000;
const QUOTA_COOLDOWN_MS = 15 * 60_000;

type SpotifyClientState = {
  cooldownUntil: number;
  quotaExceeded: boolean;
  getCache: Map<string, { expiresAt: number; value: unknown }>;
};

const COOLDOWN_PATH = path.join(
  process.cwd(),
  "data",
  "processed",
  "spotify-cooldown.json",
);

const g = globalThis as typeof globalThis & {
  __spotifyClientState?: SpotifyClientState;
};

function readDiskCooldown(): Pick<
  SpotifyClientState,
  "cooldownUntil" | "quotaExceeded"
> {
  try {
    const parsed = JSON.parse(fs.readFileSync(COOLDOWN_PATH, "utf8")) as {
      cooldownUntil?: number;
      quotaExceeded?: boolean;
    };
    return {
      cooldownUntil:
        typeof parsed.cooldownUntil === "number" ? parsed.cooldownUntil : 0,
      quotaExceeded: Boolean(parsed.quotaExceeded),
    };
  } catch {
    return { cooldownUntil: 0, quotaExceeded: false };
  }
}

function writeDiskCooldown(cooldownUntil: number, quotaExceeded: boolean) {
  fs.mkdirSync(path.dirname(COOLDOWN_PATH), { recursive: true });
  fs.writeFileSync(
    COOLDOWN_PATH,
    `${JSON.stringify({ cooldownUntil, quotaExceeded })}\n`,
  );
}

function clientState(): SpotifyClientState {
  if (!g.__spotifyClientState) {
    const disk = readDiskCooldown();
    g.__spotifyClientState = {
      cooldownUntil: disk.cooldownUntil,
      quotaExceeded: disk.quotaExceeded,
      getCache: new Map(),
    };
  }
  return g.__spotifyClientState;
}

let gateActive = 0;
const gateWaiters: (() => void)[] = [];
const GATE_MAX = 1;

async function withGate<T>(fn: () => Promise<T>): Promise<T> {
  if (gateActive >= GATE_MAX) {
    await new Promise<void>((resolve) => gateWaiters.push(resolve));
  }
  gateActive += 1;
  try {
    return await fn();
  } finally {
    gateActive -= 1;
    gateWaiters.shift()?.();
  }
}

function cacheKey(token: string, path: string) {
  return `${token.slice(-12)}:${path}`;
}

function retryAfterMs(response: Response, quotaExceeded: boolean) {
  const header = response.headers.get("Retry-After");
  let ms = RATE_WINDOW_MS;
  if (header) {
    const asNum = Number(header);
    if (Number.isFinite(asNum) && asNum > 0) {
      ms = asNum * 1000;
    } else {
      const when = Date.parse(header);
      if (Number.isFinite(when)) ms = Math.max(0, when - Date.now());
    }
  }
  const min = quotaExceeded ? QUOTA_COOLDOWN_MS : RATE_WINDOW_MS;
  const max = quotaExceeded ? 60 * 60_000 : 15 * 60_000;
  return Math.min(max, Math.max(min, ms));
}

export function getSpotifyCooldown(): {
  remainingSec: number;
  quotaExceeded: boolean;
} {
  const state = clientState();
  return {
    remainingSec: Math.max(
      0,
      Math.ceil((state.cooldownUntil - Date.now()) / 1000),
    ),
    quotaExceeded: state.quotaExceeded,
  };
}

export function getSpotifyCooldownRemainingSec(): number {
  return getSpotifyCooldown().remainingSec;
}

function throwRateLimited(path: string): never {
  const { remainingSec, quotaExceeded } = getSpotifyCooldown();
  const waitSec = Math.max(1, remainingSec);
  throw new SpotifyApiError(
    quotaExceeded
      ? `Spotify development-mode quota exceeded for ${path}. Retry in about ${waitSec}s.`
      : `Spotify API rate limited for ${path}. Retry in about ${waitSec}s.`,
    429,
    null,
    waitSec,
    quotaExceeded,
  );
}

/**
 * Low-level Spotify Web API helper. Path is relative to `/v1`, e.g. `/me`.
 * Server-only: do not import from client components.
 *
 * On 429: cache hits still return; otherwise fail immediately and cool down
 * until Retry-After (Spotify: rolling 30s window, limit is app-wide).
 */
export async function spotifyFetch<T>(
  path: string,
  options: SpotifyFetchOptions = {},
): Promise<T> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    throw new SpotifyApiError("Not connected to Spotify", 401, null);
  }

  const method = (options.method ?? "GET").toUpperCase();
  const key = method === "GET" ? cacheKey(token, path) : null;
  const state = clientState();
  if (key) {
    const hit = state.getCache.get(key);
    if (hit && Date.now() < hit.expiresAt) {
      return hit.value as T;
    }
  }

  if (Date.now() < state.cooldownUntil) {
    throwRateLimited(path);
  }

  const url = path.startsWith("http")
    ? path
    : `${SPOTIFY_API}${path.startsWith("/") ? path : `/${path}`}`;

  return withGate(async () => {
    const gated = clientState();
    if (key) {
      const hit = gated.getCache.get(key);
      if (hit && Date.now() < hit.expiresAt) {
        return hit.value as T;
      }
    }
    if (Date.now() < gated.cooldownUntil) {
      throwRateLimited(path);
    }

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
      let quotaExceeded = false;
      try {
        const text = await response.text();
        const parsed = text ? (JSON.parse(text) as { error?: { reason?: string } }) : null;
        quotaExceeded = parsed?.error?.reason === "QUOTA_EXCEEDED";
      } catch {
        /* body is optional */
      }
      gated.quotaExceeded = quotaExceeded;
      gated.cooldownUntil = Date.now() + retryAfterMs(response, quotaExceeded);
      writeDiskCooldown(gated.cooldownUntil, gated.quotaExceeded);
      throwRateLimited(path);
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

    if (key) {
      clientState().getCache.set(key, {
        expiresAt: Date.now() + GET_TTL_MS,
        value: body,
      });
    }
    return body as T;
  });
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
      // Batch endpoint is restricted on some apps: fall back concurrently.
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
