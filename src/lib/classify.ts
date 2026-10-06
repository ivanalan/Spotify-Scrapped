import type { ContentKind, RawStreamEvent } from "./types";

export function classifyContent(event: RawStreamEvent): ContentKind {
  if (event.audiobook_uri || event.audiobook_chapter_uri) return "audiobook";
  if (event.spotify_episode_uri || (event.episode_name && !event.spotify_track_uri)) {
    return "episode";
  }
  if (event.spotify_track_uri || event.master_metadata_track_name) return "track";
  return "unknown";
}
