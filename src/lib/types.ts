/** Raw Spotify Extended Streaming History record (before PII strip). */
export type RawStreamEvent = {
  ts: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr?: string | null;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean | null;
  offline_timestamp: number | null;
  incognito_mode: boolean;
};

export type ContentKind = "track" | "episode" | "audiobook" | "unknown";

/** Normalized play row stored in SQLite (no IP). */
export type StreamEvent = {
  id?: number;
  ts: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  track_name: string | null;
  artist_name: string | null;
  album_name: string | null;
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean | null;
  offline_timestamp: number | null;
  incognito_mode: boolean;
  content_kind: ContentKind;
  is_skip: boolean;
};

export type TrackAggregate = {
  spotify_track_uri: string | null;
  track_name: string | null;
  artist_name: string | null;
  play_count: number;
  skip_count: number;
  ms_played_total: number;
  first_ts: string;
  last_ts: string;
};

export type SkipHeuristicOptions = {
  /** Treat plays shorter than this as skips. Default 30_000. */
  shortPlayMs?: number;
  /** reason_end values that count as skips. */
  skipEndReasons?: readonly string[];
};
