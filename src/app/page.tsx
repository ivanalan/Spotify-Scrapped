import { ScrappedExperience } from "@/components/scrapped/ScrappedExperience";
import { ScrappedGate } from "@/components/scrapped/ScrappedGate";
import { loadScrappedApiLab } from "@/lib/load-scrapped-api-lab";
import { getSpotifyConnection } from "@/lib/spotify";
import {
  isNotAllowlistedAuthError,
  spotifyAuthGateMessage,
} from "@/lib/spotify/oauth";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ spotify_error?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { spotify_error: spotifyError } = await searchParams;
  const result = await loadScrappedApiLab();
  const { displayName } = await getSpotifyConnection();

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

  return <ScrappedExperience report={result.report} />;
}
