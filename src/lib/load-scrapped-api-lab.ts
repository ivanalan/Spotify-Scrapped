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
  type StoredApiLabSnapshot,
} from "./spotify/api-lab-snapshot";
import {
  getArtistSampleTracks,
  getSavedTracksDetailed,
  getTopArtists,
  getTopTracks,
} from "./spotify/listening";

/**
 * Ensure #1 sabbatical artist has a playable trackId that differs from the
 * #1 left-long song — otherwise artist-act slides keep the same soundtrack URI.
 */
async function ensureArtistActSoundtrack(
  report: ScrappedApiReport,
): Promise<boolean> {
  const songs = report.cards.find((c) => c.id === "left-long-run");
  const artists = report.cards.find((c) => c.id === "left-long-artists");
  const lead = artists?.items[0];
  if (!lead?.label) return false;

  const avoidId = songs?.items[0]?.trackId ?? null;
  if (lead.trackId && lead.trackId !== avoidId) return false;

  const cooldown = getSpotifyCooldown();
  if (cooldown.remainingSec > 0) return false;

  try {
    const samples = await getArtistSampleTracks(lead.id, lead.label, 5);
    const sample =
      samples.find((t) => t.id !== avoidId) ?? samples[0] ?? null;
    if (!sample) return false;
    lead.trackId = sample.id;
    if (!lead.imageUrl) lead.imageUrl = sample.imageUrl;
    return true;
  } catch {
    return false;
  }
}

export type ScrappedApiLabResult =
  | {
      kind: "ready";
      report: ScrappedApiReport;
      stored?: StoredApiLabSnapshot;
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

async function reportFromSnapshot(
  year: number,
  userId?: string,
): Promise<Extract<ScrappedApiLabResult, { kind: "ready" }> | null> {
  const stored = await readApiLabSnapshot(userId);
  if (!stored) return null;
  // Prefer the sealed report (cookie / per-user file). Rebuild only if an older
  // shape somehow still has raw snap fields (shouldn't after migrate).
  const report = stored.report;
  if (!report || report.year !== year) {
    return null;
  }
  report.fetchedAt = stored.fetchedAt;

  // Older snapshots often reuse the #1 song as the artist sample (or omit
  // trackId). Patch in-memory so /scrapped can switch audio without a
  // full lab refresh; persist when we can.
  if (await ensureArtistActSoundtrack(report)) {
    stored.report = report;
    await writeApiLabSnapshot(stored);
  }

  return { kind: "ready", report, stored, ...cooldownFields() };
}

export async function loadScrappedApiLab(
  year: number = SCRAPPED_API_YEAR,
): Promise<ScrappedApiLabResult> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return {
      kind: "needs_auth",
      message:
        "Connect Spotify to load Scrapped metrics (top songs, top artists, and Liked Songs).",
    };
  }

  const connection = await getSpotifyConnection();
  const cached = await reportFromSnapshot(year, connection.userId);
  if (cached) return cached;

  return {
    kind: "needs_fetch",
    message:
      "Load tops and Liked Songs from Spotify once. Reloads use a saved snapshot and do not spend quota.",
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
        "Connect Spotify to load Scrapped metrics (top songs, top artists, and Liked Songs).",
    };
  }

  const connection = await getSpotifyConnection();
  const cooldown = getSpotifyCooldown();
  if (cooldown.remainingSec > 0) {
    return (
      (await reportFromSnapshot(year, connection.userId)) ?? {
        kind: "needs_fetch",
        message:
          "Load tops and Liked Songs from Spotify once. Reloads use a saved snapshot and do not spend quota.",
        ...cooldownFields(),
      }
    );
  }

  try {
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
      likedPage,
    ] = await Promise.all([
      absorb(getTopTracks("short_term"), []),
      absorb(getTopTracks("medium_term"), []),
      absorb(getTopTracks("long_term"), []),
      absorb(getTopArtists("short_term"), []),
      absorb(getTopArtists("medium_term"), []),
      absorb(getTopArtists("long_term"), []),
      absorb(getSavedTracksDetailed(4), { tracks: [], total: 0 }),
    ]);
    const liked = likedPage.tracks;

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
      return (
        (await reportFromSnapshot(year, connection.userId)) ??
        errorResult(lastError)
      );
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
      likedTotal: likedPage.total,
    };
    const fetchedAt = new Date().toISOString();
    const report = buildScrappedApiReport(snap, year);
    report.fetchedAt = fetchedAt;

    await ensureArtistActSoundtrack(report);

    const likedUris: string[] = [];
    for (const row of liked) {
      if (row.track?.uri) likedUris.push(row.track.uri);
    }

    const stored: StoredApiLabSnapshot = {
      fetchedAt,
      userId: connection.userId,
      report,
      likedUris,
    };

    return { kind: "ready", report, stored };
  } catch (err) {
    return (
      (await reportFromSnapshot(year, connection.userId)) ?? errorResult(err)
    );
  }
}
