import { SPOTIFY_SCOPES } from "./scopes";
import { spotifyRedirectUri } from "./redirect";
import type { SpotifySession } from "./session";

function credentials() {
  const clientId = process.env.AUTH_SPOTIFY_ID;
  const clientSecret = process.env.AUTH_SPOTIFY_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AUTH_SPOTIFY_ID and AUTH_SPOTIFY_SECRET are required");
  }
  return { clientId, clientSecret };
}

export function buildAuthorizeUrl(state: string): string {
  const { clientId } = credentials();
  const redirectUri = spotifyRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: "false",
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const { clientId, clientSecret } = credentials();
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams(body),
    cache: "no-store",
  });
  const json = (await response.json()) as TokenResponse;
  if (!response.ok) {
    throw new Error(
      json.error_description || json.error || `Token request failed (${response.status})`,
    );
  }
  return json;
}

export async function exchangeAuthorizationCode(code: string): Promise<SpotifySession> {
  const redirectUri = spotifyRedirectUri();
  const tokens = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  if (!tokens.refresh_token) {
    throw new Error("Spotify did not return a refresh_token");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifySession> {
  const tokens = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
  };
}
