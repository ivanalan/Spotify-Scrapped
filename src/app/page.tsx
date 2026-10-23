import { ScrappedExperience } from "@/components/scrapped/ScrappedExperience";
import { ScrappedGate } from "@/components/scrapped/ScrappedGate";
import { loadScrappedApiLab } from "@/lib/load-scrapped-api-lab";
import { SCRAPPED_API_YEAR } from "@/lib/scrapped-api-year";
import { getSpotifyConnection, getSpotifyProfile } from "@/lib/spotify";
import {
  isNotAllowlistedAuthError,
  spotifyAuthGateMessage,
} from "@/lib/spotify/oauth";
import {
  maybeSendStoryLinkEmailOnce,
  upsertStorySnapshot,
} from "@/lib/story-snapshot/db";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ spotify_error?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { spotify_error: spotifyError } = await searchParams;
  const result = await loadScrappedApiLab();
  const connection = await getSpotifyConnection();
  const { displayName, userId } = connection;

  if (result.kind === "needs_auth") {
    return (
      <ScrappedGate
        mode="auth"
        message={result.message}
        seatsFull={
          Boolean(spotifyError) && isNotAllowlistedAuthError(spotifyError!)
        }
        authError={
          spotifyError ? spotifyAuthGateMessage(spotifyError) : undefined
        }
      />
    );
  }

  if (result.kind === "needs_fetch" || result.kind === "error") {
    return (
      <ScrappedGate
        mode={result.kind === "error" ? "error" : "fetch"}
        message={result.message}
        displayName={displayName}
        retryAfterSeconds={result.retryAfterSeconds}
        quotaExceeded={result.quotaExceeded}
      />
    );
  }

  // Older sessions may lack email until re-auth; pull once from /me if needed.
  let email = connection.email ?? null;
  if (!email && userId) {
    try {
      const profile = await getSpotifyProfile();
      email = profile.email ?? null;
    } catch {
      /* story link still works without mail */
    }
  }

  const year = result.report.year ?? SCRAPPED_API_YEAR;

  // Cookie/FS-ready decks never hit lab-refresh; upsert here so email +
  // /s/[token] still work without a re-Load (D-041).
  const persisted =
    userId != null
      ? await upsertStorySnapshot({
          spotifyUserId: userId,
          year,
          report: result.report,
          email,
        })
      : null;

  if (persisted && userId && email) {
    await maybeSendStoryLinkEmailOnce({
      spotifyUserId: userId,
      year,
      email,
      storyUrl: persisted.storyUrl,
    });
  }

  return <ScrappedExperience report={result.report} />;
}
