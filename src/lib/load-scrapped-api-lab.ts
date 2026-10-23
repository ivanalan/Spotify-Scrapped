import "server-only";

import {
  SCRAPPED_API_YEAR,
  buildScrappedApiReport,
  ensureApiReportSummary,
  type ScrappedApiReport,
} from "./scrapped-api";
import {
  SpotifyApiError,
  getSpotifyAccessToken,
  getSpotifyConnection,
  getSpotifyCooldown,
} from "./spotify";
import {
  API_LAB_SNAPSHOT_VERSION,
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
import { upsertStorySnapshot } from "./story-snapshot/db";

/**
 * Ensure sabbatical artists (#1 and #2) have playable trackIds distinct from
 * the #1 left-long song: otherwise artist-act slides keep the same URI.
 */
async function ensureArtistActSoundtrack(
  report: ScrappedApiReport,
): Promise<boolean> {
  const songs = report.cards.find((c) => c.id === "left-long-run");
  const artists = report.cards.find((c) => c.id === "left-long-artists");
  if (!artists?.items.length) return false;

  const avoidId = songs?.items[0]?.trackId ?? null;
  const cooldown = getSpotifyCooldown();
  if (cooldown.remainingSec > 0) return false;

  let changed = false;
  const used = new Set<string>();
  if (avoidId) used.add(avoidId);

  for (const lead of artists.items.slice(0, 2)) {
    if (!lead?.label) continue;
    if (lead.trackId && !used.has(lead.trackId)) {
      used.add(lead.trackId);
      continue;
    }

    try {
      const samples = await getArtistSampleTracks(lead.id, lead.label, 5);
      const sample =
        samples.find((t) => !used.has(t.id)) ?? samples[0] ?? null;
      if (!sample) continue;
      lead.trackId = sample.id;
      if (!lead.imageUrl) lead.imageUrl = sample.imageUrl;
      used.add(sample.id);
      changed = true;
    } catch {
      /* keep existing sample */
    }
  }

  return changed;
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
      message?: string;
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

/** Pre-art snapshots omit imageUrl; sealed cookies can't be backfilled without a refetch. */
function reportMissingArt(report: ScrappedApiReport): boolean {
  const songs = report.cards.find((c) => c.id === "left-long-run");
  const items = songs?.items ?? [];
  if (items.length === 0) return false;
  return items.every((item) => !item.imageUrl);
}

async function reportFromSnapshot(
  year: number,
  userId?: string,
): Promise<Extract<ScrappedApiLabResult, { kind: "ready" }> | null> {
  const stored = await readApiLabSnapshot(userId);
  if (!stored?.report) return null;
  try {
    // Prefer the sealed report (cookie / per-user file). Rebuild only if an older
    // shape somehow still has raw snap fields (shouldn't after migrate).
    const report = ensureApiReportSummary(stored.report);
    if (!report || report.year !== year) {
      return null;
    }
    if (reportMissingArt(report)) {
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

    // Omit `stored` from the page result; Lab UI only needs `report`.
    return { kind: "ready", report, ...cooldownFields() };
  } catch {
    return null;
  }
}

export async function loadScrappedApiLab(
  year: number = SCRAPPED_API_YEAR,
): Promise<ScrappedApiLabResult> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return {
      kind: "needs_auth",
      message:
        "Sign in to Spotify to load Scrapped metrics (top songs, top artists, and Liked Songs).",
    };
  }

  const connection = await getSpotifyConnection();
  const cached = await reportFromSnapshot(year, connection.userId);
  if (cached) return cached;

  return {
    kind: "needs_fetch",
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
        "Sign in to Spotify to load Scrapped metrics (top songs, top artists, and Liked Songs).",
    };
  }

  const connection = await getSpotifyConnection();
  const cooldown = getSpotifyCooldown();
  if (cooldown.remainingSec > 0) {
    return (
      (await reportFromSnapshot(year, connection.userId)) ?? {
        kind: "needs_fetch",
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

    // Liked Songs is required for one-like / liked-this-year slides. Do not
    // absorb failures into an empty library: that shipped as "no liked songs"
    // on Vercel when the paginated fetch timed out or rate-limited.
    const likedPage = await getSavedTracksDetailed();
    const liked = likedPage.tracks;
    if (likedPage.total > 0 && liked.length === 0) {
      throw new Error(
        "Liked Songs returned empty despite a non-zero library total. Retry Load.",
      );
    }

    const [
      shortTracks,
      mediumTracks,
      longTracks,
      shortArtists,
      mediumArtists,
      longArtists,
    ] = await Promise.all([
      absorb(getTopTracks("short_term"), []),
      absorb(getTopTracks("medium_term"), []),
      absorb(getTopTracks("long_term"), []),
      absorb(getTopArtists("short_term"), []),
      absorb(getTopArtists("medium_term"), []),
      absorb(getTopArtists("long_term"), []),
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
      schemaVersion: API_LAB_SNAPSHOT_VERSION,
      report,
      likedUris,
    };

    // Persist to disk so local refreshes aren't cookie-only.
    await writeApiLabSnapshot(stored);

    // Durable post-seat replay (/s/[token]); soft-fails without Neon.
    if (connection.userId) {
      await upsertStorySnapshot({
        spotifyUserId: connection.userId,
        year,
        report,
      });
    }

    return { kind: "ready", report, stored };
  } catch (err) {
    return (
      (await reportFromSnapshot(year, connection.userId)) ?? errorResult(err)
    );
  }
}
