import { NextResponse } from "next/server";
import { SpotifyApiError, getSpotifyAccessToken } from "@/lib/spotify";
import { getArtistSampleTracks } from "@/lib/spotify/listening";

/** Resolve one playable track for an artist (Scrapped artist-act soundtrack). */
export async function GET(request: Request) {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("id")?.trim();
  const artistName = searchParams.get("name")?.trim() || "";
  const avoid = searchParams.get("avoid")?.trim() || null;
  if (!artistId || !/^[A-Za-z0-9]+$/.test(artistId)) {
    return NextResponse.json({ error: "Invalid artist id" }, { status: 400 });
  }
  if (!artistName) {
    return NextResponse.json({ error: "Missing artist name" }, { status: 400 });
  }

  try {
    const samples = await getArtistSampleTracks(artistId, artistName, 5);
    const track =
      samples.find((t) => t.id !== avoid) ?? samples[0] ?? null;
    if (!track) {
      return NextResponse.json({ error: "No tracks" }, { status: 404 });
    }
    return NextResponse.json({
      trackId: track.id,
      uri: `spotify:track:${track.id}`,
      name: track.name,
      imageUrl: track.imageUrl,
    });
  } catch (err) {
    if (err instanceof SpotifyApiError) {
      console.error(
        "[artist-top-track]",
        err.status,
        err.message,
        err.quotaExceeded ? "quota" : "",
      );
      return NextResponse.json(
        { error: err.status === 429 ? "rate_limited" : "spotify_unavailable" },
        { status: err.status === 429 ? 429 : 502 },
      );
    }
    console.error(
      "[artist-top-track]",
      err instanceof Error ? err.name : "error",
    );
    return NextResponse.json({ error: "spotify_unavailable" }, { status: 502 });
  }
}
