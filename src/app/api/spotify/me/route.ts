import { NextResponse } from "next/server";
import {
  getSpotifyAccessToken,
  getSpotifyProfile,
  SpotifyApiError,
} from "@/lib/spotify";

export async function GET() {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  try {
    const profile = await getSpotifyProfile();
    return NextResponse.json({
      connected: true,
      id: profile.id,
      display_name: profile.display_name,
      product: profile.product,
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      console.error("[spotify/me]", error.status, error.message);
      return NextResponse.json(
        {
          connected: true,
          error: error.status === 429 ? "rate_limited" : "spotify_unavailable",
        },
        { status: error.status === 429 ? 429 : error.status },
      );
    }
    throw error;
  }
}
