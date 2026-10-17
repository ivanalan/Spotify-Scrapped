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
- **UI primitives:** shadcn under `src/components/ui/` for standard controls (Button, AlertDialog, etc.) — [D-003](docs/decisions/D-003-shadcn-standard-controls.md)
- **UI type:** Poppins (`@fontsource/poppins`) via `--font-sans` / `--font-heading` / `--font-display` in `src/app/globals.css`. Type roles: `text-display`, `text-title`, `text-body`, `text-caption`.
- **Viewport:** mobile-first practices, responsive full-bleed surfaces ([D-002](docs/decisions/D-002-poppins-mobile-first.md), [SOUL.md](SOUL.md)).
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
- Typeface is Poppins; layouts are mobile-first and responsive full-bleed ([D-002](docs/decisions/D-002-poppins-mobile-first.md)).
- Standard buttons/controls use shadcn (`src/components/ui/`), not hand-rolled skins ([D-003](docs/decisions/D-003-shadcn-standard-controls.md)).
- Auth copy is **sign in** / **sign out** only — not log in/out or connect/disconnect ([D-004](docs/decisions/D-004-sign-in-sign-out-copy.md)).
- API story deck copy is **handwritten** and locked — don’t regenerate lines casually ([D-005](docs/decisions/D-005-handwritten-api-story-copy.md)).
- API story headlines: ≤6 words, open compounds, **favs**, **1 like** ([D-006](docs/decisions/D-006-api-story-headline-style.md)).

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
