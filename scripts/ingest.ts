import fs from "node:fs";
import path from "node:path";
import { openDb, rebuildAggregates } from "../src/lib/db";
import { normalizeEvent } from "../src/lib/normalize";
import type { RawStreamEvent, StreamEvent } from "../src/lib/types";

const RAW_DIR = path.join(
  process.cwd(),
  "data",
  "raw",
  "Spotify Extended Streaming History",
);
const DB_PATH = path.join(process.cwd(), "data", "processed", "history.db");

function listHistoryFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    throw new Error(
      `Raw export not found at ${dir}\nPlace Spotify Extended Streaming History JSON files there, then re-run.`,
    );
  }
  return fs
    .readdirSync(dir)
    .filter((name) => /^Streaming_History_(Audio|Video)_.*\.json$/i.test(name))
    .map((name) => path.join(dir, name))
    .sort();
}

function loadAllEvents(files: string[]): RawStreamEvent[] {
  const events: RawStreamEvent[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as RawStreamEvent[];
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected array in ${file}`);
    }
    events.push(...parsed);
    console.log(`  loaded ${parsed.length.toLocaleString()} from ${path.basename(file)}`);
  }
  return events;
}

function insertPlays(events: StreamEvent[]): void {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  const db = openDb(DB_PATH, { migrate: true });

  const insert = db.prepare(`
    INSERT INTO plays (
      ts, platform, ms_played, conn_country,
      track_name, artist_name, album_name, spotify_track_uri,
      episode_name, episode_show_name, spotify_episode_uri,
      audiobook_title, audiobook_uri, audiobook_chapter_uri, audiobook_chapter_title,
      reason_start, reason_end, shuffle, skipped, offline, offline_timestamp,
      incognito_mode, content_kind, is_skip
    ) VALUES (
      @ts, @platform, @ms_played, @conn_country,
      @track_name, @artist_name, @album_name, @spotify_track_uri,
      @episode_name, @episode_show_name, @spotify_episode_uri,
      @audiobook_title, @audiobook_uri, @audiobook_chapter_uri, @audiobook_chapter_title,
      @reason_start, @reason_end, @shuffle, @skipped, @offline, @offline_timestamp,
      @incognito_mode, @content_kind, @is_skip
    )
  `);

  const toRow = (e: StreamEvent) => ({
    ...e,
    shuffle: e.shuffle ? 1 : 0,
    skipped: e.skipped ? 1 : 0,
    offline: e.offline === null || e.offline === undefined ? null : e.offline ? 1 : 0,
    incognito_mode: e.incognito_mode ? 1 : 0,
    is_skip: e.is_skip ? 1 : 0,
  });

  const tx = db.transaction((rows: StreamEvent[]) => {
    for (const row of rows) {
      insert.run(toRow(row));
    }
  });

  tx(events);

  console.log("Building analytics aggregates…");
  rebuildAggregates(db);

  const trackStats = db
    .prepare(`SELECT COUNT(*) AS n FROM track_stats`)
    .get() as { n: number };
  const monthTracks = db
    .prepare(`SELECT COUNT(*) AS n FROM month_track_stats`)
    .get() as { n: number };
  console.log(
    `  track_stats: ${trackStats.n.toLocaleString()} · month_track_stats: ${monthTracks.n.toLocaleString()}`,
  );

  db.close();
}

function main(): void {
  console.log("Ingesting Spotify Extended Streaming History…");
  console.log(`Raw dir: ${RAW_DIR}`);

  const files = listHistoryFiles(RAW_DIR);
  console.log(`Found ${files.length} history files`);

  const rawEvents = loadAllEvents(files);
  rawEvents.sort((a, b) => a.ts.localeCompare(b.ts));

  const normalized = rawEvents.map(normalizeEvent);
  const skipCount = normalized.filter((e) => e.is_skip).length;
  const trackCount = normalized.filter((e) => e.content_kind === "track").length;

  console.log(`Normalizing ${normalized.length.toLocaleString()} events…`);
  console.log(`  tracks: ${trackCount.toLocaleString()}`);
  console.log(`  is_skip: ${skipCount.toLocaleString()} (${((skipCount / normalized.length) * 100).toFixed(1)}%)`);
  console.log(`  range: ${normalized[0]?.ts ?? "—"} → ${normalized.at(-1)?.ts ?? "—"}`);

  insertPlays(normalized);
  console.log(`Wrote ${DB_PATH}`);
  console.log("Done.");
}

main();
