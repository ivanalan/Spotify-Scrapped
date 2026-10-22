/** Open Spotify web URLs for in-deck attribution link-backs. */

export function spotifyTrackUrl(trackId: string): string {
  return `https://open.spotify.com/track/${encodeURIComponent(trackId)}`;
}

export function spotifyArtistUrl(artistId: string): string {
  return `https://open.spotify.com/artist/${encodeURIComponent(artistId)}`;
}

/**
 * Story tap zones sit above slide content. On zone click, hit-test for a
 * Spotify open link underneath so covers/rows can still link out.
 */
export function spotifyOpenLinkFromPoint(
  clientX: number,
  clientY: number,
): HTMLAnchorElement | null {
  if (typeof document === "undefined") return null;
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const el of stack) {
    if (!(el instanceof Element)) continue;
    const link = el.closest("a[data-spotify-open]");
    if (link instanceof HTMLAnchorElement && link.href) return link;
  }
  return null;
}
