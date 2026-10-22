/** Extract a Spotify track id from a uri or bare id. */
export function trackIdFromUri(uriOrId: string): string {
  if (uriOrId.startsWith("spotify:track:")) {
    return uriOrId.slice("spotify:track:".length);
  }
  // Already an id (or unknown shape: caller may still use it).
  if (uriOrId.includes(":")) return "";
  return uriOrId;
}
