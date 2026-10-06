import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const DB_PATH = path.join(process.cwd(), "data", "processed", "history.db");

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS plays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  platform TEXT NOT NULL,
  ms_played INTEGER NOT NULL,
  conn_country TEXT NOT NULL,
  track_name TEXT,
  artist_name TEXT,
  album_name TEXT,
  spotify_track_uri TEXT,
  episode_name TEXT,
  episode_show_name TEXT,
  spotify_episode_uri TEXT,
  audiobook_title TEXT,
  audiobook_uri TEXT,
  audiobook_chapter_uri TEXT,
  audiobook_chapter_title TEXT,
  reason_start TEXT NOT NULL,
  reason_end TEXT NOT NULL,
  shuffle INTEGER NOT NULL,
  skipped INTEGER NOT NULL,
  offline INTEGER,
  offline_timestamp INTEGER,
  incognito_mode INTEGER NOT NULL,
  content_kind TEXT NOT NULL,
  is_skip INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plays_ts ON plays(ts);
CREATE INDEX IF NOT EXISTS idx_plays_track_uri ON plays(spotify_track_uri);
CREATE INDEX IF NOT EXISTS idx_plays_artist ON plays(artist_name);
CREATE INDEX IF NOT EXISTS idx_plays_is_skip ON plays(is_skip);
CREATE INDEX IF NOT EXISTS idx_plays_content_kind ON plays(content_kind);
CREATE INDEX IF NOT EXISTS idx_plays_kind_uri ON plays(content_kind, spotify_track_uri);
CREATE INDEX IF NOT EXISTS idx_plays_kind_skip_ts ON plays(content_kind, is_skip, ts);

-- Lifetime per-track stats (populated at ingest).
CREATE TABLE IF NOT EXISTS track_stats (
  spotify_track_uri TEXT PRIMARY KEY,
  track_name TEXT,
  artist_name TEXT,
  appearances INTEGER NOT NULL DEFAULT 0,
  skips INTEGER NOT NULL DEFAULT 0,
  ms_played_total INTEGER NOT NULL DEFAULT 0,
  first_ts TEXT,
  last_ts TEXT,
  last_skip_ts TEXT
);

-- Daily per-track rollups for recent-window filters.
CREATE TABLE IF NOT EXISTS track_day_stats (
  day TEXT NOT NULL,
  spotify_track_uri TEXT NOT NULL,
  appearances INTEGER NOT NULL DEFAULT 0,
  skips INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, spotify_track_uri)
);
CREATE INDEX IF NOT EXISTS idx_track_day_day ON track_day_stats(day);
CREATE INDEX IF NOT EXISTS idx_track_day_uri ON track_day_stats(spotify_track_uri);

-- Monthly artist listen time (all plays + excl skips).
CREATE TABLE IF NOT EXISTS month_artist_stats (
  month TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  ms_played INTEGER NOT NULL DEFAULT 0,
  ms_played_excl_skips INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (month, artist_name)
);

