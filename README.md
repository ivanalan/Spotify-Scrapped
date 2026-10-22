# Spotify Scrapped

Anti-Wrapped for songs that got ghosted.

1. **Scrapped** (`/scrapped`): story deck from the Spotify Web API (no export)
2. **Scrapped Plus** (`/scrapped/plus`): skip story from your Extended Streaming History export
3. **Scrapped Lab** (`/scrapped/lab`): live metrics from the Spotify Web API as a searchable list

See [AGENTS.md](AGENTS.md), [docs/DATA.md](docs/DATA.md), and [docs/WRAPPED.md](docs/WRAPPED.md) (narrative / anti-Wrapped spine).

## Setup

1. (Scrapped Plus) Place your Spotify export under:

   ```
   data/raw/Spotify Extended Streaming History/
   ```

2. Install and ingest:

   ```bash
   npm install
   npm run ingest
   ```

3. Sign in to Spotify for Scrapped / Scrapped Lab (and Liked join on Scrapped Plus); set `AUTH_SECRET`, `AUTH_SPOTIFY_ID`, `AUTH_SPOTIFY_SECRET`, and `AUTH_URL` in `.env.local`. Dashboard redirect URI must be exactly `http://127.0.0.1:3000/api/spotify/callback` (not `localhost`). Then **Sign in to Spotify** in the nav.

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
