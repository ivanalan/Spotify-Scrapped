import { NextResponse } from "next/server";
import { spotifyRedirectUri } from "@/lib/spotify";

/** Local helper: shows the redirect URI used for Spotify OAuth (no secrets). */
export async function GET(request: Request) {
  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL ?? null,
    expectedRedirectUri: spotifyRedirectUri(),
    requestHost: request.headers.get("host"),
    hint: "Spotify Dashboard → Redirect URIs must match expectedRedirectUri exactly.",
  });
}
