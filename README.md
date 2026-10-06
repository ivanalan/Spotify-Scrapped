# Spotify Scrapped

Anti-Wrapped for songs that didn’t stick.

1. **Scrapped** (`/scrapped`) — skip story from your Extended Streaming History export
2. **API Lab** (`/scrapped/lab`) — live metrics from the Spotify Web API only (no export)

See [AGENTS.md](AGENTS.md), [docs/DATA.md](docs/DATA.md), and [docs/SPOTIFY_API.md](docs/SPOTIFY_API.md).

## Setup

1. (Export Scrapped) Place your Spotify export under:

   ```
   data/raw/Spotify Extended Streaming History/
   ```

2. Install and ingest:

   ```bash
   npm install
   npm run ingest
   ```

3. Connect Spotify for the API Lab (and Liked join on export Scrapped) — copy `.env.example` → `.env.local`, add dashboard credentials, redirect URI `http://127.0.0.1:3000/api/spotify/callback` (not `localhost`), then **Connect Spotify** in the nav. Details in [docs/SPOTIFY_API.md](docs/SPOTIFY_API.md).

4. Run the app:

   ```bash
   npm run dev
   ```

   Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run ingest` | Normalize JSON → SQLite |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Privacy

- `data/raw/`, `data/processed/`, and `.env*` are gitignored
- Never commit streaming history, IP addresses, or OAuth secrets