-- Monthly track listen time.
CREATE TABLE IF NOT EXISTS month_track_stats (
  month TEXT NOT NULL,
  spotify_track_uri TEXT NOT NULL,
  track_name TEXT,
  artist_name TEXT,
  ms_played INTEGER NOT NULL DEFAULT 0,
  ms_played_excl_skips INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (month, spotify_track_uri)
);
CREATE INDEX IF NOT EXISTS idx_month_track_uri ON month_track_stats(spotify_track_uri);
`;

function trackStatsHasAppearances(db: Database.Database): boolean {
  try {
    const cols = db.prepare(`PRAGMA table_info(track_stats)`).all() as {
      name: string;
    }[];
    return cols.some((c) => c.name === "appearances");
  } catch {
    return false;
  }
}

/** Create/migrate tables. Call from ingest (and any write path), not every page read. */
export function ensureSchema(db: Database.Database): void {
  if (!trackStatsHasAppearances(db)) {
    db.exec(`DROP TABLE IF EXISTS track_stats`);
  }
  db.exec(SCHEMA_SQL);
}

export type OpenDbOptions = {
  /** When true, run CREATE IF NOT EXISTS / track_stats migration. Default false. */
  migrate?: boolean;
};

export function openDb(
  dbPath: string = DB_PATH,
  options: OpenDbOptions = {},
): Database.Database {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  if (options.migrate) {
    ensureSchema(db);
  }
  return db;
}

export function dbExists(dbPath: string = DB_PATH): boolean {
  return fs.existsSync(dbPath);
}

/** True when ingest has populated analytics rollups. */
export function aggregatesReady(db: Database.Database): boolean {
  try {
    if (!trackStatsHasAppearances(db)) return false;
    const track = db
      .prepare(`SELECT COUNT(*) AS n FROM track_stats`)
      .get() as { n: number };
    const day = db
      .prepare(`SELECT COUNT(*) AS n FROM track_day_stats`)
      .get() as { n: number };
    const month = db
      .prepare(`SELECT COUNT(*) AS n FROM month_track_stats`)
      .get() as { n: number };
    return track.n > 0 && day.n > 0 && month.n > 0;
  } catch {
    return false;
  }
}

/** Rebuild analytics rollup tables from `plays`. Call after ingest. */
export function rebuildAggregates(db: Database.Database): void {
  ensureSchema(db);

  db.exec(`
    DELETE FROM track_stats;
    DELETE FROM track_day_stats;
    DELETE FROM month_artist_stats;
    DELETE FROM month_track_stats;
  `);

  db.exec(`
    INSERT INTO track_stats (
      spotify_track_uri, track_name, artist_name,
      appearances, skips, ms_played_total, first_ts, last_ts, last_skip_ts
    )
    SELECT
      spotify_track_uri,
      MAX(track_name) AS track_name,
      MAX(artist_name) AS artist_name,
      COUNT(*) AS appearances,
      SUM(is_skip) AS skips,
      COALESCE(SUM(ms_played), 0) AS ms_played_total,
      MIN(ts) AS first_ts,
      MAX(ts) AS last_ts,
      MAX(CASE WHEN is_skip = 1 THEN ts END) AS last_skip_ts
    FROM plays
    WHERE content_kind = 'track'
      AND spotify_track_uri IS NOT NULL
    GROUP BY spotify_track_uri
  `);

  db.exec(`
    INSERT INTO track_day_stats (day, spotify_track_uri, appearances, skips)
    SELECT
      substr(ts, 1, 10) AS day,
      spotify_track_uri,
      COUNT(*) AS appearances,
      SUM(is_skip) AS skips
    FROM plays
    WHERE content_kind = 'track'
      AND spotify_track_uri IS NOT NULL
    GROUP BY day, spotify_track_uri
  `);

  db.exec(`
    INSERT INTO month_artist_stats (month, artist_name, ms_played, ms_played_excl_skips)
    SELECT
      strftime('%Y-%m', ts) AS month,
      artist_name,
      COALESCE(SUM(ms_played), 0) AS ms_played,
      COALESCE(SUM(CASE WHEN is_skip = 0 THEN ms_played ELSE 0 END), 0) AS ms_played_excl_skips
    FROM plays
    WHERE content_kind = 'track'
      AND artist_name IS NOT NULL
      AND artist_name != ''
    GROUP BY month, artist_name
  `);

  db.exec(`
    INSERT INTO month_track_stats (
      month, spotify_track_uri, track_name, artist_name,
      ms_played, ms_played_excl_skips
    )
    SELECT
      strftime('%Y-%m', ts) AS month,
      spotify_track_uri,
      MAX(track_name) AS track_name,
      MAX(artist_name) AS artist_name,
      COALESCE(SUM(ms_played), 0) AS ms_played,
      COALESCE(SUM(CASE WHEN is_skip = 0 THEN ms_played ELSE 0 END), 0) AS ms_played_excl_skips
    FROM plays
    WHERE content_kind = 'track'
      AND spotify_track_uri IS NOT NULL
    GROUP BY month, spotify_track_uri
  `);
}

export function getPlayCount(db: Database.Database): number {
  const row = db.prepare("SELECT COUNT(*) AS n FROM plays").get() as { n: number };
  return row.n;
}

export type CorpusSummary = {
  playCount: number;
  listenHours: number;
  uniqueTracks: number;
  firstTs: string | null;
  lastTs: string | null;
};

export function getCorpusSummary(db: Database.Database): CorpusSummary {
  const row = db
    .prepare(
      `
      SELECT
        COUNT(*) AS play_count,
        COALESCE(SUM(ms_played), 0) AS ms_total,
        COUNT(DISTINCT spotify_track_uri) AS unique_tracks,
        MIN(ts) AS first_ts,
        MAX(ts) AS last_ts
      FROM plays
      WHERE content_kind = 'track'
    `,
    )
    .get() as {
    play_count: number;
    ms_total: number;
    unique_tracks: number;
    first_ts: string | null;
    last_ts: string | null;
  };

  return {
    playCount: row.play_count,
    listenHours: row.ms_total / 3_600_000,
    uniqueTracks: row.unique_tracks,
    firstTs: row.first_ts,
    lastTs: row.last_ts,
  };
}
