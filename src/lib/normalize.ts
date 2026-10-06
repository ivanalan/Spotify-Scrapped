import { classifyContent } from "./classify";
import { isSkip } from "./skip";
import type { RawStreamEvent, StreamEvent } from "./types";

/** Strip PII and derive content_kind + is_skip. Never keep ip_addr. */
export function normalizeEvent(raw: RawStreamEvent): StreamEvent {
  const { ip_addr: _ip, ...rest } = raw;
  void _ip;

  return {
    ts: rest.ts,
    platform: rest.platform,
    ms_played: rest.ms_played,
    conn_country: rest.conn_country,
    track_name: rest.master_metadata_track_name,
    artist_name: rest.master_metadata_album_artist_name,
    album_name: rest.master_metadata_album_album_name,
    spotify_track_uri: rest.spotify_track_uri,
    episode_name: rest.episode_name,
    episode_show_name: rest.episode_show_name,
    spotify_episode_uri: rest.spotify_episode_uri,
    audiobook_title: rest.audiobook_title,
    audiobook_uri: rest.audiobook_uri,
    audiobook_chapter_uri: rest.audiobook_chapter_uri,
    audiobook_chapter_title: rest.audiobook_chapter_title,
    reason_start: rest.reason_start,
    reason_end: rest.reason_end,
    shuffle: rest.shuffle,
    skipped: rest.skipped,
    offline: rest.offline,
    offline_timestamp: rest.offline_timestamp,
    incognito_mode: rest.incognito_mode,
    content_kind: classifyContent(raw),
    is_skip: isSkip(raw),
  };
}
