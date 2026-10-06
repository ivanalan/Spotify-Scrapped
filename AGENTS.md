# AGENTS.md — Spotify Scrapped

Personal web app focused on **Spotify Scrapped** — an anti-Wrapped for songs that didn’t stick:

1. **Export Scrapped** (`/scrapped`) — skip-based story deck from Extended Streaming History (SQLite after ingest).
2. **API Lab** (`/scrapped/lab`) — same *intent* from Web API only (tops, recently played, liked, playlists). No skip stream.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Ionicons for icons
- Local SQLite via `better-sqlite3` (`data/processed/history.db`) for export Scrapped
- Ingest: `npm run ingest` → `scripts/ingest.ts`
- Spotify Web API OAuth (`src/lib/spotify/`, `/api/spotify/*`) for Liked join + API Lab

## Analysis vs enrichment

- **Export Scrapped source of truth:** Extended Streaming History (skips, `ms_played`, `reason_end`).
- **API Lab:** affinity windows + library timestamps — proxies for “didn’t stick,” not true skips.
- Access tokens stay server-side (`getSpotifyAccessToken` / `spotifyFetch`).

See **[docs/SPOTIFY_API.md](docs/SPOTIFY_API.md)** and **[docs/DATA.md](docs/DATA.md)**.

## Non-goals (for now)

- No Prune / Eras / Scatter surfaces
- No automatic playlist edits

## Data

- Raw export (gitignored): `data/raw/Spotify Extended Streaming History/`
- Processed DB (gitignored): `data/processed/history.db`
- Always-on agent rules: **[.cursor/rules/spotify-data.mdc](.cursor/rules/spotify-data.mdc)**

## Key invariants

- `ts` is stream **end** time (UTC), not start.
- `skipped` is unreliable before ~2022 — use `reason_end` + duration heuristics.
- Prefer `sum(ms_played)` over play counts for export analytics.
- Never persist or display `ip_addr`.
- Music entity key: `spotify_track_uri`.
- Spotify access tokens stay server-side.

## Layout

```
AGENTS.md
docs/DATA.md
docs/SPOTIFY_API.md
data/raw/                 # gitignored
data/processed/           # gitignored
scripts/ingest.ts
src/app/scrapped/         # deck + API lab
src/app/api/spotify/      # OAuth
src/lib/scrapped*.ts      # export + API metrics
src/lib/spotify/          # OAuth + listening helpers
src/components/scrapped/
```
