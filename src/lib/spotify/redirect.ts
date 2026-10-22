/** Exact Spotify redirect URI: must match the Developer Dashboard allowlist. */
export function spotifyRedirectUri(): string {
  const base = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
  return `${base}/api/spotify/callback`;
}
