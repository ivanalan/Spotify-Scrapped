import "server-only";

import {
  SCRAPPED_API_YEAR,
  buildScrappedApiReport,
  type ScrappedApiReport,
} from "./scrapped-api";
import {
  getSpotifyAccessToken,
  getSpotifyConnection,
  getSpotifyProfile,
} from "./spotify";
import {
  getSavedTracksDetailed,
  getTopArtists,
  getTopTracks,
} from "./spotify/listening";

export type ScrappedApiLabResult =
  | { kind: "ready"; report: ScrappedApiReport }
  | { kind: "needs_auth"; message: string }
  | { kind: "error"; message: string };

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

  try {
    const connection = await getSpotifyConnection();
    const [
      profile,
      shortTracks,
      mediumTracks,
      longTracks,
      shortArtists,
      mediumArtists,
      longArtists,
      liked,
    ] = await Promise.all([
      getSpotifyProfile().catch(() => null),
      getTopTracks("short_term"),
      getTopTracks("medium_term"),
      getTopTracks("long_term"),
      getTopArtists("short_term"),
      getTopArtists("medium_term"),
      getTopArtists("long_term"),
      getSavedTracksDetailed(20),
    ]);

    const report = buildScrappedApiReport(
      {
        profileName:
          profile?.display_name ?? connection.displayName ?? null,
        shortTracks,
        mediumTracks,
        longTracks,
        shortArtists,
        mediumArtists,
        longArtists,
        liked,
      },
      year,
    );

    return { kind: "ready", report };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Spotify API request failed.";
    return { kind: "error", message };
  }
}
