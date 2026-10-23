import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  exchangeAuthorizationCode,
  oauthErrorRedirectCode,
  SpotifyOAuthError,
} from "@/lib/spotify/oauth";
import { spotifyRedirectUri } from "@/lib/spotify/redirect";
import { attachSpotifySessionCookie } from "@/lib/spotify/session";

function errorRedirect(base: string, code: string) {
  return NextResponse.redirect(
    `${base}/?spotify_error=${encodeURIComponent(code)}`,
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const base = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

  if (error) {
    const redirectCode =
      error === "access_denied" ? "access_denied" : "token_exchange_failed";
    return errorRedirect(base, redirectCode);
  }

  const jar = await cookies();
  const expected = jar.get("spotify_oauth_state")?.value;

  if (!code || !state || !expected || state !== expected) {
    const res = errorRedirect(base, "state_mismatch");
    res.cookies.delete("spotify_oauth_state");
    return res;
  }

  try {
    const session = await exchangeAuthorizationCode(code);

    const meRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    if (meRes.ok) {
      const me = (await meRes.json()) as {
        id?: string;
        display_name?: string | null;
        email?: string | null;
      };
      session.userId = me.id;
      session.displayName = me.display_name ?? null;
      session.email = me.email ?? null;
    } else if (meRes.status === 403) {
      // Dev Mode: authorize can succeed; API rejects non-allowlisted users.
      throw new SpotifyOAuthError("not_allowlisted");
    }

    const res = NextResponse.redirect(`${base}/`);
    res.cookies.delete("spotify_oauth_state");
    await attachSpotifySessionCookie(res, session);
    return res;
  } catch (e) {
    const redirectCode = oauthErrorRedirectCode(e);
    const message = e instanceof Error ? e.message : redirectCode;
    console.error(
      "[spotify oauth]",
      redirectCode,
      message,
      "redirect_uri=",
      spotifyRedirectUri(),
    );
    const res = errorRedirect(base, redirectCode);
    res.cookies.delete("spotify_oauth_state");
    return res;
  }
}
