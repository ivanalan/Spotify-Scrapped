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

/** Stable OAuth failure codes for `?spotify_error=` (never put raw Spotify prose in the URL). */
export type SpotifyOAuthErrorCode =
  | "not_allowlisted"
  | "token_exchange_failed"
  | "access_denied"
  | "state_mismatch";

export class SpotifyOAuthError extends Error {
  readonly code: SpotifyOAuthErrorCode;

  constructor(code: SpotifyOAuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = "SpotifyOAuthError";
    this.code = code;
  }
}

/** Gate copy for `spotify_error` query codes (and legacy ugly URL payloads). */
export function spotifyAuthGateMessage(code: string): string {
  switch (code) {
    case "not_allowlisted":
      return "Scrapped is in a limited Spotify beta — only a handful of testers can sign in right now. Once you’re added, try again.";
    case "access_denied":
      return "Spotify sign-in was cancelled.";
    case "state_mismatch":
      return "Sign-in expired. Try again.";
    case "token_exchange_failed":
      return "Sign-in didn’t work. Try again in a moment.";
    default:
      // Old redirects dumped JSON-parse exceptions into the query string.
      return "Sign-in didn’t work. Try again in a moment.";
  }
}

export function oauthErrorRedirectCode(error: unknown): string {
  if (error instanceof SpotifyOAuthError) return error.code;
  if (error instanceof Error && isAllowlistFailure(error.message)) {
    return "not_allowlisted";
  }
  return "token_exchange_failed";
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

function isAllowlistFailure(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("not registered") ||
    lower.includes("developer dashboard") ||
    lower.includes("user may not be registered")
  );
}

function throwTokenFailure(status: number, raw: string, parsed: TokenResponse | null): never {
  const description =
    parsed?.error_description || parsed?.error || raw.trim() || `Token request failed (${status})`;
  if (isAllowlistFailure(description) || isAllowlistFailure(raw)) {
    throw new SpotifyOAuthError("not_allowlisted");
  }
  throw new SpotifyOAuthError(
    "token_exchange_failed",
    description.slice(0, 180) || `Token request failed (${status})`,
  );
}

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

  const raw = await response.text();
  let parsed: TokenResponse | null = null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      parsed = JSON.parse(trimmed) as TokenResponse;
    } catch {
      throwTokenFailure(response.status, raw, null);
    }
  }

  if (!response.ok) {
    throwTokenFailure(response.status, raw, parsed);
  }

  if (!parsed?.access_token || typeof parsed.expires_in !== "number") {
    throwTokenFailure(response.status, raw, parsed);
  }

  return parsed;
}

export async function exchangeAuthorizationCode(code: string): Promise<SpotifySession> {
  const redirectUri = spotifyRedirectUri();
  const tokens = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  if (!tokens.refresh_token) {
    throw new SpotifyOAuthError(
      "token_exchange_failed",
      "Spotify did not return a refresh_token",
    );
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
