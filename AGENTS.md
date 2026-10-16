# AGENTS.md — Spotify Scrapped

Personal web app focused on **Spotify Scrapped** — an anti-Wrapped for songs that didn’t stick:

1. **Scrapped** (`/scrapped`) — story deck from Spotify Web API only (tops, recently played, liked, playlists). Affinity proxies, not true skips.
2. **Scrapped Plus** (`/scrapped/plus`) — skip-based story deck from Extended Streaming History (SQLite after ingest).
3. **Scrapped Lab** (`/scrapped/lab`) — same API metrics as a searchable list (calculated, means, bar definitions).

## Agent memory

> The file is the memory, not the conversation.

| File | Answers |
|------|---------|
| [AGENTS.md](AGENTS.md) | How do we work here? |
| [SOUL.md](SOUL.md) | What must we protect? |
| [SCARS.md](SCARS.md) | What has already hurt us? |
| [docs/decisions/](docs/decisions/) | What did we choose, and at what cost? |

Portable kit (copy to other repos): [docs/agent-framework/README.md](docs/agent-framework/README.md).

**Loop:** Start (read SOUL; SCARS if diagnosing) → Plan → Build → Decide (`D-NNN`) → Hand off (append SCARS if something hurt). Ship docs in the **same commit** as the change. Point to sources of truth — don’t paste them everywhere. Name the incident when you add a rule.

Always-on rules: [.cursor/rules/agent-memory.mdc](.cursor/rules/agent-memory.mdc), [.cursor/rules/spotify-data.mdc](.cursor/rules/spotify-data.mdc).

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

See **[docs/SPOTIFY_API.md](docs/SPOTIFY_API.md)**, **[docs/DATA.md](docs/DATA.md)**, and **[docs/WRAPPED.md](docs/WRAPPED.md)** (Wrapped beat grammar → Scrapped narrative). Official Wrapped **motion** keyframes: **[docs/mocks/wrapped-ref/](docs/mocks/wrapped-ref/)** (see WRAPPED.md §10). Story copy vs 5-row list motion: **[D-001](docs/decisions/D-001-story-copy-vs-list-motion.md)**.

## Non-goals (for now)

- No Prune / Eras / Scatter surfaces
- No automatic playlist edits

## Data

- Raw export (gitignored): `data/raw/Spotify Extended Streaming History/`
- Processed DB (gitignored): `data/processed/history.db`

## Key invariants

- `ts` is stream **end** time (UTC), not start.
- `skipped` is unreliable before ~2022 — use `reason_end` + duration heuristics.
- Prefer `sum(ms_played)` over play counts for export analytics.
- Never persist or display `ip_addr`.
- Music entity key: `spotify_track_uri`.
- Spotify access tokens stay server-side.
- Story **copy** motion is shared across slides; only the numbered 5-row list pattern is special ([D-001](docs/decisions/D-001-story-copy-vs-list-motion.md), [SOUL.md](SOUL.md)).

## Layout

```
AGENTS.md
SOUL.md
SCARS.md
docs/agent-framework/     # portable kit
docs/decisions/           # D-NNN locked choices
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
