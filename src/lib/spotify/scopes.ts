/**
 * Scopes for Scrapped: library + tops + recently played + playlists.
 * Re-consent is required if you add scopes later.
 *
 * Docs: https://developer.spotify.com/documentation/web-api/concepts/scopes
 */
export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
].join(" ");
