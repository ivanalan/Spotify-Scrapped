# Spotify Extended Streaming History — Data Knowledge Base

**Export path (local, gitignored):** `data/raw/Spotify Extended Streaming History/`  
**Export mtime:** 2025-09-30  
**Corpus size:** ~155 MB, **205,660** play events across 27 JSON files + official PDF.

Agents should read this before changing ingest, skip logic, or analytics.

---

## 1. Inventory

| Kind | Pattern | Records (approx.) |
|------|---------|-------------------|
| Audio | `Streaming_History_Audio_YYYY[_N].json` | 205,180 |
| Video | `Streaming_History_Video_YYYY.json` | 480 |
| Docs | `ReadMeFirst_ExtendedStreamingHistory.pdf` | — |

**Date range:** 2017-11-23 → 2026 (partial at both ends).  
**Naming:** When a year exceeds ~15k events, Spotify splits with `_1` (continuous in time).

**Totals of interest:**

| Metric | Value |
|--------|--------|
| Unique `spotify_track_uri` | ~30,411 |
| Unique `(track, artist)` pairs | ~26,792 |
| Unique artists | ~9,200 |
| Total listen time | ~6,635 hours |
| Podcast/episode rows | ~1.2k |
| Audiobook rows | ~10 |

---

## 2. Schema

Top-level: JSON **array** of objects. One object = one ended stream (not a unique daily listen).

**23 fields** (identical across audio/video/years):

| Field | Type | Notes |
|-------|------|--------|
| `ts` | ISO-8601 UTC string | **End** time of the play. Start ≈ `ts - ms_played`. |
| `platform` | string | Values drift (`Android OS …` → `ios` / `osx` / `windows`). |
| `ms_played` | integer | Milliseconds listened. Some rows are `0`. |
| `conn_country` | string | ISO country code. |
| `ip_addr` | string | **PII** — never commit, log, or show in UI. Strip at ingest. |
| `master_metadata_track_name` | string \| null | Track title. |
| `master_metadata_album_artist_name` | string \| null | Primary artist. |
| `master_metadata_album_album_name` | string \| null | Album. |
| `spotify_track_uri` | string \| null | Best stable music ID (`spotify:track:…`). |
| `episode_name` | string \| null | Podcast / video episode. |
| `episode_show_name` | string \| null | Show name. |
| `spotify_episode_uri` | string \| null | `spotify:episode:…`. |
| `audiobook_title` | string \| null | Audiobook title. |
| `audiobook_uri` | string \| null | Often `spotify:show:…`. |
| `audiobook_chapter_uri` | string \| null | Often `spotify:episode:…`. |
| `audiobook_chapter_title` | string \| null | Chapter title. |
| `reason_start` | string | Why playback started. |
| `reason_end` | string | Why playback ended. |
| `shuffle` | boolean | Shuffle mode. |
| `skipped` | boolean | Explicit skip flag — **unreliable before ~2022**. |
| `offline` | boolean \| null | Nullable on some video rows. |
| `offline_timestamp` | integer \| null | Unix seconds; may be set even when `offline` is false. |
| `incognito_mode` | boolean | Private session. |

There is **no** `itemType` field. Classify by which URI/metadata fields are set.

### Content classification

| Kind | Rule |
|------|------|
| Music track | `spotify_track_uri != null` |
| Podcast / episode | `spotify_episode_uri != null` (or episode fields with null track URI) |
| Audiobook | `audiobook_uri` or `audiobook_chapter_uri` set |

**Audio vs video:** same schema. Older video files are often Canvas-style episodes; newer video files are often short music-video previews (skip-heavy). Prefer analyzing **audio** for Scrapped Plus export features, or merge carefully.

---

## 3. `reason_start` / `reason_end`

Observed `reason_end` values include:  
`trackdone`, `fwdbtn`, `endplay`, `logout`, `unexpected-exit-while-paused`, `backbtn`, `remote`, `unknown`, `unexpected-exit`, `trackerror`, `switched-to-video`, `clickrow`.

