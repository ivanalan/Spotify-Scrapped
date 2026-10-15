# AGENTS.md — Spotify Scrapped

Personal web app focused on **Spotify Scrapped** — an anti-Wrapped for songs that didn’t stick:

1. **Scrapped** (`/scrapped`) — story deck from Spotify Web API only (tops, recently played, liked, playlists). Affinity proxies, not true skips.
2. **Scrapped Plus** (`/scrapped/plus`) — skip-based story deck from Extended Streaming History (SQLite after ingest).
3. **Scrapped Lab** (`/scrapped/lab`) — same API metrics as a searchable list (calculated, means, bar definitions).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Ionicons for icons
- Local SQLite via `better-sqlite3` (`data/processed/history.db`) for Scrapped Plus
- Ingest: `npm run ingest` → `scripts/ingest.ts`
- Spotify Web API OAuth (`src/lib/spotify/`, `/api/spotify/*`) for Scrapped, Scrapped Lab, and Liked join on Plus

## Analysis vs enrichment

- **Scrapped Plus source of truth:** Extended Streaming History (skips, `ms_played`, `reason_end`).
- **Scrapped / Scrapped Lab:** affinity windows + library timestamps — proxies for “didn’t stick,” not true skips.
- Access tokens stay server-side (`getSpotifyAccessToken` / `spotifyFetch`).

See **[docs/SPOTIFY_API.md](docs/SPOTIFY_API.md)**, **[docs/DATA.md](docs/DATA.md)**, and **[docs/WRAPPED.md](docs/WRAPPED.md)** (Wrapped beat grammar → Scrapped narrative).

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
docs/WRAPPED.md            # Wrapped UX → Scrapped story spine
data/raw/                 # gitignored
data/processed/           # gitignored
scripts/ingest.ts
src/app/scrapped/         # main deck + Plus + Lab
src/app/api/spotify/      # OAuth
src/lib/scrapped*.ts      # export + API metrics
src/lib/spotify/          # OAuth + listening helpers
src/components/scrapped/
```
