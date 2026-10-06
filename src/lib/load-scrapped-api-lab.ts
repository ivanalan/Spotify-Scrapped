import "server-only";

import {
  SCRAPPED_API_YEAR,
  buildScrappedApiReport,
  type ScrappedApiReport,
} from "./scrapped-api";
import {
  SpotifyApiError,
  getSpotifyAccessToken,
  getSpotifyConnection,
  getSpotifyCooldown,
} from "./spotify";
import {
  readApiLabSnapshot,
  writeApiLabSnapshot,
} from "./spotify/api-lab-snapshot";
import {
  getSavedTracksDetailed,
  getTopArtists,
  getTopTracks,
} from "./spotify/listening";

export type ScrappedApiLabResult =
  | {
      kind: "ready";
      report: ScrappedApiReport;
      retryAfterSeconds?: number;
      quotaExceeded?: boolean;
    }
  | { kind: "needs_auth"; message: string }
  | {
      kind: "needs_fetch";
      message: string;
      retryAfterSeconds?: number;
      quotaExceeded?: boolean;
    }
  | {
      kind: "error";
      message: string;
      retryAfterSeconds?: number;
      quotaExceeded?: boolean;
    };

function cooldownFields() {
  const cooldown = getSpotifyCooldown();
  if (cooldown.remainingSec <= 0) return {};
  return {
    retryAfterSeconds: cooldown.remainingSec,
    quotaExceeded: cooldown.quotaExceeded,
  };
}

function errorResult(err: unknown): Extract<ScrappedApiLabResult, { kind: "error" }> {
  const message =
    err instanceof Error ? err.message : "Spotify API request failed.";
  if (!(err instanceof SpotifyApiError) || err.status !== 429) {
    return { kind: "error", message };
  }
  const cooldown = getSpotifyCooldown();
  return {
    kind: "error",
    message,
    retryAfterSeconds: err.retryAfterSeconds ?? cooldown.remainingSec,
    quotaExceeded: err.quotaExceeded ?? cooldown.quotaExceeded,
  };
}

function reportFromSnapshot(
  year: number,
): Extract<ScrappedApiLabResult, { kind: "ready" }> | null {
  const stored = readApiLabSnapshot();
  if (!stored) return null;
  const report = buildScrappedApiReport(stored.snap, year);
  report.fetchedAt = stored.fetchedAt;
  return { kind: "ready", report, ...cooldownFields() };
}

export async function loadScrappedApiLab(
  year: number = SCRAPPED_API_YEAR,
): Promise<ScrappedApiLabResult> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return {
      kind: "needs_auth",
      message:
        "Connect Spotify to load API Scrapped metrics (top songs, top artists, and Liked Songs).",
    };
  }

  const cached = reportFromSnapshot(year);
  if (cached) return cached;

  return {
    kind: "needs_fetch",
    message:
      "Load tops and Liked Songs from Spotify once. Reloads use a local snapshot and do not spend quota.",
    ...cooldownFields(),
  };
}

/** Network fetch. Call only from the explicit Load/Refresh action. */
export async function fetchAndStoreScrappedApiLab(
  year: number = SCRAPPED_API_YEAR,
): Promise<ScrappedApiLabResult> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return {
      kind: "needs_auth",
      message:
        "Connect Spotify to load API Scrapped metrics (top songs, top artists, and Liked Songs).",
    };
  }

  const cooldown = getSpotifyCooldown();
  if (cooldown.remainingSec > 0) {
    return (
      reportFromSnapshot(year) ?? {
        kind: "needs_fetch",
        message:
          "Load tops and Liked Songs from Spotify once. Reloads use a local snapshot and do not spend quota.",
        ...cooldownFields(),
      }
    );
  }

  try {
    const connection = await getSpotifyConnection();
    let lastError: Error | null = null;
    const absorb = <T>(p: Promise<T>, fallback: T) =>
      p.catch((err: unknown) => {
        lastError = err instanceof Error ? err : new Error(String(err));
        return fallback;
      });

    const [
      shortTracks,
      mediumTracks,
      longTracks,
      shortArtists,
      mediumArtists,
      longArtists,
      liked,
    ] = await Promise.all([
      absorb(getTopTracks("short_term"), []),
      absorb(getTopTracks("medium_term"), []),
      absorb(getTopTracks("long_term"), []),
      absorb(getTopArtists("short_term"), []),
      absorb(getTopArtists("medium_term"), []),
      absorb(getTopArtists("long_term"), []),
      absorb(getSavedTracksDetailed(4), []),
    ]);

    const hasData =
      shortTracks.length +
        mediumTracks.length +
        longTracks.length +
        shortArtists.length +
        mediumArtists.length +
        longArtists.length +
        liked.length >
      0;

    if (!hasData && lastError) {
      return reportFromSnapshot(year) ?? errorResult(lastError);
    }

    const snap = {
      profileName: connection.displayName ?? null,
      shortTracks,
      mediumTracks,
      longTracks,
      shortArtists,
      mediumArtists,
      longArtists,
      liked,
    };
    const fetchedAt = new Date().toISOString();
    writeApiLabSnapshot({
      fetchedAt,
      userId: connection.userId,
      snap,
    });

    const report = buildScrappedApiReport(snap, year);
    report.fetchedAt = fetchedAt;
    return { kind: "ready", report };
  } catch (err) {
    return reportFromSnapshot(year) ?? errorResult(err);
  }
}