Observed `reason_start` values include:  
`trackdone`, `fwdbtn`, `clickrow`, `playbtn`, `appload`, `backbtn`, `remote`, `unknown`, `trackerror`, `switched-to-audio`, `switched-to-video`.

Rough corpus mix: ~46% `trackdone`, ~23% `fwdbtn`, ~21% `endplay`.

---

## 4. Skips (critical)

### `skipped` boolean caveats

- Pre-~2022: `skipped` is almost always `false`, even when `reason_end == "fwdbtn"`.
- From 2022 onward, `skipped` becomes meaningful; skip rates climb (roughly 30–40% of rows in 2023–2026).

**Do not use `skipped` alone for historical skip analytics.**

### Recommended skip heuristic (v1)

Treat as skipped if any of:

1. `skipped === true`
2. `reason_end` in (`fwdbtn`, `endplay`, `backbtn`)
3. `ms_played < 30_000` (tunable)

Do **not** treat as skips by default: `trackdone`, most `logout` / `unexpected-exit-*` with substantial `ms_played`.

Video rows are disproportionately skip-flagged (~68%); exclude or separate for music analytics.

---

## 5. Scrapped Plus (`/scrapped/plus`)

**Goal:** anti-Wrapped story from play-by-play skips for a calendar year (default 2026).

Implemented in `src/lib/scrapped.ts` / `src/lib/load-scrapped.ts`:

1. Label each play as skip/not-skip at ingest (`is_skip` — see §4).
2. Filter `content_kind = 'track'` with non-null `spotify_track_uri` for the year window.
3. Aggregate appearances, skips, finish rates (`reason_end = trackdone`), H1/H2 arcs.
4. Optional Liked join via Web API (`GET /me/tracks`) for “liked but scrapped.”

Prefer `sum(ms_played)` and skip heuristics over raw play counts. Entity key: `spotify_track_uri`.

**Scrapped** (`/scrapped`) and **Scrapped Lab** (`/scrapped/lab`) do **not** use this export — see [SPOTIFY_API.md](SPOTIFY_API.md).

---

## 6. Privacy

- Contains IP addresses, fine-grained timestamps, and travel/country signals.
- Ingest **must strip `ip_addr`**.
- Never commit `data/raw/` or `data/processed/`.
- Treat examples in docs as redacted when sharing.

---

## 7. Optional enrichment sources

| Source | What it adds | Needed for |
|--------|--------------|------------|
| Spotify **Web API** (OAuth) | Liked Songs, tops, recently played, playlists | Scrapped + Scrapped Lab + Plus Liked join |

OAuth setup and `spotifyFetch`: **[docs/SPOTIFY_API.md](SPOTIFY_API.md)**.

Neither API surface replaces Extended Streaming History for lifetime play-by-play / true skips.

---

## 8. Ingest checklist

1. Load all `Streaming_History_*.json` arrays; concat; sort by `ts`.
2. Classify `track` / `episode` / `audiobook`.
3. Strip `ip_addr`.
4. Apply skip heuristic; store both raw signals and derived `is_skip`.
5. Write SQLite (`data/processed/history.db`) — `plays` plus analytics rollups.
6. Dedup policy: rows are not guaranteed unique; decide per aggregate whether duplicates matter.

### Analytics tables (built at ingest)

| Table | Purpose |
|-------|---------|
| `track_stats` | Lifetime per-URI appearances, skips, `ms_played_total`, first/last/`last_skip_ts` |
| `track_day_stats` | Daily appearances/skips per URI |
| `month_artist_stats` | Monthly artist `ms_played` (+ excl-skips) |
| `month_track_stats` | Monthly track `ms_played` (+ excl-skips) |

`npm run ingest` rewrites the DB and calls `rebuildAggregates`. Scrapped Plus primarily queries `plays` for the year window.
